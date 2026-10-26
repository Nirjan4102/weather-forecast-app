import React from 'react';
import { CloudSun, ShieldCheck, Zap, RefreshCw, Database } from 'lucide-react';

export default function Navbar({
  units,
  setUnits,
  cacheHit,
  appStatus,
  onRefresh,
  onPurgeCache,
  loading
}) {
  const isMock = appStatus?.hasApiKey === false;

  return (
    <header className="navbar">
      <div className="brand">
        <div className="brand-icon">
          <CloudSun size={24} />
        </div>
        <div>
          <h1 className="brand-title">WeatherSky</h1>
          <div className="brand-subtitle">API-Driven Forecast Engine</div>
        </div>
      </div>

      <div className="nav-actions">
        {/* Backend Proxy & API Key status indicator */}
        <div
          className={`badge ${isMock ? 'badge-mock' : 'badge-live'}`}
          title={isMock ? 'Live API Key missing in backend. Running realistic Fallback Mode.' : 'Secured via Express Backend Proxy'}
        >
          <span className="status-dot"></span>
          <ShieldCheck size={14} />
          <span>{isMock ? 'Fallback Mock' : 'Live OpenWeather'}</span>
        </div>

        {/* Cache Hit indicator */}
        <div
          className={`badge badge-cache`}
          title={`In-Memory Cache (TTL: ${appStatus?.cache?.defaultTtl || 600}s)`}
        >
          <Database size={13} />
          <span>{cacheHit ? 'Cache HIT' : 'Cache MISS'}</span>
        </div>

        {/* Unit Toggle */}
        <div className="unit-toggle-group" role="group" aria-label="Temperature Units">
          <button
            type="button"
            className={`unit-btn ${units === 'metric' ? 'active' : ''}`}
            onClick={() => setUnits('metric')}
          >
            °C
          </button>
          <button
            type="button"
            className={`unit-btn ${units === 'imperial' ? 'active' : ''}`}
            onClick={() => setUnits('imperial')}
          >
            °F
          </button>
        </div>

        {/* Refresh button */}
        <button
          type="button"
          className="btn-icon"
          onClick={onRefresh}
          disabled={loading}
          title="Refresh current forecast"
        >
          <RefreshCw size={17} className={loading ? 'spinner' : ''} />
        </button>

        {/* Flush Cache button */}
        <button
          type="button"
          className="btn-icon"
          onClick={onPurgeCache}
          disabled={loading}
          title="Bypass & Purge Backend Cache"
        >
          <Zap size={17} />
        </button>
      </div>
    </header>
  );
}
