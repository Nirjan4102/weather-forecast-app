import React from 'react';
import { MapPin, ArrowUp, ArrowDown, Thermometer, Clock } from 'lucide-react';

export default function CurrentWeather({ data, units }) {
  if (!data) return null;

  const {
    city,
    country,
    weather,
    temperature,
    coordinates,
    updatedAt
  } = data;

  const unitSymbol = units === 'imperial' ? '°F' : '°C';
  const formattedTime = new Date(updatedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  const formattedDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="glass-card hero-card">
      <div className="hero-glow"></div>

      <div className="hero-header">
        <div>
          <h2 className="location-title">{city}</h2>
          <div className="location-country">
            <MapPin size={16} />
            <span>{country || 'Global'}</span>
            {coordinates?.lat && coordinates?.lon && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginLeft: '6px' }}>
                ({coordinates.lat.toFixed(2)}°, {coordinates.lon.toFixed(2)}°)
              </span>
            )}
          </div>
          <div className="location-date">{formattedDate}</div>
        </div>

        <div className="weather-badge-pill">
          <Clock size={14} style={{ color: 'var(--accent-cyan)' }} />
          <span>Updated {formattedTime}</span>
        </div>
      </div>

      <div className="hero-body">
        <div>
          <div className="temp-huge">
            {temperature.current}
            <span style={{ fontSize: '3rem', fontWeight: '400', verticalAlign: 'super' }}>
              {unitSymbol}
            </span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px' }}>
            Feels like <strong>{temperature.feelsLike}{unitSymbol}</strong>
          </div>
        </div>

        <div className="condition-details">
          <img
            src={weather.iconUrl}
            alt={weather.description}
            className="weather-icon-large"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://openweathermap.org/img/wn/02d@2x.png';
            }}
          />
          <div className="condition-text">{weather.main}</div>
          <div className="condition-desc">{weather.description}</div>
        </div>
      </div>

      <div className="hero-footer">
        <div className="temp-range">
          <div className="temp-stat" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUp size={16} style={{ color: '#f87171' }} />
            <span>High: <strong>{temperature.max}{unitSymbol}</strong></span>
          </div>
          <div className="temp-stat" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowDown size={16} style={{ color: '#60a5fa' }} />
            <span>Low: <strong>{temperature.min}{unitSymbol}</strong></span>
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          Atmospheric condition: <strong>{weather.main}</strong>
        </div>
      </div>
    </div>
  );
}
