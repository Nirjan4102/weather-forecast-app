import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config, hasValidApiKey } from './config.js';
import weatherRoutes from './routes/weatherRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

// Trust proxy for rate limiting behind reverse proxies (like Vite or Nginx)
app.set('trust proxy', 1);

// CORS configuration - allow frontend development server
app.use(cors({
  origin: config.corsOrigin === '*' ? true : [config.corsOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  exposedHeaders: ['X-Cache']
}));

// Request logging
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

// Body parsing
app.use(express.json());

// API Rate Limiting (Prevents abuse and upstream API quota exhaustion)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 120, // Limit each IP to 120 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

app.use('/api', apiLimiter);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Weather Forecast API Proxy',
    version: '1.0.0',
    status: 'running',
    hasApiKey: hasValidApiKey(),
    docs: {
      current: '/api/weather/current?city=London&units=metric',
      forecast: '/api/weather/forecast?city=London&units=metric',
      search: '/api/weather/search?q=Lon',
      health: '/api/weather/health'
    }
  });
});

// Weather API Routes
app.use('/api/weather', weatherRoutes);

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

// Start Server
const server = app.listen(config.port, () => {
  console.log(`===============================================`);
  console.log(`🌤️  Weather Forecast Backend Server Running`);
  console.log(`📍 Port: http://localhost:${config.port}`);
  console.log(`🔐 OpenWeather API Key: ${hasValidApiKey() ? 'Configured ✅' : 'Missing/Fallback Mode Active ⚠️'}`);
  console.log(`⚡ In-Memory Cache TTL: ${config.cacheTtlSeconds}s`);
  console.log(`===============================================`);
});

export default app;
