import React, { useState, useEffect } from 'react';
import { fetchWeather, fetchTraffic, getWeatherIcon, getWeatherDesc } from '../dataService';
import './NewsTicker.css';

const Clock = ({ location = 'UDEN' }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="ticker-clock">
      <span className="location">{location.toUpperCase()}</span>
      <span className="time">{time.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}</span>
    </div>
  );
};

const WeatherPill = () => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const update = async () => { const d = await fetchWeather(); if (d) setWeather(d); };
    update();
    const t = setInterval(update, 600000);
    return () => clearInterval(t);
  }, []);

  const icon = weather ? getWeatherIcon(weather.condition) : '🌤️';

  return (
    <div className="ticker-info-pill">
      <span className="ticker-pill-icon">{icon}</span>
      <div className="ticker-pill-text">
        <span className="ticker-pill-main">{weather ? `${weather.temp}°` : '--°'}</span>
        {weather && <span className="ticker-pill-sub">{getWeatherDesc(weather.condition)}</span>}
      </div>
    </div>
  );
};

const TrafficPill = () => {
  const [traffic, setTraffic] = useState([]);

  useEffect(() => {
    const update = async () => { const d = await fetchTraffic(); if (d) setTraffic(d); };
    update();
    const t = setInterval(update, 300000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="ticker-info-pill">
      <span className="ticker-pill-icon">🚗</span>
      <div className="ticker-pill-text">
        <span className="ticker-pill-main">
          {traffic.length > 0 ? `${traffic.length} melding${traffic.length !== 1 ? 'en' : ''}` : 'Geen file'}
        </span>
        {traffic.length > 0 && (
          <span className="ticker-pill-sub">{traffic[0].road}</span>
        )}
      </div>
    </div>
  );
};

const NewsTicker = ({ items, speed = 30, location = 'UDEN' }) => {
  const hasItems = items && items.length > 0;
  const charCount = hasItems ? items.reduce((sum, item) => sum + item.length, 0) : 0;
  const duration = Math.max(speed, Math.round(charCount * 0.15));

  return (
    <div className="ticker-container">
      <Clock location={location} />
      <WeatherPill />
      <TrafficPill />
      <div className="ticker-divider" />
      <div className="ticker-wrap">
        {hasItems ? (
          <div className="ticker" style={{ animationDuration: `${duration}s` }}>
            {items.map((item, index) => (
              <div key={index} className="ticker__item">
                {item}
                <span className="ticker__separator"> • </span>
              </div>
            ))}
            {items.map((item, index) => (
              <div key={`dup-${index}`} className="ticker__item">
                {item}
                <span className="ticker__separator"> • </span>
              </div>
            ))}
          </div>
        ) : (
          <span style={{ opacity: 0.4, paddingLeft: '20px', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
            Nieuws laden...
          </span>
        )}
      </div>
      <div className="ticker-label">LAATSTE NIEUWS</div>
    </div>
  );
};

export default NewsTicker;
