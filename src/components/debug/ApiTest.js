import React, { useState } from 'react';
import { externalApiService } from '../../services/externalApiService';
import { movieService } from '../../services/movieService';

const ApiTest = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testTMDBTrending = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing TMDB Trending API...');
      const result = await externalApiService.getTMDBTrendingMovies('week', 1);
      console.log('📊 TMDB Trending Result:', result);
      setResults(prev => ({ ...prev, tmdbTrending: result }));
    } catch (error) {
      console.error('❌ TMDB Trending Error:', error);
      setResults(prev => ({ ...prev, tmdbTrending: { error: error.message } }));
    } finally {
      setLoading(false);
    }
  };

  const testTMDBSearch = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing TMDB Search API...');
      const result = await externalApiService.searchTMDBMovies('avengers', 1);
      console.log('🔍 TMDB Search Result:', result);
      setResults(prev => ({ ...prev, tmdbSearch: result }));
    } catch (error) {
      console.error('❌ TMDB Search Error:', error);
      setResults(prev => ({ ...prev, tmdbSearch: { error: error.message } }));
    } finally {
      setLoading(false);
    }
  };

  const testMovieServiceTrending = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing Movie Service Trending...');
      const result = await movieService.getTrendingMovies();
      console.log('📈 Movie Service Result:', result);
      setResults(prev => ({ ...prev, movieServiceTrending: result }));
    } catch (error) {
      console.error('❌ Movie Service Error:', error);
      setResults(prev => ({ ...prev, movieServiceTrending: { error: error.message } }));
    } finally {
      setLoading(false);
    }
  };

  const testAPIStatus = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing API Status...');
      const result = await externalApiService.getAPIStatus();
      console.log('🔧 API Status Result:', result);
      setResults(prev => ({ ...prev, apiStatus: result }));
    } catch (error) {
      console.error('❌ API Status Error:', error);
      setResults(prev => ({ ...prev, apiStatus: { error: error.message } }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">🧪 API Debug Panel</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <button
          onClick={testAPIStatus}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test API Status
        </button>
        <button
          onClick={testTMDBTrending}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test TMDB Trending
        </button>
        <button
          onClick={testTMDBSearch}
          disabled={loading}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test TMDB Search
        </button>
        <button
          onClick={testMovieServiceTrending}
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test Movie Service
        </button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Testing API...</p>
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(results).map(([key, result]) => (
          <div key={key} className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1')}</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-64">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiTest;
