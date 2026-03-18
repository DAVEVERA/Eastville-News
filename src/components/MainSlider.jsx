import { useState, useEffect } from 'react';
import './MainSlider.css';

const MainSlider = ({ slides, duration = 12000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Clamp index when slides array shrinks (e.g. remote data update)
  useEffect(() => {
    if (slides && currentIndex >= slides.length) setCurrentIndex(0);
  }, [slides]);

  // Auto-advance: each slide can override duration via its own duration field
  useEffect(() => {
    if (!slides || slides.length === 0 || isPaused) return;
    const dur = slides[currentIndex]?.duration ?? duration;
    const timer = setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % slides.length);
    }, dur);
    return () => clearTimeout(timer);
  }, [currentIndex, duration, isPaused, slides]);

  if (!slides || slides.length === 0) return null;

  const currentSlide = slides[currentIndex];

  const bgStyle = currentSlide.backgroundImage
    ? { backgroundImage: `url(${currentSlide.backgroundImage})` }
    : { backgroundColor: currentSlide.backgroundColor || '#fff' };

  const goNext = () => setCurrentIndex(prev => (prev + 1) % slides.length);
  const goPrev = () => setCurrentIndex(prev => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="main-slider" style={bgStyle}>
      {slides.map((slide, index) => {
        const ratio = Math.min(slide.splitRatio || 35, 40);
        const hasImage = !!slide.foregroundImage;
        return (
          <div
            key={slide.id}
            className={`slide ${index === currentIndex ? 'active' : ''}`}
          >
            {slide.pdfOnly ? (
              <iframe
                title={slide.title}
                src={slide.embedUrl}
                style={{ display: 'block', width: '100vw', height: '100vh', border: 'none', background: slide.backgroundColor || '#fff' }}
              />
            ) : slide.embedUrl ? (
              <div className="embed-slide-layout" style={{ background: slide.backgroundColor || '#0f0f1a' }}>
                <div className="embed-slide-header">
                  {slide.category && <span className="embed-category-tag">{slide.category}</span>}
                  <span className="embed-slide-title">{slide.title}</span>
                </div>
                <iframe
                  title={slide.embedTitle || slide.title}
                  src={slide.embedUrl}
                  frameBorder="0"
                  allowFullScreen
                  className="embed-iframe"
                />
              </div>
            ) : slide.imageOnly ? (
              <div style={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img
                  src={slide.foregroundImage}
                  alt={slide.title}
                  style={{
                    maxWidth: '92%',
                    maxHeight: 'calc(92vh - 60px)',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 20px 60px rgba(0,0,0,0.25))',
                    transform: `scale(${slide.imageScale || 1}) translate(${slide.imageOffsetX || 0}%, ${slide.imageOffsetY || 0}%)`
                  }}
                />
              </div>
            ) : slide.videoUrl ? (
              <div className="full-screen-news-grid" style={{ gridTemplateColumns: `${ratio}vw ${100 - ratio}vw` }}>
                <div className="news-visual">
                  <video
                    key={slide.videoUrl}
                    src={slide.videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    onCanPlay={(e) => e.target.play()}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {slide.category && <span className="category-tag-large">{slide.category}</span>}
                </div>
                <div className="news-copy">
                  <h1 className="news-title" style={slide.titleSize ? { fontSize: `${slide.titleSize}rem` } : undefined}>{slide.title}</h1>
                  <p className="news-description" style={slide.descSize ? { fontSize: `${slide.descSize}rem` } : undefined}>{slide.description}</p>
                </div>
              </div>
            ) : hasImage ? (
              <div className="full-screen-news-grid" style={{ gridTemplateColumns: `${ratio}vw ${100 - ratio}vw` }}>
                <div className="news-visual">
                  <div className="hero-image-wrapper">
                    <img
                      src={slide.foregroundImage}
                      alt={slide.title}
                      className="hero-image"
                      style={{ transform: `scale(${slide.imageScale || 1}) translate(${slide.imageOffsetX || 0}%, ${slide.imageOffsetY || 0}%)` }}
                    />
                    <span className="category-tag-large">{slide.category}</span>
                  </div>
                </div>
                <div className="news-copy">
                  <h1 className="news-title" style={slide.titleSize ? { fontSize: `${slide.titleSize}rem` } : undefined}>{slide.title}</h1>
                  <p className="news-description" style={slide.descSize ? { fontSize: `${slide.descSize}rem` } : undefined}>{slide.description}</p>
                </div>
              </div>
            ) : (
              <div className="text-only-layout">
                {slide.category && <span className="category-tag-text">{slide.category}</span>}
                <h1 className="news-title-text" style={slide.titleSize ? { fontSize: `${slide.titleSize}rem` } : undefined}>{slide.title}</h1>
                <p className="news-description-text" style={slide.descSize ? { fontSize: `${slide.descSize}rem` } : undefined}>{slide.description}</p>
              </div>
            )}
          </div>
        );
      })}

      {/* Navigation + Controls bar */}
      <div className="slider-controls">
        <button className="ctrl-btn" onClick={goPrev} title="Vorige">&#8249;</button>
        <div className="nav-dots">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`nav-dot-small ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
        <button className="ctrl-btn" onClick={goNext} title="Volgende">&#8250;</button>
        <div className="ctrl-divider" />
        <button className={`ctrl-btn pause-btn ${isPaused ? 'paused' : ''}`} onClick={() => setIsPaused(p => !p)} title={isPaused ? 'Hervatten' : 'Pauzeren'}>
          {isPaused ? '▶' : '⏸'}
        </button>
      </div>
    </div>
  );
};

export default MainSlider;
