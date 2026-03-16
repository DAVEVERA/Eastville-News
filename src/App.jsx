import React, { useState, useEffect, useRef } from 'react';
import { config } from './config';
import initialNewsData from './data/news.json';
import NewsTicker from './components/NewsTicker';
import MainSlider from './components/MainSlider';
import Admin from './components/Admin';
import { fetchRSS, fetchWebTitles } from './dataService';

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

const serializeForComparison = (data) => {
  const { widgets, ...rest } = data;
  return JSON.stringify(rest);
};

function App() {
  const [newsData, setNewsData] = useState(initialNewsData);
  const [tickerItems, setTickerItems] = useState(initialNewsData.ticker);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminCounter, setAdminCounter] = useState(0);
  const lastRemoteRef = useRef(null);

  // Fetch from server on load and poll every 3 minutes
  useEffect(() => {
    const loadRemote = async () => {
      const data = await fetchRemoteNews();
      if (data) {
        const serialized = serializeForComparison(data);
        if (serialized !== lastRemoteRef.current) {
          lastRemoteRef.current = serialized;
          setNewsData(data);
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

  // Auto-reload every 30 minutes
  useEffect(() => {
    const timer = setTimeout(() => window.location.reload(), 30 * 60 * 1000);
    return () => clearTimeout(timer);
  }, []);

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

      <main style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#fff' }}>
        <MainSlider slides={newsData.featured} duration={config.animation.sliderDuration} />
      </main>

      <div onClick={handleAdminTrigger} style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200, cursor: 'pointer' }}>
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
    </>
  );
}

export default App;
