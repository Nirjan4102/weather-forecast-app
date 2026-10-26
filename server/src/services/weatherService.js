import axios from 'axios';
import { config, hasValidApiKey } from '../config.js';

const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEOCODING_BASE_URL = 'https://api.openweathermap.org/geo/1.0';

// Predefined mock database for realistic fallbacks if API key is absent or failing
const KNOWN_CITIES = {
  london: { name: 'London', country: 'GB', lat: 51.5074, lon: -0.1278, tempC: 15, condition: 'Rain', desc: 'light rain', icon: '10d', humidity: 78, windSpeed: 4.8, pressure: 1012, visibility: 9000 },
  tokyo: { name: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503, tempC: 22, condition: 'Clear', desc: 'clear sky', icon: '01d', humidity: 55, windSpeed: 3.2, pressure: 1018, visibility: 10000 },
  'new york': { name: 'New York', country: 'US', lat: 40.7128, lon: -74.0060, tempC: 18, condition: 'Clouds', desc: 'broken clouds', icon: '04d', humidity: 62, windSpeed: 5.5, pressure: 1015, visibility: 10000 },
  paris: { name: 'Paris', country: 'FR', lat: 48.8566, lon: 2.3522, tempC: 19, condition: 'Clear', desc: 'clear sky', icon: '01d', humidity: 58, windSpeed: 3.6, pressure: 1016, visibility: 10000 },
  delhi: { name: 'Delhi', country: 'IN', lat: 28.6139, lon: 77.2090, tempC: 31, condition: 'Haze', desc: 'haze', icon: '50d', humidity: 45, windSpeed: 2.5, pressure: 1008, visibility: 4000 },
  sydney: { name: 'Sydney', country: 'AU', lat: -33.8688, lon: 151.2093, tempC: 24, condition: 'Clouds', desc: 'scattered clouds', icon: '03d', humidity: 65, windSpeed: 6.2, pressure: 1020, visibility: 10000 }
};

/**
 * Generate synthetic realistic weather for any city or lat/lon
 */
const generateMockWeatherData = (cityQuery = 'New York', units = 'metric', lat = null, lon = null) => {
  const normCity = (cityQuery || 'New York').toLowerCase().trim();
  const base = KNOWN_CITIES[normCity] || {
    name: cityQuery ? (cityQuery.charAt(0).toUpperCase() + cityQuery.slice(1)) : 'Custom Location',
    country: 'GLOBAL',
    lat: lat || 37.7749,
    lon: lon || -122.4194,
    tempC: 20,
    condition: 'Clear',
    desc: 'clear sky',
    icon: '01d',
    humidity: 60,
    windSpeed: 4.1,
    pressure: 1014,
    visibility: 10000
  };

  const isImperial = units === 'imperial';
  const temp = isImperial ? Math.round((base.tempC * 9) / 5 + 32) : base.tempC;
  const feelsLike = isImperial ? temp + 2 : temp + 1;
  const tempMin = temp - 3;
  const tempMax = temp + 4;
  const windSpeed = isImperial ? Math.round(base.windSpeed * 2.237 * 10) / 10 : base.windSpeed;

  const now = Math.floor(Date.now() / 1000);

  return {
    isMock: true,
    source: 'Fallback Engine (Configure OPENWEATHER_API_KEY for live data)',
    city: base.name,
    country: base.country,
    coordinates: {
      lat: base.lat,
      lon: base.lon
    },
    weather: {
      main: base.condition,
      description: base.desc,
      icon: base.icon,
      iconUrl: `https://openweathermap.org/img/wn/${base.icon}@2x.png`
    },
    temperature: {
      current: temp,
      feelsLike,
      min: tempMin,
      max: tempMax,
      unit: isImperial ? '°F' : '°C'
    },
    metrics: {
      humidity: base.humidity,
      windSpeed,
      windSpeedUnit: isImperial ? 'mph' : 'm/s',
      windDeg: 210,
      pressure: base.pressure,
      visibility: base.visibility,
      clouds: 20,
      uvIndex: 5.4
    },
    sun: {
      sunrise: now - 18000,
      sunset: now + 25200,
      timezone: 0
    },
    updatedAt: new Date().toISOString()
  };
};

/**
 * Generate synthetic realistic 5-day / 3-hour forecast
 */
const generateMockForecastData = (cityQuery = 'New York', units = 'metric', lat = null, lon = null) => {
  const current = generateMockWeatherData(cityQuery, units, lat, lon);
  const isImperial = units === 'imperial';
  const baseTemp = current.temperature.current;

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  // Generate 8 3-hour intervals for next 24 hours
  const hourly = [];
  for (let i = 0; i < 8; i++) {
    const time = new Date(today.getTime() + (i + 1) * 3 * 3600 * 1000);
    const hourVariance = Math.round(Math.sin((i / 8) * Math.PI) * 4 - 2);
    hourly.push({
      dt: Math.floor(time.getTime() / 1000),
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temp: baseTemp + hourVariance,
      condition: i % 3 === 0 ? 'Clouds' : (i % 2 === 0 ? 'Clear' : current.weather.main),
      icon: i % 2 === 0 ? '01d' : '02d',
      iconUrl: `https://openweathermap.org/img/wn/${i % 2 === 0 ? '01d' : '02d'}@2x.png`,
      pop: Math.round(Math.random() * 20) // probability of precipitation
    });
  }

  // Generate 5-day daily forecast
  const daily = [];
  for (let i = 0; i < 5; i++) {
    const dayDate = new Date(today.getTime() + (i + 1) * 24 * 3600 * 1000);
    const dayName = i === 0 ? 'Tomorrow' : days[dayDate.getDay()];
    const variance = (i % 2 === 0 ? 1 : -1) * (i + 1);
    daily.push({
      date: dayDate.toISOString().split('T')[0],
      dayName,
      tempMin: baseTemp - 4 + variance,
      tempMax: baseTemp + 4 + variance,
      condition: i === 2 ? 'Rain' : (i === 4 ? 'Clouds' : 'Clear'),
      description: i === 2 ? 'light rain' : 'partly cloudy',
      icon: i === 2 ? '10d' : (i === 4 ? '03d' : '01d'),
      iconUrl: `https://openweathermap.org/img/wn/${i === 2 ? '10d' : (i === 4 ? '03d' : '01d')}@2x.png`,
      humidity: Math.min(95, current.metrics.humidity + (i * 3)),
      pop: i === 2 ? 65 : 15
    });
  }

  return {
    isMock: true,
    city: current.city,
    country: current.country,
    units: isImperial ? 'imperial' : 'metric',
    unitSymbol: isImperial ? '°F' : '°C',
    hourly,
    daily,
    updatedAt: new Date().toISOString()
  };
};

/**
 * Standardize external OpenWeatherMap current weather response
 */
const formatCurrentWeatherData = (raw, units = 'metric') => {
  const isImperial = units === 'imperial';
  const icon = raw.weather?.[0]?.icon || '01d';

  return {
    isMock: false,
    source: 'OpenWeatherMap Live API',
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
      uvIndex: null // Standard 2.5 current API does not include UV, populated when OneCall is used
    },
    sun: {
      sunrise: raw.sys?.sunrise,
      sunset: raw.sys?.sunset,
      timezone: raw.timezone
    },
    updatedAt: new Date().toISOString()
  };
};

/**
 * Standardize external OpenWeatherMap 5-day / 3-hour forecast
 */
const formatForecastData = (raw, units = 'metric') => {
  const isImperial = units === 'imperial';
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Parse 3-hour intervals into 24h hourly and 5-day daily
  const list = raw.list || [];

  // Next 8 slots (~24 hours)
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

  // Group by calendar day for 5-day summary
  const dailyMap = {};
  const todayStr = new Date().toISOString().split('T')[0];

  list.forEach((item) => {
    const itemDate = new Date(item.dt * 1000);
    const dateStr = itemDate.toISOString().split('T')[0];

    // Exclude today to give distinct upcoming 5 days
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

    // Pick midday icon or fallback to first
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
};

/**
 * Fetch current weather with async/await
 */
export const fetchCurrentWeather = async ({ city, lat, lon, units = 'metric' }) => {
  if (!hasValidApiKey()) {
    return generateMockWeatherData(city, units, lat, lon);
  }

  try {
    const params = {
      appid: config.openWeatherApiKey,
      units
    };

    if (lat && lon) {
      params.lat = lat;
      params.lon = lon;
    } else if (city) {
      params.q = city;
    } else {
      throw new Error('City or coordinates required');
    }

    const response = await axios.get(`${OPENWEATHER_BASE_URL}/weather`, {
      params,
      timeout: 8000
    });

    return formatCurrentWeatherData(response.data, units);
  } catch (error) {
    // If upstream returns 404 (city not found), bubble up the 404 error
    if (error.response && error.response.status === 404) {
      const err = new Error(`City "${city}" not found.`);
      err.status = 404;
      throw err;
    }

    // For other errors (unauthorized key, timeout, rate-limit), fall back gracefully with mock data
    console.warn(`[OpenWeather API Warning] ${error.message}. Activating realistic fallback mode.`);
    return generateMockWeatherData(city, units, lat, lon);
  }
};

/**
 * Fetch 5-day / 3-hour forecast with async/await
 */
export const fetchForecast = async ({ city, lat, lon, units = 'metric' }) => {
  if (!hasValidApiKey()) {
    return generateMockForecastData(city, units, lat, lon);
  }

  try {
    const params = {
      appid: config.openWeatherApiKey,
      units
    };

    if (lat && lon) {
      params.lat = lat;
      params.lon = lon;
    } else if (city) {
      params.q = city;
    } else {
      throw new Error('City or coordinates required');
    }

    const response = await axios.get(`${OPENWEATHER_BASE_URL}/forecast`, {
      params,
      timeout: 8000
    });

    return formatForecastData(response.data, units);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      const err = new Error(`Forecast for "${city}" not found.`);
      err.status = 404;
      throw err;
    }

    console.warn(`[OpenWeather API Warning] ${error.message}. Activating realistic fallback forecast.`);
    return generateMockForecastData(city, units, lat, lon);
  }
};

/**
 * Search city suggestions using Geocoding API
 */
export const searchCities = async (query) => {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const q = query.trim().toLowerCase();

  if (!hasValidApiKey()) {
    // Return matching cities from internal mock database
    return Object.values(KNOWN_CITIES)
      .filter((c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q))
      .map((c) => ({
        name: c.name,
        country: c.country,
        lat: c.lat,
        lon: c.lon
      }));
  }

  try {
    const response = await axios.get(`${GEOCODING_BASE_URL}/direct`, {
      params: {
        q: query,
        limit: 5,
        appid: config.openWeatherApiKey
      },
      timeout: 5000
    });

    return response.data.map((item) => ({
      name: item.name,
      country: item.country,
      state: item.state,
      lat: item.lat,
      lon: item.lon
    }));
  } catch (error) {
    console.warn(`[Geocoding API Warning] ${error.message}. Returning fallback matches.`);
    return Object.values(KNOWN_CITIES)
      .filter((c) => c.name.toLowerCase().includes(q))
      .map((c) => ({
        name: c.name,
        country: c.country,
        lat: c.lat,
        lon: c.lon
      }));
  }
};
