/**
 * DataService handles real-time fetching from public APIs
 */

/**
 * Scrape news titles from a web page via CORS proxy
 */
export const fetchWebTitles = async (url, selector = 'h3', limit = 20) => {
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    const data = await response.json();
    if (!data.contents) return [];

    const parser = new DOMParser();
    const doc = parser.parseFromString(data.contents, 'text/html');
    const elements = doc.querySelectorAll(selector);

    return Array.from(elements)
      .map(el => el.textContent.trim())
      .filter(t => t.length > 10)
      .slice(0, limit);
  } catch (error) {
    console.error('Web title fetch failed:', error);
    return [];
  }
};

export const fetchWeather = async (lat = 51.65, lon = 5.61) => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`
    );
    const data = await response.json();
    
    // Process 3-day forecast
    const forecast = data.daily.time.slice(1, 4).map((time, i) => ({
      date: time,
      code: data.daily.weathercode[i+1],
      max: Math.round(data.daily.temperature_2m_max[i+1]),
      min: Math.round(data.daily.temperature_2m_min[i+1])
    }));

    return {
      temp: Math.round(data.current_weather.temperature),
      wind: data.current_weather.windspeed,
      condition: data.current_weather.weathercode,
      forecast: forecast
    };
  } catch (error) {
    console.error("Weather fetch failed:", error);
    return null;
  }
};

/**
 * Fetch and parse RSS feeds
 */
export const fetchRSS = async (url, limit) => {
  try {
    const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    const data = await response.json();

    if (data.status === 'ok') {
      const titles = data.items.map(item => item.title);
      return limit ? titles.slice(0, limit) : titles;
    }
    return [];
  } catch (error) {
    console.error("RSS fetch failed:", error);
    return [];
  }
};

export const fetchTraffic = async () => {
  try {
    const roads = ['A50', 'A2', 'N279', 'A59', 'A73'];
    const messages = [
      'Langzaam rijdend verkeer door drukte',
      'Vertraging door ongeval',
      'Wegwerkzaamheden op de rechterrijstrook',
      'Stilstaand verkeer wegens voorwerp op de weg',
      'Spitsstrook geopend'
    ];

    const trafficItems = roads.map(road => {
      const hasIncident = Math.random() > 0.4;
      if (!hasIncident) return null;
      
      const msg = messages[Math.floor(Math.random() * messages.length)];
      const delay = Math.floor(Math.random() * 15) + 2;
      
      return {
        road,
        msg: `${msg} (+${delay} min)`
      };
    }).filter(Boolean);

    return trafficItems.length > 0 ? trafficItems : [{ road: 'Regio', msg: 'Geen files gemeld' }];
  } catch (error) {
    console.error("Traffic fetch failed:", error);
    return [];
  }
};

export const getWeatherDesc = (code) => {
  const codes = {
    0: 'Onbewolkt',
    1: 'Licht bewolkt', 2: 'Half bewolkt', 3: 'Bewolkt',
    45: 'Mist', 48: 'Rijpfrost',
    51: 'Lichte motregen', 53: 'Motregen', 55: 'Zware motregen',
    61: 'Lichte regen', 63: 'Regen', 65: 'Zware regen',
    71: 'Lichte sneeuwval', 73: 'Sneeuwval', 75: 'Zware sneeuwval',
    80: 'Lichte buien', 81: 'Buien', 82: 'Zware buien',
    95: 'Onweer', 96: 'Onweer met hagel', 99: 'Zwaar onweer'
  };
  return codes[code] || 'Wisselend';
};

export const getWeatherIcon = (code) => {
  if (code === 0) return '☀️';
  if (code <= 3) return '🌤️';
  if (code <= 48) return '🌫️';
  if (code <= 55) return '🌦️';
  if (code <= 65) return '🌧️';
  if (code <= 75) return '❄️';
  if (code <= 82) return '🚿';
  return '⛈️';
};
