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
  return (
    <div className="ticker-container">
      <Clock />
      <div className="ticker-wrap">
        <div className="ticker" style={{ animationDuration: `${speed}s` }}>
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

