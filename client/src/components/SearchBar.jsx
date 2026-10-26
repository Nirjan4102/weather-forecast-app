import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { searchCities } from '../services/api';

export default function SearchBar({
  onSearch,
  onLocationSearch,
  onSelectCoords,
  activeCity,
  recentCities = [],
  loading
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef(null);
  const containerRef = useRef(null);

  // Debounced auto-complete suggestions
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setIsSearchingSuggestions(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearchingSuggestions(true);
      try {
        const results = await searchCities(query.trim());
        setSuggestions(results);
        setShowDropdown(results.length > 0);
      } catch (e) {
        setSuggestions([]);
      } finally {
        setIsSearchingSuggestions(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShowDropdown(false);
      onSearch(query.trim());
    }
  };

  const handleSuggestionClick = (item) => {
    setShowDropdown(false);
    setQuery(item.name);
    if (item.lat && item.lon) {
      onSelectCoords(item.lat, item.lon, `${item.name}, ${item.country}`);
    } else {
      onSearch(item.name);
    }
  };

  return (
    <div className="search-section" ref={containerRef}>
      <form onSubmit={handleSubmit} className="search-bar-container">
        <div className="search-input-wrapper">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by city name or country (e.g., Tokyo, London, Paris)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => {
              if (suggestions.length > 0) setShowDropdown(true);
            }}
          />

          <div className="search-actions">
            {isSearchingSuggestions && <Loader2 size={18} className="spinner search-icon" />}

            <button
              type="button"
              className="btn-icon"
              onClick={onLocationSearch}
              disabled={loading}
              title="Use current GPS location"
            >
              <MapPin size={18} />
            </button>

            <button type="submit" className="btn-primary" disabled={loading || !query.trim()}>
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Suggestion Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div className="suggestions-dropdown">
            {suggestions.map((item, index) => (
              <div
                key={`${item.name}-${item.lat}-${index}`}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(item)}
              >
                <div className="suggestion-name">{item.name}</div>
                <div className="suggestion-meta">
                  {item.state ? `${item.state}, ` : ''}{item.country}
                </div>
              </div>
            ))}
          </div>
        )}
      </form>

      {/* Quick City Pills */}
      {recentCities && recentCities.length > 0 && (
        <div className="quick-cities">
          <span className="quick-city-label">Popular & Recent:</span>
          {recentCities.map((cityName) => (
            <button
              key={cityName}
              type="button"
              className={`city-pill ${activeCity?.toLowerCase() === cityName.toLowerCase() ? 'active' : ''}`}
              onClick={() => onSearch(cityName)}
            >
              {cityName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
