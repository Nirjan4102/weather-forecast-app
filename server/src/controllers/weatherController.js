import { fetchCurrentWeather, fetchForecast, searchCities } from '../services/weatherService.js';
import { getOrFetch, getCacheStats, flushCache } from '../services/cacheService.js';
import { hasValidApiKey, config } from '../config.js';

/**
 * Controller: Get Current Weather
 */
export const getCurrentWeather = async (req, res, next) => {
  try {
    const { city, lat, lon, units = 'metric' } = req.query;

    if (!city && (!lat || !lon)) {
      return res.status(400).json({
        success: false,
        error: 'Either "city" or both "lat" and "lon" query parameters are required.'
      });
    }

    const normalizedUnits = units.toLowerCase() === 'imperial' ? 'imperial' : 'metric';
    const locationKey = city ? `city:${city.toLowerCase().trim()}` : `geo:${Number(lat).toFixed(2)},${Number(lon).toFixed(2)}`;
    const cacheKey = `current:${locationKey}:${normalizedUnits}`;

    const { data, fromCache } = await getOrFetch(cacheKey, () =>
      fetchCurrentWeather({
        city: city ? city.trim() : undefined,
        lat: lat ? parseFloat(lat) : undefined,
        lon: lon ? parseFloat(lon) : undefined,
        units: normalizedUnits
      })
    );

    res.set('X-Cache', fromCache ? 'HIT' : 'MISS');
    return res.status(200).json({
      success: true,
      fromCache,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get 5-Day / 3-Hour Forecast
 */
export const getForecast = async (req, res, next) => {
  try {
    const { city, lat, lon, units = 'metric' } = req.query;

    if (!city && (!lat || !lon)) {
      return res.status(400).json({
        success: false,
        error: 'Either "city" or both "lat" and "lon" query parameters are required.'
      });
    }

    const normalizedUnits = units.toLowerCase() === 'imperial' ? 'imperial' : 'metric';
    const locationKey = city ? `city:${city.toLowerCase().trim()}` : `geo:${Number(lat).toFixed(2)},${Number(lon).toFixed(2)}`;
    const cacheKey = `forecast:${locationKey}:${normalizedUnits}`;

    const { data, fromCache } = await getOrFetch(cacheKey, () =>
      fetchForecast({
        city: city ? city.trim() : undefined,
        lat: lat ? parseFloat(lat) : undefined,
        lon: lon ? parseFloat(lon) : undefined,
        units: normalizedUnits
      })
    );

    res.set('X-Cache', fromCache ? 'HIT' : 'MISS');
    return res.status(200).json({
      success: true,
      fromCache,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Search City Auto-complete
 */
export const searchLocations = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const cacheKey = `search:${q.toLowerCase().trim()}`;
    const { data, fromCache } = await getOrFetch(
      cacheKey,
      () => searchCities(q),
      3600 // cache searches for 1 hour
    );

    res.set('X-Cache', fromCache ? 'HIT' : 'MISS');
    return res.status(200).json({
      success: true,
      fromCache,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: App Health & Cache Management
 */
export const getStatus = (req, res) => {
  const cacheStats = getCacheStats();
  return res.status(200).json({
    success: true,
    status: 'online',
    hasApiKey: hasValidApiKey(),
    environment: config.nodeEnv,
    cache: cacheStats,
    timestamp: new Date().toISOString()
  });
};

/**
 * Controller: Clear Cache
 */
export const clearCache = (req, res) => {
  flushCache();
  return res.status(200).json({
    success: true,
    message: 'Cache successfully flushed'
  });
};
