import React from 'react';
import { Calendar, Droplets } from 'lucide-react';

export default function DailyForecast({ daily = [], unitSymbol = '°C' }) {
  if (!daily || daily.length === 0) return null;

  // Find absolute min and max to scale visual bar graph
  const allMins = daily.map((d) => d.tempMin);
  const allMaxs = daily.map((d) => d.tempMax);
  const minTempAll = Math.min(...allMins);
  const maxTempAll = Math.max(...allMaxs);
  const tempRange = Math.max(1, maxTempAll - minTempAll);

  return (
    <div className="forecast-section">
      <div className="section-title">
        <Calendar size={18} style={{ color: 'var(--accent-cyan)' }} />
        <span>5-Day Extended Outlook</span>
      </div>

      <div className="daily-list">
        {daily.map((day) => {
          // Calculate bar fill percentage
          const leftPercent = Math.max(0, ((day.tempMin - minTempAll) / tempRange) * 100);
          const widthPercent = Math.max(15, ((day.tempMax - day.tempMin) / tempRange) * 100);

          return (
            <div key={day.date} className="glass-card daily-row">
              <div className="daily-day">{day.dayName}</div>

              <div className="daily-condition">
                <img
                  src={day.iconUrl}
                  alt={day.condition}
                  className="daily-icon"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://openweathermap.org/img/wn/02d@2x.png';
                  }}
                />
                <span className="daily-condition-name">{day.condition}</span>
                {day.pop > 10 && (
                  <span style={{ fontSize: '0.75rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <Droplets size={10} />
                    {day.pop}%
                  </span>
                )}
              </div>

              <div className="daily-bar-container">
                <div className="daily-bar-track">
                  <div
                    className="daily-bar-fill"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${Math.min(100 - leftPercent, widthPercent)}%`
                    }}
                  ></div>
                </div>
              </div>

              <div className="daily-temps">
                <span>{day.tempMax}{unitSymbol}</span>
                <span className="daily-temp-min">{day.tempMin}{unitSymbol}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
