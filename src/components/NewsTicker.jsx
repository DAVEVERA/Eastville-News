import React, { useState, useEffect } from 'react';
import './NewsTicker.css';

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="ticker-clock">
      <span className="location">UDEN</span>
      <span className="time">{time.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}</span>
    </div>
  );
};

const NewsTicker = ({ items, speed = 30 }) => {
  // Adaptive duration: ~0.15s per character so longer content scrolls for longer
  const charCount = items.reduce((sum, item) => sum + item.length, 0);
  const duration = Math.max(speed, Math.round(charCount * 0.15));

  return (
    <div className="ticker-container">
      <Clock />
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

