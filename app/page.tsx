'use client';

import { useState, FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import { SearchState } from '@/app/types/search';

export default function Home() {
  const [state, setState] = useState<SearchState>({
    isLoading: false,
    query: '',
    results: [],
    aiResponse: null,
    error: null,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!state.query.trim()) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: state.query }),
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
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false,
      }));
    }
  };

  return (
    <main className="min-h-screen bg-gray-900">
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
            <button
              type="submit"
              disabled={state.isLoading}
              className="px-6 py-4 bg-blue-600 text-gray-100 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {state.isLoading ? 'Searching...' : 'Search'}
            </button>
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
    </main>
  );
}
