import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { config, hasValidApiKey } from './config.js';
import weatherRoutes from './routes/weatherRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.join(__dirname, '../../client/dist');

const app = express();

// Trust proxy for rate limiting behind reverse proxies (like Vite, Nginx, Render)
app.set('trust proxy', 1);

// CORS configuration - allow development and production origins
app.use(cors({
  origin: true,
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
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

app.use('/api', apiLimiter);

// Weather API Routes
app.use('/api/weather', weatherRoutes);

// In production, serve the built React frontend from client/dist
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));

  // Client-side routing fallback (Express 5 compatible)
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.originalUrl.startsWith('/api')) {
      return res.sendFile(path.join(clientDist, 'index.html'));
    }
    next();
  });
} else {
  // Development fallback route
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
}

// 404 Handler for API routes
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

// Start Server
const server = app.listen(config.port, () => {
  console.log(`===============================================`);
  console.log(`🌤️  Weather Forecast Full-Stack Server Running`);
  console.log(`📍 Port: http://localhost:${config.port}`);
  console.log(`🔐 OpenWeather API Key: ${hasValidApiKey() ? 'Configured ✅' : 'Missing/Fallback Mode Active ⚠️'}`);
  console.log(`⚡ In-Memory Cache TTL: ${config.cacheTtlSeconds}s`);
  console.log(`📦 Serving Frontend: ${fs.existsSync(clientDist) ? 'client/dist Active ✅' : 'API only'}`);
  console.log(`===============================================`);
});

export default app;
