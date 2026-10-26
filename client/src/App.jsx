import React from 'react';
import { useWeather } from './hooks/useWeather';
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import WeatherMetrics from './components/WeatherMetrics';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import { FallbackNotice, ErrorAlert } from './components/StatusAlerts';
import TechSpecs from './components/TechSpecs';
import { Loader2 } from 'lucide-react';

export default function App() {
  const {
    city,
    units,
    setUnits,
    currentWeather,
    forecast,
    loading,
    error,
    cacheHit,
    appStatus,
    recentSearches,
    searchByCity,
    searchByCoords,
    searchCurrentLocation,
    refresh,
    purgeCacheAndRefresh
  } = useWeather('London');

  // Dynamic theme class according to current atmospheric condition
  const condition = currentWeather?.weather?.main?.toLowerCase() || '';
  let conditionClass = '';
  if (condition.includes('clear')) conditionClass = 'condition-clear';
  else if (condition.includes('rain') || condition.includes('drizzle')) conditionClass = 'condition-rain';
  else if (condition.includes('cloud')) conditionClass = 'condition-clouds';

  const isMock = currentWeather?.isMock ?? (appStatus?.hasApiKey === false);

  return (
    <div className={`app-wrapper ${conditionClass}`}>
      <div className="app-container">
        {/* Navigation Bar */}
        <Navbar
          units={units}
          setUnits={setUnits}
          cacheHit={cacheHit}
          appStatus={appStatus}
          onRefresh={refresh}
          onPurgeCache={purgeCacheAndRefresh}
          loading={loading}
        />

        {/* Fallback Notice if no API key is configured yet */}
        <FallbackNotice isMock={isMock} />

        {/* Error message banner */}
        <ErrorAlert error={error} onRetry={refresh} />

        {/* Search Bar with auto-complete and quick pills */}
        <SearchBar
          onSearch={searchByCity}
          onLocationSearch={searchCurrentLocation}
          onSelectCoords={searchByCoords}
          activeCity={currentWeather?.city || city}
          recentCities={recentSearches}
          loading={loading}
        />

        {/* Loading Spinner */}
        {loading && !currentWeather ? (
          <div className="spinner-container">
            <div className="spinner"></div>
            <p style={{ color: 'var(--text-muted)' }}>Fetching live weather metrics...</p>
          </div>
        ) : (
          <>
            {/* Main Weather Dashboard */}
            {currentWeather && (
              <div className="dashboard-grid">
                {/* Left Column: Hero Current Weather & 24h Hourly Forecast */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <CurrentWeather data={currentWeather} units={units} />
                  <HourlyForecast
                    hourly={forecast?.hourly}
                    unitSymbol={forecast?.unitSymbol || (units === 'imperial' ? '°F' : '°C')}
                  />
                </div>

                {/* Right Column: Environmental Metrics & 5-Day Extended Forecast */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <WeatherMetrics metrics={currentWeather.metrics} sun={currentWeather.sun} />
                  <DailyForecast
                    daily={forecast?.daily}
                    unitSymbol={forecast?.unitSymbol || (units === 'imperial' ? '°F' : '°C')}
                  />
                </div>
              </div>
            )}

            {/* Architecture and Engineering Specifications */}
            <TechSpecs appStatus={appStatus} cacheHit={cacheHit} />
          </>
        )}

        {/* Footer */}
        <footer className="app-footer">
          Weather Forecast Application • Built with React.js & Express.js Proxy • OpenWeatherMap Engine
        </footer>
      </div>
    </div>
  );
}
