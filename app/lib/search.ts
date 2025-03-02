import { SearchResult } from '@/app/types/search';
import { GoogleSearch } from 'google-search-results-nodejs';

if (!process.env.SERPAPI_KEY) {
  throw new Error('SERPAPI_KEY environment variable is not set');
}

const search = new GoogleSearch(process.env.SERPAPI_KEY);

export const getSearchResults = (query: string): Promise<SearchResult[]> => {
  return new Promise((resolve, reject) => {
    const params = {
      q: query,
      hl: 'en',
      gl: 'us',
    };

    search.json(params, (data: any) => {
      if (data.error) {
        reject(new Error(data.error));
        return;
      }

      const results = data.organic_results?.map((result: any, index: number) => ({
        title: result.title,
        link: result.link,
        snippet: result.snippet,
        position: index + 1,
      })) || [];

      resolve(results);
    });
  });
}; 