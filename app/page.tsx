'use client';

import { useState, FormEvent, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { SearchState } from '@/app/types/search';

interface HistoryItem {
  query: string;
  timestamp: number;
}

interface WeatherData {
  temperature: number;
  location: string;
  description: string;
  icon: string;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

const RANDOM_SEARCHES = [
  "What would happen if the moon disappeared?",
  "Why do cats purr?",
  "How do black holes work?",
  "Can plants communicate with each other?",
  "Why do we dream?",
  "How do northern lights form?",
  "What makes a rainbow appear?",
  "Why is the sky blue?",
  "How do birds navigate during migration?",
  "Why do we get déjà vu?",
  "How do trees communicate?",
  "What causes the butterfly effect?",
  "How do memories form in the brain?",
  "Why do we have fingerprints?",
  "How do fireflies glow?",
];

export default function Home() {
  const [state, setState] = useState<SearchState>({
    isLoading: false,
    query: '',
    results: [],
    aiResponse: null,
    error: null,
  });
  const [searchHistory, setSearchHistory] = useState<HistoryItem[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          setWeatherError('Could not get location. Using default location.');
          // Use New York as default location
          setCoordinates({
            latitude: 40.7128,
            longitude: -74.0060,
          });
        }
      );
    } else {
      setWeatherError('Geolocation is not supported by your browser');
    }
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!coordinates) return;

      try {
        const response = await fetch(
          `/api/weather?lat=${coordinates.latitude}&lon=${coordinates.longitude}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Could not fetch weather data');
        }

        setWeather(data);
        setWeatherError(null);
      } catch (error: any) {
        console.error('Weather error:', error);
        setWeatherError(error.message);
      }
    };

    if (coordinates) {
      fetchWeather();
      // Refresh weather data every 5 minutes
      const interval = setInterval(fetchWeather, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [coordinates]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setState(prev => ({ ...prev, isLoading: true, error: null, query }));

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An error occurred');
      }

      setState(prev => ({
        ...prev,
        aiResponse: data,
        results: data.citations,
        isLoading: false,
      }));

      // Add to search history
      setSearchHistory(prev => {
        const newHistory = [
          { query, timestamp: Date.now() },
          ...prev.filter(item => item.query !== query), // Remove duplicates
        ].slice(0, 20); // Keep only last 20 searches
        return newHistory;
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false,
      }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSearch(state.query);
  };

  const handleLuckySearch = () => {
    const randomIndex = Math.floor(Math.random() * RANDOM_SEARCHES.length);
    const randomQuery = RANDOM_SEARCHES[randomIndex];
    handleSearch(randomQuery);
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <main className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Search History</h2>
          {searchHistory.length === 0 ? (
            <p className="text-gray-400 text-sm">No search history yet</p>
          ) : (
            <div className="space-y-2">
              {searchHistory.map((item, index) => (
                <button
                  key={item.timestamp}
                  onClick={() => handleSearch(item.query)}
                  className="w-full text-left p-2 rounded hover:bg-gray-700 transition-colors group"
                >
                  <p className="text-gray-200 text-sm font-medium truncate">{item.query}</p>
                  <p className="text-gray-500 text-xs">{formatTimestamp(item.timestamp)}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center mb-8 text-gray-100">AI Search Assistant</h1>
            
            {/* Search Form */}
            <form onSubmit={handleSubmit} className="mb-8">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={state.query}
                  onChange={(e) => setState(prev => ({ ...prev, query: e.target.value }))}
                  placeholder="Ask me anything..."
                  className="flex-1 p-4 rounded-lg border border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={state.isLoading}
                    className="px-6 py-4 bg-blue-600 text-gray-100 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {state.isLoading ? 'Searching...' : 'Search'}
                  </button>
                  <button
                    type="button"
                    onClick={handleLuckySearch}
                    disabled={state.isLoading}
                    className="px-6 py-4 bg-purple-600 text-gray-100 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span>I'm Feeling Lucky</span>
                    <span className="text-lg">🎲</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Error Message */}
            {state.error && (
              <div className="p-4 mb-6 bg-red-900/50 text-red-200 rounded-lg border border-red-700">
                {state.error}
              </div>
            )}

            {/* AI Response */}
            {state.aiResponse && (
              <div className="mb-8 p-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                <h2 className="text-2xl font-semibold mb-4 text-gray-100">Answer</h2>
                <div className="prose prose-invert max-w-none text-gray-300">
                  <ReactMarkdown>{state.aiResponse.answer}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Search Results */}
            {state.results.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-100">Sources</h2>
                <div className="space-y-4">
                  {state.results.map((result, index) => (
                    <div key={index} className="p-4 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                      <h3 className="text-lg font-medium mb-2">
                        <a
                          href={result.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          {result.title}
                        </a>
                      </h3>
                      <p className="text-gray-300">{result.snippet}</p>
                      <span className="text-sm text-gray-500">Source [{index + 1}]</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Weather Nav Bar */}
      <nav className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center">
          {weatherError ? (
            <p className="text-red-400 text-sm">{weatherError}</p>
          ) : weather ? (
            <div className="flex items-center space-x-4">
              <img
                src={`http://openweathermap.org/img/wn/${weather.icon}.png`}
                alt={weather.description}
                className="w-8 h-8"
              />
              <div className="flex items-center">
                <span className="text-gray-100">{weather.temperature}°F</span>
                <span className="mx-2 text-gray-500">|</span>
                <span className="text-gray-300">{weather.location}</span>
                <span className="mx-2 text-gray-500">|</span>
                <span className="text-gray-400 capitalize">{weather.description}</span>
              </div>
            </div>
          ) : (
            <div className="animate-pulse flex space-x-4 items-center">
              <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
              <div className="h-4 w-48 bg-gray-700 rounded"></div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
