import React from 'react';
import {
  Droplets,
  Wind,
  Gauge,
  Eye,
  Sunrise,
  Sunset,
  Cloud,
  Compass
} from 'lucide-react';

export default function WeatherMetrics({ metrics, sun }) {
  if (!metrics) return null;

  const {
    humidity = 0,
    windSpeed = 0,
    windSpeedUnit = 'm/s',
    windDeg = 0,
    pressure = 1013,
    visibility = 10000,
    clouds = 0,
    uvIndex = null
  } = metrics;

  const visibilityKm = visibility ? (visibility / 1000).toFixed(1) : '10.0';

  // Format sunrise/sunset if available
  const formatSunTime = (timestamp) => {
    if (!timestamp) return '--:--';
    return new Date(timestamp * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Convert wind degrees to cardinal direction
  const getWindDirection = (deg) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(deg / 45) % 8];
  };

  return (
    <div className="metrics-grid">
      {/* Humidity */}
      <div className="glass-card metric-card">
        <div className="metric-header">
          <span>Humidity</span>
          <div className="metric-icon-box">
            <Droplets size={18} />
          </div>
        </div>
        <div className="metric-value">{humidity}%</div>
        <div className="metric-footer">
          {humidity > 70 ? 'High moisture level' : (humidity < 35 ? 'Dry conditions' : 'Comfortable balance')}
        </div>
      </div>

      {/* Wind Speed & Direction */}
      <div className="glass-card metric-card">
        <div className="metric-header">
          <span>Wind</span>
          <div className="metric-icon-box">
            <Wind size={18} />
          </div>
        </div>
        <div className="metric-value">
          {windSpeed} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{windSpeedUnit}</span>
        </div>
        <div className="metric-footer" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Compass size={13} style={{ transform: `rotate(${windDeg}deg)` }} />
          <span>Direction: {getWindDirection(windDeg)} ({windDeg}°)</span>
        </div>
      </div>

      {/* Pressure */}
      <div className="glass-card metric-card">
        <div className="metric-header">
          <span>Air Pressure</span>
          <div className="metric-icon-box">
            <Gauge size={18} />
          </div>
        </div>
        <div className="metric-value">{pressure} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>hPa</span></div>
        <div className="metric-footer">
          {pressure > 1013 ? 'High pressure (Fair weather)' : 'Low pressure system'}
        </div>
      </div>

      {/* Visibility */}
      <div className="glass-card metric-card">
        <div className="metric-header">
          <span>Visibility</span>
          <div className="metric-icon-box">
            <Eye size={18} />
          </div>
        </div>
        <div className="metric-value">{visibilityKm} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>km</span></div>
        <div className="metric-footer">
          {visibility >= 10000 ? 'Clear line of sight' : 'Moderate or haze restriction'}
        </div>
      </div>

      {/* Sun Times */}
      <div className="glass-card metric-card">
        <div className="metric-header">
          <span>Sunrise</span>
          <div className="metric-icon-box" style={{ color: '#fbbf24' }}>
            <Sunrise size={18} />
          </div>
        </div>
        <div className="metric-value" style={{ fontSize: '1.35rem' }}>
          {formatSunTime(sun?.sunrise)}
        </div>
        <div className="metric-footer">Dawn schedule</div>
      </div>

      {/* Sunset */}
      <div className="glass-card metric-card">
        <div className="metric-header">
          <span>Sunset</span>
          <div className="metric-icon-box" style={{ color: '#f87171' }}>
            <Sunset size={18} />
          </div>
        </div>
        <div className="metric-value" style={{ fontSize: '1.35rem' }}>
          {formatSunTime(sun?.sunset)}
        </div>
        <div className="metric-footer">Dusk schedule</div>
      </div>
    </div>
  );
}
