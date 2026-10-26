import React from 'react';
import { Shield, Zap, Server, RefreshCw, Cpu, Layers } from 'lucide-react';

export default function TechSpecs({ appStatus, cacheHit }) {
  return (
    <div className="glass-card tech-specs-card">
      <div className="section-title">
        <Layers size={18} style={{ color: 'var(--accent-cyan)' }} />
        <span>System Architecture & Engineering Highlights</span>
      </div>

      <div className="specs-grid">
        <div className="spec-item">
          <div className="spec-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={14} /> Backend Proxy Security
          </div>
          <div className="spec-desc">
            API secrets are strictly contained in Express <code>.env</code>. The client never exposes credentials to browser devtools or third parties.
          </div>
        </div>

        <div className="spec-item">
          <div className="spec-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={14} /> In-Memory Cache (TTL)
          </div>
          <div className="spec-desc">
            Responses cached for {appStatus?.cache?.defaultTtl || 600}s using <code>node-cache</code> with automatic eviction. Inspect <code>X-Cache: {cacheHit ? 'HIT' : 'MISS'}</code> headers.
          </div>
        </div>

        <div className="spec-item">
          <div className="spec-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={14} /> Async/Await & Fallbacks
          </div>
          <div className="spec-desc">
            Non-blocking upstream queries with timeout limits. Graceful degradation to realistic fallback datasets if upstream limits are reached.
          </div>
        </div>

        <div className="spec-item">
          <div className="spec-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Cpu size={14} /> Rate Limiting & Health Check
          </div>
          <div className="spec-desc">
            Express middleware throttles abuse at 120 req/15min with integrated health telemetry at <code>/api/weather/health</code>.
          </div>
        </div>
      </div>
    </div>
  );
}
