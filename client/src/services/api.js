const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/weather';

/**
 * Helper to fetch and inspect response headers (like X-Cache)
 */
async function apiRequest(endpoint, params = {}) {
  const url = new URL(`${window.location.origin}${API_BASE}${endpoint}`);
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      url.searchParams.append(key, params[key]);
    }
  });

  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json'
    }
  });

  const cacheHeader = response.headers.get('X-Cache');
  const json = await response.json();

  if (!response.ok || !json.success) {
    const errorMsg = json.error || `HTTP error! status: ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    throw err;
  }

  return {
    ...json,
    cacheHeader: cacheHeader || (json.fromCache ? 'HIT' : 'MISS')
  };
}

export const fetchCurrentWeather = async ({ city, lat, lon, units = 'metric' }) => {
  return apiRequest('/current', { city, lat, lon, units });
};

export const fetchForecast = async ({ city, lat, lon, units = 'metric' }) => {
  return apiRequest('/forecast', { city, lat, lon, units });
};

export const searchCities = async (query) => {
  if (!query || query.trim().length === 0) return [];
  const res = await apiRequest('/search', { q: query });
  return res.data || [];
};

export const fetchAppStatus = async () => {
  const res = await apiRequest('/health');
  return res;
};

export const clearBackendCache = async () => {
  const url = `${window.location.origin}${API_BASE}/cache/clear`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
};
