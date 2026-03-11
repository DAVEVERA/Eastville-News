import React, { useState, useEffect } from 'react';
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

const NewsTicker = ({ items, speed = 30, location = 'UDEN' }) => {
  if (!items || items.length === 0) {
    return (
      <div className="ticker-container">
        <Clock location={location} />
        <div className="ticker-wrap" style={{ opacity: 0.4, paddingLeft: '20px', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
          Nieuws laden...
        </div>
        <div className="ticker-label">LAATSTE NIEUWS</div>
      </div>
    );
  }

  const charCount = items.reduce((sum, item) => sum + item.length, 0);
  const duration = Math.max(speed, Math.round(charCount * 0.15));

  return (
    <div className="ticker-container">
      <Clock location={location} />
      <div className="ticker-wrap">
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
      </div>
      <div className="ticker-label">LAATSTE NIEUWS</div>
    </div>
  );
};

export default NewsTicker;
