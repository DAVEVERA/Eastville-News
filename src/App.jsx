import React, { useState, useEffect, useRef } from 'react';
import { config } from './config';
import initialNewsData from './data/news.json';
import NewsTicker from './components/NewsTicker';
import MainSlider from './components/MainSlider';
import { WeatherWidget, TrafficWidget, SmartStackWidget } from './components/Widgets';
import Admin from './components/Admin';
import { fetchRSS, fetchWebTitles } from './dataService';

// Eigen server als gedeelde databron (synct alle schermen)
const NEWS_API_URL = 'https://davevera.nl/oo-news.php';
const NEWS_API_KEY = 'oo2026admin';

const fetchRemoteNews = async () => {
  try {
    const res = await fetch(NEWS_API_URL);
    if (!res.ok) return null;
    const data = await res.json();
    return Object.keys(data).length ? data : null;
  } catch {
    return null;
  }
};

const saveRemoteNews = async (data) => {
  try {
    await fetch(`${NEWS_API_URL}?key=${NEWS_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.error('Opslaan mislukt:', err);
  }
};

const SNAP = 20;
const WIDGET_STORAGE_KEY = 'oo_widget_states';

const applyLocalWidgetPositions = (data) => {
  try {
    const saved = localStorage.getItem(WIDGET_STORAGE_KEY);
    if (!saved) return data;
    const positions = JSON.parse(saved);
    return {
      ...data,
      widgets: (data.widgets || []).map(w => ({ ...w, ...(positions[w.id] || {}) }))
    };
  } catch {
    return data;
  }
};

const saveWidgetStates = (widgets) => {
  try {
    const states = {};
    widgets.forEach(w => { states[w.id] = { px: w.px, py: w.py, size: w.size }; });
    localStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(states));
  } catch {}
};

// Serialize everything except widget positions (those are per-screen via localStorage)
const serializeForComparison = (data) => {
  const { widgets, ...rest } = data;
  return JSON.stringify(rest);
};

function App() {
  const [newsData, setNewsData] = useState(() => applyLocalWidgetPositions(initialNewsData));
  const [tickerItems, setTickerItems] = useState(initialNewsData.ticker);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const lastRemoteRef = useRef(null);

  // Fetch from server on load and poll every 3 minutes — syncs all screens
  useEffect(() => {
    const loadRemote = async () => {
      const data = await fetchRemoteNews();
      if (data) {
        const serialized = serializeForComparison(data);
        if (serialized !== lastRemoteRef.current) {
          lastRemoteRef.current = serialized;
          setNewsData(applyLocalWidgetPositions(data));
        }
      }
    };
    loadRemote();
    const interval = setInterval(loadRemote, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // RSS + Web title fetching in parallel
  useEffect(() => {
    const updateTicker = async () => {
      const base = [...newsData.ticker];

      const rssPromises = (newsData.rssSources || []).map(source => {
        const url = typeof source === 'string' ? source : source.url;
        const limit = typeof source === 'object' ? source.limit : undefined;
        const prefix = typeof source === 'object' ? source.prefix : undefined;
        if (!url) return Promise.resolve([]);
        return fetchRSS(url, limit).then(feeds =>
          prefix ? feeds.map(t => `${prefix} ${t}`) : feeds
        );
      });

      const webPromises = (newsData.webSources || []).map(source => {
        if (!source.url) return Promise.resolve([]);
        return fetchWebTitles(source.url, source.selector || 'h3', source.limit || 20).then(titles =>
          source.prefix ? titles.map(t => `${source.prefix} ${t}`) : titles
        );
      });

      const results = await Promise.all([...rssPromises, ...webPromises]);
      const combined = results.reduce((acc, items) => [...acc, ...items], base);
      setTickerItems(combined);
    };

    updateTicker();
    const interval = setInterval(updateTicker, 600000);
    return () => clearInterval(interval);
  }, [newsData.ticker, newsData.rssSources, newsData.webSources]);

  // Auto-reload every 30 minutes to pick up newly deployed content
  useEffect(() => {
    const timer = setTimeout(() => window.location.reload(), 30 * 60 * 1000);
    return () => clearTimeout(timer);
  }, []);

  const [adminCounter, setAdminCounter] = useState(0);
  const [draggingWidget, setDraggingWidget] = useState(null);
  const [resizingWidget, setResizingWidget] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState('small');

  const handleAdminTrigger = () => {
    setAdminCounter(prev => prev + 1);
    if (adminCounter + 1 >= 3) {
      setIsAdminOpen(true);
      setAdminCounter(0);
    }
  };

  const handleSaveData = (newData) => {
    saveRemoteNews(newData);
    setNewsData(newData);
    setIsAdminOpen(false);
  };

  const onDragStart = (e, widgetId) => {
    if (isAdminOpen || resizingWidget) return;
    setDraggingWidget(widgetId);

    const rect = e.currentTarget.getBoundingClientRect();
    setOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const onResizeStart = (e, widgetId) => {
    if (isAdminOpen) return;
    const widget = newsData.widgets.find(w => w.id === widgetId);
    if (!widget) return;

    setResizingWidget(widgetId);
    setInitialMousePos({ x: e.clientX, y: e.clientY });
    setInitialSize(widget.size || 'small');
  };

  const onMouseMove = (e) => {
    if (draggingWidget) {
      const rawX = e.clientX - offset.x;
      const rawY = e.clientY - offset.y;
      const snappedX = Math.round(rawX / SNAP) * SNAP;
      const snappedY = Math.round(rawY / SNAP) * SNAP;

      setNewsData(prev => ({
        ...prev,
        widgets: prev.widgets.map(w =>
          w.id === draggingWidget
            ? { ...w, tempX: snappedX, tempY: snappedY }
            : w
        )
      }));
    } else if (resizingWidget) {
      const deltaX = e.clientX - initialMousePos.x;
      const deltaY = e.clientY - initialMousePos.y;

      let newSize = initialSize;

      if (initialSize === 'small') {
        if (deltaX > 80) newSize = 'compact';
      } else if (initialSize === 'compact') {
        if (deltaX < -80) newSize = 'small';
        else if (deltaX > 80) newSize = 'slim';
      } else if (initialSize === 'slim') {
        if (deltaX < -80) newSize = 'compact';
        else if (deltaX > 80) newSize = 'wide';
      } else if (initialSize === 'wide') {
        if (deltaX < -80) newSize = 'slim';
        else if (deltaX > 150) newSize = 'medium';
      } else if (initialSize === 'medium') {
        if (deltaX < -150) newSize = 'wide';
        else if (deltaY > 100) newSize = 'xlarge';
      } else if (initialSize === 'xlarge') {
        if (deltaY < -100) newSize = 'medium';
        else if (deltaY > 150) newSize = 'large';
      } else if (initialSize === 'large') {
        if (deltaY < -150) newSize = 'xlarge';
      }

      if (newSize !== initialSize) {
        setNewsData(prev => ({
          ...prev,
          widgets: prev.widgets.map(w =>
            w.id === resizingWidget ? { ...w, size: newSize } : w
          )
        }));
      }
    }
  };

  const onMouseUp = () => {
    if (draggingWidget) {
      setNewsData(prev => {
        const newWidgets = prev.widgets.map(w => {
          if (w.id === draggingWidget) {
            const { tempX, tempY, gridX, gridY, ...cleanWidget } = w;
            return { ...cleanWidget, px: tempX ?? w.px, py: tempY ?? w.py };
          }
          return w;
        });
        saveWidgetStates(newWidgets);
        const newData = { ...prev, widgets: newWidgets };
        saveRemoteNews(newData);
        return newData;
      });
    } else if (resizingWidget) {
      setNewsData(prev => {
        saveWidgetStates(prev.widgets);
        saveRemoteNews(prev);
        return prev;
      });
    }
    setDraggingWidget(null);
    setResizingWidget(null);
  };

  useEffect(() => {
    if (draggingWidget || resizingWidget) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    } else {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [draggingWidget, resizingWidget]);

  return (
    <>
      {config.videoBackground.enabled && (
        <div className="video-background">
          <iframe
            src={config.videoBackground.url}
            frameBorder="0"
            allow="autoplay; encrypted-media"
          ></iframe>
          <div className="video-overlay"></div>
        </div>
      )}

      <main className="dashboard-root">
        <MainSlider slides={newsData.featured} duration={config.animation.sliderDuration} />

        <div className="widget-overlay-engine">
          {newsData.widgets?.filter(w => w.isVisible).map(w => {
            const left = draggingWidget === w.id && w.tempX !== undefined ? w.tempX : (w.px ?? 20);
            const top  = draggingWidget === w.id && w.tempY !== undefined ? w.tempY : (w.py ?? 20);

            return (
              <div
                key={w.id}
                className={`dynamic-widget-wrapper ${draggingWidget === w.id ? 'dragging' : ''} ${resizingWidget === w.id ? 'resizing' : ''}`}
                onMouseDown={(e) => onDragStart(e, w.id)}
                style={{
                  position: 'fixed',
                  left: `${left}px`,
                  top: `${top}px`,
                  zIndex: (draggingWidget === w.id || resizingWidget === w.id) ? 2000 : 1000,
                  pointerEvents: 'auto',
                  transition: (draggingWidget === w.id || resizingWidget === w.id) ? 'none' : 'left 0.6s cubic-bezier(0.23, 1, 0.32, 1), top 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                  userSelect: 'none'
                }}
              >
                {w.type === 'smartstack' && (
                  <SmartStackWidget
                    location={config.widgets.weatherLocation}
                    size={w.size}
                    onResizeStart={(e) => onResizeStart(e, w.id)}
                  />
                )}
                {w.type === 'weather' && (
                  <WeatherWidget
                    location={config.widgets.weatherLocation}
                    size={w.size}
                    onResizeStart={(e) => onResizeStart(e, w.id)}
                  />
                )}
                {w.type === 'traffic' && (
                  <TrafficWidget
                    size={w.size}
                    onResizeStart={(e) => onResizeStart(e, w.id)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </main>

      <div onClick={handleAdminTrigger} className="ticker-footer">
        <NewsTicker
          items={tickerItems}
          speed={config.animation.scrollSpeed}
          location={config.widgets.weatherLocation}
        />
      </div>

      {isAdminOpen && (
        <Admin
          data={newsData}
          onSave={handleSaveData}
          onClose={() => setIsAdminOpen(false)}
        />
      )}

      <style>{`
        .dashboard-root {
          position: fixed;
          inset: 0;
          overflow: hidden;
          background: #fff;
        }
        .widget-overlay-engine {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 50;
        }
        .ticker-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 200;
          cursor: pointer;
        }
        .dynamic-widget-wrapper.dragging {
          filter: brightness(1.05) drop-shadow(0 30px 60px rgba(0,0,0,0.15));
          cursor: grabbing;
          z-index: 3000;
        }
        .dynamic-widget-wrapper.resizing {
          filter: brightness(1.02);
        }
      `}</style>
    </>
  );
}

export default App;
