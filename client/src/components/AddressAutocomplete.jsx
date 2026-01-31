import React, { useState, useRef } from "react";

const AddressAutocomplete = ({ value, onChange, onSelectLocation }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef(null);

  const searchAddress = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      // Direct Nominatim API call - NO package needed!
      // viewbox=left,top,right,bottom (HCMC box approx) & bounded=0 (prefer but don't force)
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=vn&viewbox=106.3,11.1,107.0,10.3&bounded=1&addressdetails=1&limit=5`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "BronAuto Food Delivery App", // Required by Nominatim
        },
      });

      if (!response.ok) throw new Error("Search failed");

      const results = await response.json();
      setSuggestions(results);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Geocoding error:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    onChange(query);

    // Debounce to avoid too many API calls (Nominatim rate limit: 1 req/sec)
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      searchAddress(query);
    }, 500); // Wait 500ms after user stops typing
  };

  const handleSelect = (result) => {
    const address = result.display_name;
    const coordinates = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    };

    onChange(address);
    onSelectLocation(coordinates);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        placeholder="Nhập địa chỉ (VD: Vinhome Grand Park, Thủ Đức)"
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
      />

      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((result, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(result)}
              className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition"
            >
              <div className="flex items-start gap-2">
                <span className="text-xl">📍</span>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    {result.display_name}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showSuggestions &&
        suggestions.length === 0 &&
        !loading &&
        value.length >= 3 && (
          <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 text-center text-gray-500">
            Không tìm thấy địa chỉ. Thử nhập chi tiết hơn.
          </div>
        )}
    </div>
  );
};

export default AddressAutocomplete;
