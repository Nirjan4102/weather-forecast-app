import React from 'react';
import { Clock, Droplets } from 'lucide-react';

export default function HourlyForecast({ hourly = [], unitSymbol = '°C' }) {
  if (!hourly || hourly.length === 0) return null;

  return (
    <div className="forecast-section">
      <div className="section-title">
        <Clock size={18} style={{ color: 'var(--accent-cyan)' }} />
        <span>24-Hour Forecast (3-Hour Intervals)</span>
      </div>

      <div className="hourly-scroll">
        {hourly.map((item, index) => (
          <div key={`${item.dt}-${index}`} className="glass-card hourly-item">
            <span className="hourly-time">{index === 0 ? 'Now' : item.time}</span>
            <img
              src={item.iconUrl}
              alt={item.condition}
              className="hourly-icon"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://openweathermap.org/img/wn/02d@2x.png';
              }}
            />
            <span className="hourly-temp">{item.temp}{unitSymbol}</span>
            {item.pop !== undefined && item.pop > 0 && (
              <span className="hourly-pop">
                <Droplets size={10} />
                {item.pop}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
