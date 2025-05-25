import React, { useState, useRef, useEffect } from 'react';
import { FaSearch, FaMicrophone, FaTimes, FaMagic } from 'react-icons/fa';
import GlassCard from './GlassCard';

const SmartSearch = ({ onSearch, placeholder = "Try: 'Movies like Inception but shorter'" }) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  const smartSuggestions = [
    "Hidden gems from the 90s",
    "Movies that make you think",
    "Feel-good movies under 2 hours",
    "Action movies like John Wick",
    "Sci-fi movies with time travel",
    "Romantic comedies from the 2000s",
    "Horror movies that aren't too scary",
    "Movies with plot twists",
    "Award-winning foreign films",
    "Movies similar to The Dark Knight"
  ];

  const quickFilters = [
    { label: "This Week", query: "new releases this week" },
    { label: "Top Rated", query: "highest rated movies" },
    { label: "Hidden Gems", query: "underrated movies" },
    { label: "Feel Good", query: "uplifting movies" }
  ];

  useEffect(() => {
    if (query.length > 2) {
      const filtered = smartSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions(smartSuggestions.slice(0, 5));
      setShowSuggestions(query.length === 0);
    }
  }, [query]);

  const handleSearch = (searchQuery = query) => {
    if (searchQuery.trim()) {
      setIsLoading(true);
      onSearch?.(searchQuery);
      setShowSuggestions(false);

      // Simulate search delay
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        handleSearch(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert('Voice search is not supported in your browser');
    }
  };

  const clearSearch = () => {
    setQuery('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Main Search Input */}
      <GlassCard className="relative overflow-visible">
        <div className="flex items-center gap-3 p-4">
          {/* Search Icon */}
          <FaSearch className={`glass-text-muted transition-colors ${isLoading ? 'animate-pulse text-primary-500' : ''}`} />

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="flex-1 bg-transparent glass-text-primary placeholder-gray-500 dark:placeholder-gray-400 outline-none text-lg"
          />

          {/* Clear Button */}
          {query && (
            <button
              onClick={clearSearch}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <FaTimes />
            </button>
          )}

          {/* Voice Search Button */}
          <button
            onClick={handleVoiceSearch}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900'
            }`}
            title="Voice search"
          >
            <FaMicrophone />
          </button>

          {/* Search Button */}
          <button
            onClick={() => handleSearch()}
            disabled={!query.trim() || isLoading}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
          >
            {isLoading ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              'Search'
            )}
          </button>
        </div>
      </GlassCard>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mt-3">
        {quickFilters.map((filter, index) => (
          <button
            key={index}
            onClick={() => {
              setQuery(filter.query);
              handleSearch(filter.query);
            }}
            className="px-3 py-1 text-sm bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowSuggestions(false)}
          />

          {/* Suggestions */}
          <GlassCard className="absolute top-full left-0 right-0 mt-2 p-2 z-50 max-h-80 overflow-y-auto">
            <div className="space-y-1">
              {/* Smart Suggestions Header */}
              <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                <FaMagic className="text-primary-500" />
                Smart Suggestions
              </div>

              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(suggestion);
                    handleSearch(suggestion);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FaSearch className="text-gray-400 text-sm" />
                    <span>{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          </GlassCard>
        </>
      )}

      {/* Voice Search Indicator */}
      {isListening && (
        <div className="absolute top-full left-0 right-0 mt-2">
          <GlassCard className="p-4 text-center">
            <div className="flex items-center justify-center gap-3 text-red-500">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="font-medium">Listening...</span>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            </div>
            <p className="text-sm glass-text-secondary mt-2">
              Speak your movie search query
            </p>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default SmartSearch;
