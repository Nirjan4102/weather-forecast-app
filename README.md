# 🌤️ Weather Forecast Application (API-Driven Engineering Project)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-brightgreen?style=for-the-badge&logo=github)](https://nirjan4102.github.io/weather-forecast-app/)

🔗 **Public Live Application Link:** [https://nirjan4102.github.io/weather-forecast-app/](https://nirjan4102.github.io/weather-forecast-app/)

A full-stack, production-ready Weather Forecast Dashboard built with **React.js**, **Node.js with Express.js**, and **OpenWeatherMap API**. 

Designed with an emphasis on **API security**, **backend proxying**, **in-memory caching**, **resilient fallback handling**, and **dynamic UI updates**.

---

## 🏗️ Architecture & Security Design

```
┌─────────────────────────────────┐
│     React 18 Frontend           │
│   (Dashboard, Charts, Metrics)  │
└────────────────┬────────────────┘
                 │ Internal API Call: /api/weather/...
                 ▼
┌─────────────────────────────────┐
│     Express.js Backend Proxy    │
│  - Hides API secrets in .env    │
│  - In-Memory Cache (node-cache) │
│  - Rate Limiter & Sanitize      │
│  - Fallback Simulation Engine   │
└────────┬───────────────┬────────┘
         │ Live Key      │ Missing / Failing Key
         ▼               ▼
┌─────────────────┐ ┌───────────────────────────┐
│ OpenWeatherMap  │ │ Realistic Mock Generator  │
│ External API    │ │ (Zero downtime guarantee) │
└─────────────────┘ └───────────────────────────┘
```

### 1. Backend Proxy for API Security
* **No Client-Side Leaks**: The OpenWeatherMap API key is stored exclusively in `server/.env`. It is never bundled into client JavaScript or exposed to browser devtools.
* **CORS & Rate Limiting**: The Express proxy configures CORS and applies IP rate-limiting (120 requests per 15 minutes) to protect upstream quotas from denial-of-service abuse.

### 2. External API Integration with Async/Await
* Queries OpenWeatherMap's `weather`, `forecast`, and `geocoding` endpoints using modern `async/await` and Axios with strict timeout controls.

### 3. In-Memory Caching for Performance Optimization
* Uses `node-cache` with configurable TTL (default 10 minutes / 600s).
* Emits standard HTTP `X-Cache: HIT` or `X-Cache: MISS` headers.
* Reduces redundant external HTTP latency from ~300ms down to <5ms for cached coordinates and queries.
* UI includes an on-demand cache purge button to test live vs cached performance.

### 4. Resilient Error & Fallback Handling
* Handles invalid query parameters (HTTP 400).
* Catches non-existent cities gracefully (HTTP 404).
* **Automatic Fallback Mode**: If no OpenWeatherMap key is configured or upstream endpoints experience downtime, the backend seamlessly activates realistic synthetic meteorological data (`isMock: true`). The dashboard remains 100% testable out-of-the-box.

### 5. Dynamic UI Updates
* **Live Unit Switching**: Dynamic toggle between Metric (°C, m/s) and Imperial (°F, mph).
* **Geolocation Support**: One-click "Use Current Location" via browser HTML5 Geolocation API.
* **Auto-complete Search**: Debounced city suggestions.
* **24-Hour Hourly Ribbon**: 3-hour interval temperature trend with precipitation probability.
* **5-Day Extended Outlook**: Visual min-max temperature range bar graphs.
* **Environmental Metrics**: Humidity, Wind speed & direction compass, Atmospheric pressure, Visibility, and Sunrise/Sunset times.

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js** (v18 or higher)
* **npm** (v8 or higher)

### 1. Clone & Install Dependencies
```bash
# In the project root:
npm install --prefix server
npm install --prefix client
```

### 2. Configure Environment Variables

**Backend (`server/.env`):**
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Optional: Add your key from https://openweathermap.org/api
# If left empty, the application runs in realistic Fallback Mode automatically
OPENWEATHER_API_KEY=

# In-Memory Cache TTL in seconds (600 = 10 minutes)
CACHE_TTL_SECONDS=600
```

**Frontend (`client/.env`):**
```env
# Left blank to use the Vite reverse proxy (/api -> http://localhost:5000/api)
VITE_API_BASE_URL=
```

### 3. Run the Application

In terminal 1 (Start the Backend Proxy):
```bash
npm run server
# Running at http://localhost:5000
```

In terminal 2 (Start the React Frontend):
```bash
npm run client
# Running at http://localhost:5173
```

Open your browser at **`http://localhost:5173`**.

---

## 📡 API Endpoints (Backend Proxy)

| Endpoint | Method | Params | Description |
|---|---|---|---|
| `/api/weather/current` | `GET` | `city` OR `lat`, `lon`, `units` (`metric`\|`imperial`) | Fetches current weather snapshot |
| `/api/weather/forecast` | `GET` | `city` OR `lat`, `lon`, `units` (`metric`\|`imperial`) | Fetches 24-hr hourly & 5-day daily forecast |
| `/api/weather/search` | `GET` | `q` | Auto-complete city name search |
| `/api/weather/health` | `GET` | none | Reports server status, cache stats, and API key presence |
| `/api/weather/cache/clear` | `POST` | none | Flushes server in-memory cache |

---

## 📁 Project Structure

```
proj.2/
├── package.json               # Root scripts for client & server orchestration
├── README.md                  # Project documentation & architecture
├── server/                    # Node.js + Express API Backend Proxy
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   └── src/
│       ├── index.js           # Server entry point, CORS, Rate Limiter
│       ├── config.js          # Environment config & API key validation
│       ├── controllers/
│       │   └── weatherController.js  # Request handlers, cache inspection
│       ├── services/
│       │   ├── cacheService.js       # TTL In-Memory cache (node-cache)
│       │   └── weatherService.js     # OpenWeatherMap async API & fallback
│       ├── routes/
│       │   └── weatherRoutes.js      # Express router endpoints
│       └── middleware/
│           └── errorHandler.js       # Centralized 404 & error handlers
└── client/                    # React 18 + Vite Frontend Dashboard
    ├── .env.example
    ├── .env
    ├── package.json
    ├── vite.config.js         # Vite dev proxy configuration
    ├── index.html
    └── src/
        ├── main.jsx           # React DOM root
        ├── App.jsx            # Layout, dynamic background, state orchestration
        ├── index.css          # Modern glassmorphism CSS & animations
        ├── hooks/
        │   └── useWeather.js  # Data fetching, geolocation, cache state hook
        ├── services/
        │   └── api.js         # Frontend HTTP client
        └── components/
            ├── Navbar.jsx         # Header, unit switch, cache indicator
            ├── SearchBar.jsx      # Input, suggestions, geolocation, quick pills
            ├── CurrentWeather.jsx # Hero weather card
            ├── WeatherMetrics.jsx # Grid: humidity, wind, pressure, sun times
            ├── HourlyForecast.jsx # 24h scrollable forecast ribbon
            ├── DailyForecast.jsx  # 5-day forecast with range bars
            ├── StatusAlerts.jsx   # Fallback warning & error retry banner
            └── TechSpecs.jsx      # Live architecture & specs breakdown
```
