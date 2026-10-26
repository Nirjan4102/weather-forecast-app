import { Router } from 'express';
import {
  getCurrentWeather,
  getForecast,
  searchLocations,
  getStatus,
  clearCache
} from '../controllers/weatherController.js';

const router = Router();

// Route: Get current weather for city or lat/lon
router.get('/current', getCurrentWeather);

// Route: Get 5-day / 3-hour forecast for city or lat/lon
router.get('/forecast', getForecast);

// Route: Search city suggestions
router.get('/search', searchLocations);

// Route: Health, API key check and Cache statistics
router.get('/health', getStatus);

// Route: Invalidate/Flush Cache
router.post('/cache/clear', clearCache);

export default router;
