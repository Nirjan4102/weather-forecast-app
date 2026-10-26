import React from 'react';
import { AlertTriangle, AlertCircle, RefreshCw, Key } from 'lucide-react';

export function FallbackNotice({ isMock }) {
  if (!isMock) return null;

  return (
    <div className="alert-banner alert-warning">
      <div className="alert-content">
        <Key size={18} style={{ flexShrink: 0 }} />
        <div>
          <strong>Fallback Mock Mode Active:</strong> Add your free API key into{' '}
          <code>server/.env</code> (<code>OPENWEATHER_API_KEY=your_key</code>) to connect to live OpenWeatherMap satellite feeds.
        </div>
      </div>
    </div>
  );
}

export function ErrorAlert({ error, onRetry }) {
  if (!error) return null;

  return (
    <div className="alert-banner alert-error">
      <div className="alert-content">
        <AlertCircle size={18} style={{ flexShrink: 0 }} />
        <span>{error}</span>
      </div>
      {onRetry && (
        <button type="button" className="alert-action-btn" onClick={onRetry}>
          <RefreshCw size={13} style={{ display: 'inline', marginRight: '4px' }} />
          Retry
        </button>
      )}
    </div>
  );
}
