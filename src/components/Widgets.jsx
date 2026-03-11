import React, { useState, useEffect } from 'react';
import { fetchWeather, fetchTraffic, getWeatherDesc, getWeatherIcon } from '../dataService';

// Compact sizes share the glassmorphism small/wide look but no header
const COMPACT_SIZES = ['small', 'compact', 'slim', 'wide'];

export const BaseWidget = ({ title, children, icon, size = 'small', onResizeStart }) => (
  <div className={`glass widget size-${size}`}>
    {!COMPACT_SIZES.includes(size) && (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        paddingBottom: '6px',
        marginBottom: '10px'
      }}>
        <h3 style={{
          textTransform: 'uppercase',
          fontSize: '0.6rem',
          color: 'rgba(0,0,0,0.5)',
          letterSpacing: '1.2px',
          fontWeight: '900',
          margin: 0
        }}>{title}</h3>
        <span style={{ fontSize: '1.1rem' }}>{icon}</span>
      </div>
    )}

    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: COMPACT_SIZES.includes(size) ? 'flex-start' : 'center'
    }}>
      {children}
    </div>

    {/* Resize Handle */}
    <div
      className="resize-handle"
      onMouseDown={(e) => {
        e.stopPropagation();
        onResizeStart(e);
      }}
      style={{
        position: 'absolute',
        bottom: '0',
        right: '0',
        width: '24px',
        height: '24px',
        cursor: 'nwse-resize',
        background: 'linear-gradient(135deg, transparent 70%, rgba(0,172,169,0.4) 70%)',
        borderBottomRightRadius: '24px'
      }}
    ></div>
  </div>
);

// ── SmartStack: rotating Date / Weather / Traffic ──────────────────────────
export const SmartStackWidget = ({ location, size, onResizeStart }) => {
  const [weather, setWeather] = useState(null);
  const [traffic, setTraffic] = useState([]);
  const [activeCard, setActiveCard] = useState(0);
  const [trafficIdx, setTrafficIdx] = useState(0);
  const [now, setNow] = useState(new Date());

  // Clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Weather
  useEffect(() => {
    const update = async () => { const d = await fetchWeather(); if (d) setWeather(d); };
    update();
    const t = setInterval(update, 600000);
    return () => clearInterval(t);
  }, []);

  // Traffic
  useEffect(() => {
    const update = async () => { const d = await fetchTraffic(); if (d) setTraffic(d); };
    update();
    const t = setInterval(update, 300000);
    return () => clearInterval(t);
  }, []);

  // Rotate cards every 5s
  useEffect(() => {
    const t = setInterval(() => setActiveCard(p => (p + 1) % 3), 5000);
    return () => clearInterval(t);
  }, []);

  // Reset traffic index when traffic data changes to avoid out-of-bounds
  useEffect(() => { setTrafficIdx(0); }, [traffic]);

  // Rotate traffic items every 3s when traffic card is shown
  useEffect(() => {
    if (activeCard === 2 && traffic.length > 1) {
      const t = setInterval(() => setTrafficIdx(p => (p + 1) % traffic.length), 3000);
      return () => clearInterval(t);
    }
  }, [activeCard, traffic]);

  const condIcon = weather ? getWeatherIcon(weather.condition) : '🌤️';
  const NL_DAYS  = ['zo','ma','di','wo','do','vr','za'];
  const NL_MONTHS = ['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'];
  const isNarrow = size === 'small' || size === 'compact';
  const isWide   = size === 'wide' || size === 'slim';
  const isBig    = !COMPACT_SIZES.includes(size);

  const labelStyle = { fontSize: '0.42rem', fontWeight: '900', opacity: 0.35, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '4px' };

  // ── CARD 0: Date ──
  const DateCard = (
    <div style={{ display: 'flex', flexDirection: isWide ? 'row' : 'column', alignItems: isWide ? 'center' : 'flex-start', gap: isWide ? '10px' : '2px' }}>
      {!isWide && <div style={labelStyle}>Datum</div>}
      <div style={{ fontSize: isNarrow ? '2rem' : isWide ? '2rem' : '3rem', fontWeight: '950', letterSpacing: '-2px', color: '#000', lineHeight: 1 }}>
        {now.getDate()}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
        {isWide && <div style={labelStyle}>Datum</div>}
        <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'rgba(0,0,0,0.75)', lineHeight: 1.2 }}>
          {NL_DAYS[now.getDay()]}
        </div>
        <div style={{ fontSize: '0.5rem', fontWeight: '700', color: 'rgba(0,0,0,0.4)' }}>
          {NL_MONTHS[now.getMonth()]} {now.getFullYear()}
        </div>
      </div>
    </div>
  );

  // ── CARD 1: Weather ──
  const WeatherCard = (
    <div style={{ display: 'flex', flexDirection: isWide ? 'row' : 'column', alignItems: isWide ? 'center' : 'flex-start', gap: isWide ? '10px' : '3px' }}>
      {!isWide && <div style={labelStyle}>{location}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <span style={{ fontSize: isNarrow ? '1.4rem' : '1.8rem', lineHeight: 1 }}>{condIcon}</span>
        <span style={{ fontSize: isNarrow ? '1.3rem' : '1.8rem', fontWeight: '950', letterSpacing: '-1px', color: '#000', lineHeight: 1 }}>
          {weather ? `${weather.temp}°` : '--°'}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
        {isWide && <div style={labelStyle}>{location}</div>}
        <div style={{ fontSize: '0.58rem', fontWeight: '800', color: 'rgba(0,0,0,0.7)', lineHeight: 1.2 }}>
          {weather ? getWeatherDesc(weather.condition) : 'Laden...'}
        </div>
        {(isWide || isBig) && weather && (
          <div style={{ fontSize: '0.5rem', fontWeight: '700', color: 'rgba(0,0,0,0.4)' }}>
            Wind {weather.wind} km/u
          </div>
        )}
      </div>
    </div>
  );

  // ── CARD 2: Traffic ──
  const TrafficCard = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
      <div style={labelStyle}>Verkeer · {trafficIdx + 1}/{Math.max(traffic.length, 1)}</div>
      {traffic.length > 0 ? (
        <div key={trafficIdx}>
          {isWide ? (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
              <div style={{ display: 'inline-block', background: 'var(--primary-color)', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: '950', flexShrink: 0 }}>
                {traffic[trafficIdx]?.road}
              </div>
              <div style={{ fontSize: '0.58rem', fontWeight: '700', color: 'rgba(0,0,0,0.8)', lineHeight: 1.3 }}>
                {traffic[trafficIdx]?.msg}
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'inline-block', background: 'var(--primary-color)', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: '950', marginBottom: '3px' }}>
                {traffic[trafficIdx]?.road}
              </div>
              <div style={{ fontSize: '0.58rem', fontWeight: '700', color: 'rgba(0,0,0,0.8)', lineHeight: 1.3 }}>
                {traffic[trafficIdx]?.msg}
              </div>
            </>
          )}
        </div>
      ) : (
        <div style={{ fontSize: '0.58rem', opacity: 0.5 }}>Geen meldingen</div>
      )}
    </div>
  );

  const CARDS = [DateCard, WeatherCard, TrafficCard];
  const ICONS  = ['📅', '🌤️', '🚗'];

  return (
    <BaseWidget title="Smart Stack" icon={ICONS[activeCard]} size={size} onResizeStart={onResizeStart}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {/* Rotating card content */}
        <div key={activeCard} style={{ animation: 'stackIn 0.35s cubic-bezier(0.23, 1, 0.32, 1)' }}>
          {CARDS[activeCard]}
        </div>

        {/* Dot indicators */}
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '10px' }}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              onClick={() => setActiveCard(i)}
              style={{
                width: activeCard === i ? '14px' : '5px',
                height: '5px',
                borderRadius: '100px',
                background: activeCard === i ? 'var(--primary-color)' : 'rgba(0,0,0,0.18)',
                transition: 'width 0.3s ease, background 0.3s ease',
                cursor: 'pointer',
                flexShrink: 0
              }}
            />
          ))}
        </div>
      </div>
      <style>{`
        @keyframes stackIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </BaseWidget>
  );
};

// ── WeatherWidget (standalone) ─────────────────────────────────────────────
export const WeatherWidget = ({ location, size, onResizeStart }) => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const updateWeather = async () => {
      const data = await fetchWeather();
      if (data) setWeather(data);
    };
    updateWeather();
    const timer = setInterval(updateWeather, 600000);
    return () => clearInterval(timer);
  }, []);

  const condIcon = weather ? getWeatherIcon(weather.condition) : '🌤️';

  if (size === 'small' || size === 'compact') {
    return (
      <BaseWidget title={`Weer in ${location}`} icon="🌤️" size={size} onResizeStart={onResizeStart}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '0.42rem', fontWeight: '900', opacity: 0.35, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            {location}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{condIcon}</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '950', letterSpacing: '-1px', color: '#000', lineHeight: 1 }}>
              {weather ? `${weather.temp}°` : '--°'}
            </span>
          </div>
          <div style={{ fontSize: '0.58rem', fontWeight: '800', color: 'rgba(0,0,0,0.7)', lineHeight: 1.2 }}>
            {weather ? getWeatherDesc(weather.condition) : 'Laden...'}
          </div>
        </div>
      </BaseWidget>
    );
  }

  if (size === 'wide' || size === 'slim') {
    return (
      <BaseWidget title={`Weer in ${location}`} icon="🌤️" size={size} onResizeStart={onResizeStart}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '2.4rem', lineHeight: 1, flexShrink: 0 }}>{condIcon}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
            <span style={{ fontSize: '2rem', fontWeight: '950', letterSpacing: '-2px', color: '#000', lineHeight: 1 }}>
              {weather ? `${weather.temp}°` : '--°'}
            </span>
            <span style={{ fontSize: '0.62rem', fontWeight: '800', color: 'rgba(0,0,0,0.7)', lineHeight: 1.2 }}>
              {weather ? getWeatherDesc(weather.condition) : 'Laden...'}
            </span>
            {weather && (
              <span style={{ fontSize: '0.5rem', fontWeight: '700', color: 'rgba(0,0,0,0.4)' }}>
                {location} · Wind {weather.wind} km/u
              </span>
            )}
          </div>
        </div>
      </BaseWidget>
    );
  }

  return (
    <BaseWidget title={`Weer in ${location}`} icon="🌤️" size={size} onResizeStart={onResizeStart}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ fontSize: size === 'large' ? '4rem' : '3rem', lineHeight: 1, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.1))' }}>{condIcon}</div>
          <div>
            <div style={{ fontSize: size === 'large' ? '3.8rem' : '3rem', fontWeight: '950', letterSpacing: '-3px', color: '#000', lineHeight: 0.9 }}>
              {weather ? `${weather.temp}°` : '--°'}
            </div>
            <div style={{ fontSize: size === 'large' ? '1rem' : '0.85rem', fontWeight: '800', color: 'rgba(0,0,0,0.75)', marginTop: '4px' }}>
              {weather ? getWeatherDesc(weather.condition) : 'Laden...'}
            </div>
            {weather && (
              <div style={{ fontSize: '0.72rem', color: 'rgba(0,0,0,0.4)', fontWeight: '600', marginTop: '2px' }}>
                Wind {weather.wind} km/u · {location}
              </div>
            )}
          </div>
        </div>
        {(size === 'large' || size === 'xlarge') && weather?.forecast && (
          <div style={{ marginTop: '8px', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '12px' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '0.62rem', fontWeight: '900', color: 'var(--primary-color)', letterSpacing: '1.2px', textTransform: 'uppercase' }}>Voorspelling</p>
            <div style={{ display: 'grid', gridTemplateColumns: size === 'large' ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: '8px' }}>
              {weather.forecast.slice(0, size === 'large' ? 3 : 2).map((day, idx) => (
                <div key={idx} style={{ textAlign: 'center', background: 'rgba(0,172,169,0.04)', padding: '8px 4px', borderRadius: '12px', border: '1px solid rgba(0,172,169,0.1)' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: '800', opacity: 0.45, textTransform: 'uppercase' }}>
                    {new Date(day.date).toLocaleDateString('nl-NL', { weekday: 'short' })}
                  </div>
                  <div style={{ fontSize: '1.4rem', margin: '4px 0' }}>{getWeatherIcon(day.code)}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '900', color: '#000' }}>{day.max}°</div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.4, fontWeight: '600' }}>{day.min}°</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </BaseWidget>
  );
};

// ── TrafficWidget (standalone) ─────────────────────────────────────────────
export const TrafficWidget = ({ size, onResizeStart }) => {
  const [traffic, setTraffic] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const updateTraffic = async () => {
      const data = await fetchTraffic();
      if (data) setTraffic(data);
    };
    updateTraffic();
    const timer = setInterval(updateTraffic, 300000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (COMPACT_SIZES.includes(size) && traffic.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % traffic.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [size, traffic]);

  const itemsToShow = size === 'medium' ? 2 : size === 'xlarge' ? 3 : 4;

  return (
    <BaseWidget title="Verkeer Uden" icon="🚗" size={size} onResizeStart={onResizeStart}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {COMPACT_SIZES.includes(size) ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ fontSize: '0.48rem', fontWeight: '900', opacity: 0.4, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              Verkeer · {currentIndex + 1}/{traffic.length || 1}
            </div>
            {traffic.length > 0 ? (
              <div key={currentIndex} className="traffic-pop">
                {(size === 'wide' || size === 'slim') ? (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ display: 'inline-block', background: 'var(--primary-color)', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: '950', flexShrink: 0 }}>
                      {traffic[currentIndex].road}
                    </div>
                    <div style={{ fontSize: '0.62rem', fontWeight: '700', color: 'rgba(0,0,0,0.8)', lineHeight: 1.3 }}>
                      {traffic[currentIndex].msg}
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'inline-block', background: 'var(--primary-color)', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: '950', marginBottom: '4px' }}>
                      {traffic[currentIndex].road}
                    </div>
                    <div style={{ fontSize: '0.62rem', fontWeight: '700', color: 'rgba(0,0,0,0.8)', lineHeight: 1.3 }}>
                      {traffic[currentIndex].msg}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div style={{ fontSize: '0.62rem', opacity: 0.5 }}>Geen meldingen</div>
            )}
          </div>
        ) : (
          <>
            {traffic.slice(0, itemsToShow).map((item, idx) => (
              <div key={idx} style={{ fontSize: '0.75rem', background: 'rgba(0,100,255,0.03)', padding: '10px 14px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ background: 'var(--primary-color)', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontWeight: '950', fontSize: '0.65rem' }}>{item.road}</span>
                <span style={{ color: 'rgba(0,0,0,0.85)', fontWeight: '750' }}>{item.msg}</span>
              </div>
            ))}
            {traffic.length === 0 && <div style={{ fontSize: '0.75rem', textAlign: 'center', opacity: 0.5, color: '#000' }}>Geen incidenten</div>}
          </>
        )}
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .traffic-pop { animation: fadeIn 0.4s ease-out; }
      `}</style>
    </BaseWidget>
  );
};
