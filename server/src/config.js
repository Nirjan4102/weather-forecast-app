import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY ? process.env.OPENWEATHER_API_KEY.trim() : '',
  cacheTtlSeconds: parseInt(process.env.CACHE_TTL_SECONDS, 10) || 600, // 10 minutes default
  isMockFallbackEnabled: true
};

export const hasValidApiKey = () => {
  return Boolean(config.openWeatherApiKey && config.openWeatherApiKey.length >= 16);
};
