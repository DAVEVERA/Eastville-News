import React, { useState, useEffect } from 'react';
import './MainSlider.css';

const MainSlider = ({ slides, duration = 12000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Per-slide duration: each slide can override the default via a duration field
  useEffect(() => {
    if (!slides || slides.length === 0) return;
    const currentDuration = slides[currentIndex]?.duration || duration;
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, currentDuration);
    return () => clearTimeout(timer);
  }, [currentIndex, slides, duration]);

  if (!slides || slides.length === 0) return null;

  const currentSlide = slides[currentIndex];

  const bgStyle = currentSlide.backgroundImage
    ? { backgroundImage: `url(${currentSlide.backgroundImage})` }
    : { backgroundColor: currentSlide.backgroundColor || '#fff' };

  return (
    <div className="main-slider" style={bgStyle}>
      <div className="bg-overlay-gradient"></div>
      {slides.map((slide, index) => {
        const ratio = slide.splitRatio || 45;
        const hasImage = !!slide.foregroundImage;
        return (
          <div
            key={slide.id}
            className={`slide ${index === currentIndex ? 'active' : ''}`}
          >
            {slide.imageOnly ? (
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
                    maxHeight: '92%',
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
                    src={slide.videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {slide.category && <span className="category-tag-large">{slide.category}</span>}
                </div>
                <div className="news-copy">
                  <h1 className="news-title">{slide.title}</h1>
                  <p className="news-description">{slide.description}</p>
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
                  <h1 className="news-title">{slide.title}</h1>
                  <p className="news-description">{slide.description}</p>
                </div>
              </div>
            ) : (
              <div className="text-only-layout">
                {slide.category && <span className="category-tag-text">{slide.category}</span>}
                <h1 className="news-title-text">{slide.title}</h1>
                <p className="news-description-text">{slide.description}</p>
              </div>
            )}
          </div>
        );
      })}
      <div className="slider-nav-fixed">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`nav-dot-small ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default MainSlider;
