import { useState, useEffect, useCallback } from 'react';
import { fetchCurrentWeather, fetchForecast, fetchAppStatus, clearBackendCache } from '../services/api';

export function useWeather(initialCity = 'London') {
  const [city, setCity] = useState(initialCity);
  const [coordinates, setCoordinates] = useState(null);
  const [units, setUnits] = useState('metric'); // 'metric' (°C) or 'imperial' (°F)

  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [cacheHit, setCacheHit] = useState(false);
  const [appStatus, setAppStatus] = useState(null);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('weather_recent_searches');
      return saved ? JSON.parse(saved) : ['London', 'Tokyo', 'New York', 'Paris', 'Sydney'];
    } catch {
      return ['London', 'Tokyo', 'New York', 'Paris', 'Sydney'];
    }
  });

  // Check backend status on mount
  useEffect(() => {
    fetchAppStatus()
      .then(setAppStatus)
      .catch((err) => console.warn('Could not fetch app status:', err.message));
  }, []);

  const saveRecentSearch = (name) => {
    if (!name) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== name.toLowerCase());
      const updated = [name, ...filtered].slice(0, 6);
      try {
        localStorage.setItem('weather_recent_searches', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
  };

  const loadWeather = useCallback(async (searchParams) => {
    setLoading(true);
    setError(null);

    try {
      const [currentRes, forecastRes] = await Promise.all([
        fetchCurrentWeather({ ...searchParams, units }),
        fetchForecast({ ...searchParams, units })
      ]);

      setCurrentWeather(currentRes.data);
      setForecast(forecastRes.data);
      setCacheHit(Boolean(currentRes.fromCache || currentRes.cacheHeader === 'HIT'));

      if (currentRes.data?.city) {
        saveRecentSearch(currentRes.data.city);
      }
    } catch (err) {
      console.error('Weather load error:', err);
      setError(err.message || 'Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [units]);

  // Trigger fetch when city, coordinates, or units change
  useEffect(() => {
    if (coordinates) {
      loadWeather({ lat: coordinates.lat, lon: coordinates.lon });
    } else if (city) {
      loadWeather({ city });
    }
  }, [city, coordinates, units, loadWeather]);

  const searchByCity = (newCity) => {
    if (!newCity || !newCity.trim()) return;
    setCoordinates(null);
    setCity(newCity.trim());
  };

  const searchByCoords = (lat, lon, cityName = null) => {
    if (cityName) setCity(cityName);
    setCoordinates({ lat, lon });
  };

  const searchCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCity('');
        setCoordinates({ lat: latitude, lon: longitude });
      },
      (geoErr) => {
        setLoading(false);
        let msg = 'Could not retrieve your location.';
        if (geoErr.code === 1) msg = 'Location permission denied by user.';
        else if (geoErr.code === 2) msg = 'Location unavailable.';
        setError(msg);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const refresh = () => {
    if (coordinates) {
      loadWeather({ lat: coordinates.lat, lon: coordinates.lon });
    } else {
      loadWeather({ city });
    }
  };

  const purgeCacheAndRefresh = async () => {
    try {
      await clearBackendCache();
      refresh();
    } catch (e) {
      refresh();
    }
  };

  return {
    city,
    coordinates,
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
  };
}
