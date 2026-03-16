import React, { useState } from 'react';

const Admin = ({ data, onSave, onClose }) => {
  const [activeTab, setActiveTab] = useState('news');
  const [news, setNews] = useState(data.featured);
  const [ticker, setTicker] = useState(data.ticker);
  const [rssSources, setRssSources] = useState(data.rssSources || []);
  const handleNewsChange = (id, field, value) => {
    setNews(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSave({
      featured: news,
      ticker: ticker,
      rssSources: rssSources,
      webSources: data.webSources || [],
      widgets: data.widgets || [],
      traffic: data.traffic
    });
  };

  return (
    <div className="admin-overlay glass" style={{
      position: 'fixed',
      inset: '20px',
      zIndex: 10000,
      padding: '40px',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      background: 'rgba(255,255,255,0.98)',
      boxShadow: '0 50px 100px rgba(0,0,0,0.1)',
      borderRadius: '40px',
      backdropFilter: 'blur(30px)',
      color: '#1d1d1f'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
           <h1 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '2.5rem', fontWeight: '900' }}>Master Control</h1>
           <p style={{ opacity: 0.5, margin: 0, letterSpacing: '1px' }}>BEHEER NIEUWS, TICKER EN WIDGETS</p>
        </div>
        <button onClick={onClose} style={{
          background: 'rgba(0,0,0,0.05)',
          border: '1px solid rgba(0,0,0,0.1)',
          color: '#000',
          padding: '12px 40px',
          borderRadius: '100px',
          fontWeight: 'bold',
          cursor: 'pointer',
          textTransform: 'uppercase'
        }}>Gereed</button>
      </div>

      <div style={{ display: 'flex', gap: '30px', marginBottom: '30px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <button className={activeTab === 'news' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('news')}>NIEUWS</button>
        <button className={activeTab === 'ticker' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('ticker')}>TICKER</button>
      </div>

      <form onSubmit={handleSave} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'news' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {news.map(item => (
              <div key={item.id} className="admin-card glass" style={{ padding: '30px', background: 'rgba(0,0,0,0.03)', borderRadius: '24px', position: 'relative', height: 'auto', width: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>

                  {/* Titel + Categorie */}
                  <div className="input-group">
                    <label>Titel</label>
                    <input value={item.title} onChange={e => handleNewsChange(item.id, 'title', e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label>Categorie</label>
                    <input value={item.category} onChange={e => handleNewsChange(item.id, 'category', e.target.value)} />
                  </div>

                  {/* Beschrijving — verborgen bij volledig scherm */}
                  {!item.imageOnly && (
                    <div className="input-group" style={{ gridColumn: 'span 2' }}>
                      <label>Omschrijving</label>
                      <textarea value={item.description} onChange={e => handleNewsChange(item.id, 'description', e.target.value)} rows="3" />
                    </div>
                  )}

                  {/* Media: afbeelding + video */}
                  <div className="input-group">
                    <label>Afbeelding URL</label>
                    <input value={item.foregroundImage} onChange={e => handleNewsChange(item.id, 'foregroundImage', e.target.value)} placeholder="https://..." />
                  </div>
                  {!item.imageOnly && (
                    <div className="input-group">
                      <label>Video URL (.mp4)</label>
                      <input value={item.videoUrl || ''} onChange={e => handleNewsChange(item.id, 'videoUrl', e.target.value)} placeholder="https://..." />
                    </div>
                  )}

                  {/* Achtergrond */}
                  <div className="input-group">
                    <label>Achtergrond Afbeelding URL</label>
                    <input value={item.backgroundImage} onChange={e => handleNewsChange(item.id, 'backgroundImage', e.target.value)} placeholder="https://..." />
                  </div>
                  <div className="input-group">
                    <label>Achtergrond Kleur (Hex)</label>
                    <input value={item.backgroundColor} onChange={e => handleNewsChange(item.id, 'backgroundColor', e.target.value)} />
                  </div>

                  {/* Volledig scherm toggle */}
                  <div
                    style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', background: item.imageOnly ? 'rgba(0,172,169,0.08)' : 'rgba(0,0,0,0.03)', borderRadius: '16px', border: `1px solid ${item.imageOnly ? 'rgba(0,172,169,0.3)' : 'rgba(0,0,0,0.07)'}`, cursor: 'pointer' }}
                    onClick={() => handleNewsChange(item.id, 'imageOnly', !item.imageOnly)}
                  >
                    <input type="checkbox" checked={!!item.imageOnly} onChange={() => {}} style={{ width: '20px', height: '20px', pointerEvents: 'none', accentColor: 'var(--primary-color)' }} />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Volledig scherm afbeelding</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>Toont alleen de afbeelding zonder tekst of video</div>
                    </div>
                  </div>

                  {/* Weergavetijd voor volledig scherm slides */}
                  {item.imageOnly && (
                    <div className="input-group" style={{ gridColumn: 'span 2' }}>
                      <label>Weergavetijd ({Math.round((item.duration || 12000) / 1000)} seconden)</label>
                      <input
                        type="range" min="5" max="60" step="1"
                        value={Math.round((item.duration || 12000) / 1000)}
                        onChange={e => handleNewsChange(item.id, 'duration', parseInt(e.target.value) * 1000)}
                      />
                    </div>
                  )}

                  {/* Opties alleen zichtbaar als NIET volledig scherm */}
                  {!item.imageOnly && (
                    <>
                      <div className="input-group" style={{ gridColumn: 'span 2' }}>
                        <label>Verdeling Beeld / Tekst ({item.splitRatio || 50}%)</label>
                        <input type="range" min="20" max="80" value={item.splitRatio || 50} onChange={e => handleNewsChange(item.id, 'splitRatio', parseInt(e.target.value))} />
                      </div>
                      <div className="input-group">
                        <label>Titel tekstgrootte ({(item.titleSize || 5).toFixed(1)} rem)</label>
                        <input type="range" min="2" max="8" step="0.5" value={item.titleSize || 5} onChange={e => handleNewsChange(item.id, 'titleSize', parseFloat(e.target.value))} />
                      </div>
                      <div className="input-group">
                        <label>Tekst tekstgrootte ({(item.descSize || 1.6).toFixed(1)} rem)</label>
                        <input type="range" min="0.8" max="3" step="0.1" value={item.descSize || 1.6} onChange={e => handleNewsChange(item.id, 'descSize', parseFloat(e.target.value))} />
                      </div>
                    </>
                  )}

                  {/* Afbeelding positionering */}
                  {item.foregroundImage && (
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1.5px', fontWeight: 800 }}>Afbeelding Positionering</label>
                      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                        <div style={{ width: '160px', height: '120px', overflow: 'hidden', borderRadius: '12px', background: '#111', flexShrink: 0 }}>
                          <img
                            src={item.foregroundImage}
                            alt=""
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              transform: `scale(${item.imageScale || 1}) translate(${item.imageOffsetX || 0}%, ${item.imageOffsetY || 0}%)`
                            }}
                          />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div className="input-group">
                            <label>Zoom ({(item.imageScale || 1).toFixed(2)}×)</label>
                            <input type="range" min="0.5" max="2" step="0.05" value={item.imageScale || 1} onChange={e => handleNewsChange(item.id, 'imageScale', parseFloat(e.target.value))} />
                          </div>
                          <div className="input-group">
                            <label>Horizontaal ({item.imageOffsetX || 0}%)</label>
                            <input type="range" min="-50" max="50" value={item.imageOffsetX || 0} onChange={e => handleNewsChange(item.id, 'imageOffsetX', parseInt(e.target.value))} />
                          </div>
                          <div className="input-group">
                            <label>Verticaal ({item.imageOffsetY || 0}%)</label>
                            <input type="range" min="-50" max="50" value={item.imageOffsetY || 0} onChange={e => handleNewsChange(item.id, 'imageOffsetY', parseInt(e.target.value))} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'ticker' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', pb: '20px' }}>
              <label style={{ mb: '15px', display: 'block', fontWeight: '900', color: 'var(--primary-color)' }}>HANDMATIGE BERICHTEN</label>
              {ticker.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
                  <input style={{ flex: 1, padding: '18px' }} value={item} onChange={e => {
                    const newTicker = [...ticker];
                    newTicker[idx] = e.target.value;
                    setTicker(newTicker);
                  }} />
                  <button type="button" className="btn-icon danger" onClick={() => setTicker(ticker.filter((_, i) => i !== idx))}>🗑️</button>
                </div>
              ))}
              <button type="button" onClick={() => setTicker([...ticker, ''])} style={{ background: 'rgba(0,172,169,0.1)', color: 'var(--primary-color)', border: 'none', padding: '12px 25px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}>+ BERICHT TOEVOEGEN</button>
            </div>

            <div>
              <label style={{ mb: '15px', display: 'block', fontWeight: '900', color: 'var(--primary-color)' }}>RSS NIEUWS BRONNEN (URL)</label>
              {rssSources.map((url, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
                  <input style={{ flex: 1, padding: '18px' }} value={url} placeholder="https://example.com/rss" onChange={e => {
                    const newSources = [...rssSources];
                    newSources[idx] = e.target.value;
                    setRssSources(newSources);
                  }} />
                  <button type="button" className="btn-icon danger" onClick={() => setRssSources(rssSources.filter((_, i) => i !== idx))}>🗑️</button>
                </div>
              ))}
              <button type="button" onClick={() => setRssSources([...rssSources, ''])} style={{ background: 'rgba(0,172,169,0.1)', color: 'var(--primary-color)', border: 'none', padding: '12px 25px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}>+ RSS BRON TOEVOEGEN</button>
            </div>
          </div>
        )}


        <div style={{ height: '60px' }}></div>
        <button type="submit" className="save-btn">THEMA & INSTELLINGEN OPSLAAN</button>
      </form>

      <style>{`
        .admin-overlay input, .admin-overlay textarea {
          background: rgba(0,0,0,0.05);
          border: 1px solid rgba(0,0,0,0.1);
          color: #1d1d1f;
          padding: 15px;
          border-radius: 15px;
          width: 100%;
          font-family: inherit;
        }
        .btn-icon.danger { background: rgba(255,0,0,0.1); border: none; padding: 10px; border-radius: 10px; cursor: pointer; }
        .input-group label {
          display: block;
          font-size: 0.8rem;
          color: rgba(0,0,0,0.5);
          text-transform: uppercase;
          margin-bottom: 10px;
          letter-spacing: 1.5px;
          font-weight: 800;
        }
        .tab-btn {
          background: transparent;
          border: none;
          color: rgba(0,0,0,0.3);
          font-weight: 900;
          font-size: 1.1rem;
          cursor: pointer;
          padding: 15px 5px;
          border-bottom: 4px solid transparent;
          transition: all 0.3s;
          letter-spacing: 2px;
        }
        .tab-btn.active {
          color: #000;
          border-bottom-color: var(--primary-color);
        }
        .save-btn {
          background: var(--primary-color);
          color: white;
          padding: 25px;
          border: none;
          border-radius: 24px;
          font-weight: 900;
          font-size: 1.4rem;
          cursor: pointer;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          transition: transform 0.2s, background 0.3s;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .save-btn:hover { transform: translateY(-3px); filter: brightness(1.1); }
      `}</style>
    </div>
  );
};

export default Admin;
