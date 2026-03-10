import React, { useState, useEffect } from 'react';
import { config } from './config';
import initialNewsData from './data/news.json';
import NewsTicker from './components/NewsTicker';
import MainSlider from './components/MainSlider';
import { WeatherWidget, TrafficWidget } from './components/Widgets';
import Admin from './components/Admin';
import { fetchRSS, fetchWebTitles } from './dataService';

const SNAP = 20; // snap elke 20px

function App() {
  const [newsData, setNewsData] = useState(initialNewsData);
  const [tickerItems, setTickerItems] = useState(initialNewsData.ticker);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  
  // RSS Fetching Logic
  useEffect(() => {
    const updateTicker = async () => {
      let combined = [...newsData.ticker];
      
      if (newsData.rssSources && newsData.rssSources.length > 0) {
        for (const source of newsData.rssSources) {
          const url = typeof source === 'string' ? source : source.url;
          const limit = typeof source === 'object' ? source.limit : undefined;
          const prefix = typeof source === 'object' ? source.prefix : undefined;
          if (!url) continue;
          const feeds = await fetchRSS(url, limit);
          const prefixed = prefix ? feeds.map(t => `${prefix} ${t}`) : feeds;
          combined = [...combined, ...prefixed];
        }
      }

      if (newsData.webSources && newsData.webSources.length > 0) {
        for (const source of newsData.webSources) {
          if (!source.url) continue;
          const titles = await fetchWebTitles(source.url, source.selector || 'h3', source.limit || 20);
          const prefixed = source.prefix
            ? titles.map(t => `${source.prefix} ${t}`)
            : titles;
          combined = [...combined, ...prefixed];
        }
      }

      setTickerItems(combined);
    };

    updateTicker();
    const interval = setInterval(updateTicker, 600000); // 10 mins
    return () => clearInterval(interval);
  }, [newsData.ticker, newsData.rssSources, newsData.webSources]);

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
    setNewsData(newData);
    setIsAdminOpen(false);
  };

  const onDragStart = (e, widgetId) => {
    if (isAdminOpen || resizingWidget) return;
    setDraggingWidget(widgetId);
    
    const widget = newsData.widgets.find(w => w.id === widgetId);
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

      // Size order: small → wide → medium → xlarge → large
      if (initialSize === 'small') {
        if (deltaX > 100) newSize = 'wide';
      } else if (initialSize === 'wide') {
        if (deltaX < -100) newSize = 'small';
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
      setNewsData(prev => ({
        ...prev,
        widgets: prev.widgets.map(w => {
          if (w.id === draggingWidget) {
            const { tempX, tempY, gridX, gridY, ...cleanWidget } = w;
            return { ...cleanWidget, px: tempX ?? w.px, py: tempY ?? w.py };
          }
          return w;
        })
      }));
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
            const top = draggingWidget === w.id && w.tempY !== undefined ? w.tempY : (w.py ?? 20);
            
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
                  transition: (draggingWidget === w.id || resizingWidget === w.id) ? 'none' : 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                  userSelect: 'none'
                }}
              >
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
        <NewsTicker items={tickerItems} speed={config.animation.scrollSpeed} />
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
