const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/weather';
const DIRECT_KEY = 'bf1b7ce57c0aa84b2acaaaf827be4952';
const OPENWEATHER_BASE = 'https://api.openweathermap.org/data/2.5';
const GEO_BASE = 'https://api.openweathermap.org/geo/1.0';

// In-memory client cache for GitHub Pages standalone mode
const clientMemoryCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function getClientCached(key) {
  const item = clientMemoryCache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > CACHE_TTL_MS) {
    clientMemoryCache.delete(key);
    return null;
  }
  return item.data;
}

function setClientCached(key, data) {
  clientMemoryCache.set(key, { data, timestamp: Date.now() });
}

/**
 * Standardize external OpenWeatherMap current weather response
 */
function formatCurrentWeatherData(raw, units = 'metric') {
  const isImperial = units === 'imperial';
  const icon = raw.weather?.[0]?.icon || '01d';

  return {
    isMock: false,
    source: 'OpenWeatherMap Live API (Cloud)',
    city: raw.name,
    country: raw.sys?.country || '',
    coordinates: {
      lat: raw.coord?.lat,
      lon: raw.coord?.lon
    },
    weather: {
      main: raw.weather?.[0]?.main || 'Clear',
      description: raw.weather?.[0]?.description || 'clear sky',
      icon,
      iconUrl: `https://openweathermap.org/img/wn/${icon}@2x.png`
    },
    temperature: {
      current: Math.round(raw.main?.temp),
      feelsLike: Math.round(raw.main?.feels_like),
      min: Math.round(raw.main?.temp_min),
      max: Math.round(raw.main?.temp_max),
      unit: isImperial ? '°F' : '°C'
    },
    metrics: {
      humidity: raw.main?.humidity,
      windSpeed: raw.wind?.speed,
      windSpeedUnit: isImperial ? 'mph' : 'm/s',
      windDeg: raw.wind?.deg,
      pressure: raw.main?.pressure,
      visibility: raw.visibility,
      clouds: raw.clouds?.all,
      uvIndex: null
    },
    sun: {
      sunrise: raw.sys?.sunrise,
      sunset: raw.sys?.sunset,
      timezone: raw.timezone
    },
    updatedAt: new Date().toISOString()
  };
}

/**
 * Standardize external OpenWeatherMap forecast response
 */
function formatForecastData(raw, units = 'metric') {
  const isImperial = units === 'imperial';
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const list = raw.list || [];

  const hourly = list.slice(0, 8).map((item) => {
    const d = new Date(item.dt * 1000);
    const icon = item.weather?.[0]?.icon || '01d';
    return {
      dt: item.dt,
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temp: Math.round(item.main?.temp),
      condition: item.weather?.[0]?.main || 'Clear',
      icon,
      iconUrl: `https://openweathermap.org/img/wn/${icon}@2x.png`,
      pop: Math.round((item.pop || 0) * 100)
    };
  });

  const dailyMap = {};
  const todayStr = new Date().toISOString().split('T')[0];

  list.forEach((item) => {
    const itemDate = new Date(item.dt * 1000);
    const dateStr = itemDate.toISOString().split('T')[0];

    if (!dailyMap[dateStr] && dateStr !== todayStr) {
      dailyMap[dateStr] = {
        date: dateStr,
        dayName: days[itemDate.getDay()],
        temps: [],
        conditions: [],
        icons: [],
        humidities: [],
        pops: []
      };
    }

    if (dailyMap[dateStr]) {
      dailyMap[dateStr].temps.push(item.main.temp);
      dailyMap[dateStr].conditions.push(item.weather?.[0]?.main || 'Clear');
      dailyMap[dateStr].icons.push(item.weather?.[0]?.icon || '01d');
      dailyMap[dateStr].humidities.push(item.main?.humidity || 50);
      dailyMap[dateStr].pops.push(item.pop || 0);
    }
  });

  const daily = Object.values(dailyMap).slice(0, 5).map((entry, idx) => {
    const min = Math.round(Math.min(...entry.temps));
    const max = Math.round(Math.max(...entry.temps));
    const avgHumidity = Math.round(entry.humidities.reduce((a, b) => a + b, 0) / entry.humidities.length);
    const maxPop = Math.round(Math.max(...entry.pops) * 100);
    const icon = entry.icons[Math.floor(entry.icons.length / 2)] || entry.icons[0] || '01d';
    const condition = entry.conditions[Math.floor(entry.conditions.length / 2)] || entry.conditions[0] || 'Clear';

    return {
      date: entry.date,
      dayName: idx === 0 ? 'Tomorrow' : entry.dayName,
      tempMin: min,
      tempMax: max,
      condition,
      description: condition.toLowerCase(),
      icon,
      iconUrl: `https://openweathermap.org/img/wn/${icon}@2x.png`,
      humidity: avgHumidity,
      pop: maxPop
    };
  });

  return {
    isMock: false,
    city: raw.city?.name,
    country: raw.city?.country,
    units: isImperial ? 'imperial' : 'metric',
    unitSymbol: isImperial ? '°F' : '°C',
    hourly,
    daily,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Backend Proxy Request with Automatic Direct Fallback for GitHub Pages
 */
async function apiRequest(endpoint, params = {}) {
  // Try backend proxy first (works in local dev & cloud backends)
  try {
    const url = new URL(`${window.location.origin}${API_BASE}${endpoint}`);
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        url.searchParams.append(key, params[key]);
      }
    });

    const response = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(3000)
    });

    if (response.ok) {
      const json = await response.json();
      if (json.success) {
        const cacheHeader = response.headers.get('X-Cache');
        return {
          ...json,
          cacheHeader: cacheHeader || (json.fromCache ? 'HIT' : 'MISS')
        };
      }
    }
  } catch (err) {
    // If backend proxy is not reachable (e.g. static hosting on GitHub Pages), fall through to direct mode
  }

  // Standalone GitHub Pages Mode (Direct OpenWeather with client-side caching)
  return handleDirectOpenWeather(endpoint, params);
}

/**
 * Direct OpenWeather handler for static hosting environments
 */
async function handleDirectOpenWeather(endpoint, params = {}) {
  const units = params.units || 'metric';

  if (endpoint === '/health') {
    return {
      success: true,
      status: 'online',
      hasApiKey: true,
      environment: 'github-pages',
      cache: { defaultTtl: 600, keys: clientMemoryCache.size },
      timestamp: new Date().toISOString()
    };
  }

  if (endpoint === '/current') {
    const cacheKey = `direct:current:${params.city || `${params.lat},${params.lon}`}:${units}`;
    const cached = getClientCached(cacheKey);
    if (cached) {
      return { success: true, fromCache: true, cacheHeader: 'HIT', data: cached };
    }

    const qParams = new URLSearchParams({ appid: DIRECT_KEY, units });
    if (params.lat && params.lon) {
      qParams.append('lat', params.lat);
      qParams.append('lon', params.lon);
    } else {
      qParams.append('q', params.city || 'London');
    }

    const res = await fetch(`${OPENWEATHER_BASE}/weather?${qParams.toString()}`);
    if (!res.ok) {
      if (res.status === 404) throw new Error(`Location "${params.city}" not found.`);
      throw new Error(`OpenWeather returned error code ${res.status}`);
    }
    const raw = await res.json();
    const formatted = formatCurrentWeatherData(raw, units);
    setClientCached(cacheKey, formatted);

    return { success: true, fromCache: false, cacheHeader: 'MISS', data: formatted };
  }

  if (endpoint === '/forecast') {
    const cacheKey = `direct:forecast:${params.city || `${params.lat},${params.lon}`}:${units}`;
    const cached = getClientCached(cacheKey);
    if (cached) {
      return { success: true, fromCache: true, cacheHeader: 'HIT', data: cached };
    }

    const qParams = new URLSearchParams({ appid: DIRECT_KEY, units });
    if (params.lat && params.lon) {
      qParams.append('lat', params.lat);
      qParams.append('lon', params.lon);
    } else {
      qParams.append('q', params.city || 'London');
    }

    const res = await fetch(`${OPENWEATHER_BASE}/forecast?${qParams.toString()}`);
    if (!res.ok) throw new Error(`Forecast request failed (${res.status})`);
    const raw = await res.json();
    const formatted = formatForecastData(raw, units);
    setClientCached(cacheKey, formatted);

    return { success: true, fromCache: false, cacheHeader: 'MISS', data: formatted };
  }

  if (endpoint === '/search') {
    const q = params.q || '';
    if (!q.trim()) return { success: true, data: [] };

    try {
      const qParams = new URLSearchParams({ q, limit: '5', appid: DIRECT_KEY });
      const res = await fetch(`${GEO_BASE}/direct?${qParams.toString()}`);
      if (!res.ok) return { success: true, data: [] };
      const raw = await res.json();
      const list = raw.map((item) => ({
        name: item.name,
        country: item.country,
        state: item.state,
        lat: item.lat,
        lon: item.lon
      }));
      return { success: true, data: list };
    } catch (e) {
      return { success: true, data: [] };
    }
  }

  return { success: true, data: null };
}

export const fetchCurrentWeather = async ({ city, lat, lon, units = 'metric' }) => {
  return apiRequest('/current', { city, lat, lon, units });
};

export const fetchForecast = async ({ city, lat, lon, units = 'metric' }) => {
  return apiRequest('/forecast', { city, lat, lon, units });
};

export const searchCities = async (query) => {
  if (!query || query.trim().length === 0) return [];
  const res = await apiRequest('/search', { q: query });
  return res.data || [];
};

export const fetchAppStatus = async () => {
  return apiRequest('/health');
};

export const clearBackendCache = async () => {
  clientMemoryCache.clear();
  try {
    const url = `${window.location.origin}${API_BASE}/cache/clear`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  } catch (e) {
    return { success: true, message: 'Client cache cleared' };
  }
};
