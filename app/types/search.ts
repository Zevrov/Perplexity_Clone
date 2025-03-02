export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
}

export interface Citation {
  title: string;
  link: string;
  snippet: string;
}

export interface AIResponse {
  answer: string;
  citations: Citation[];
  error?: string;
}

export interface SearchState {
  isLoading: boolean;
  query: string;
  results: SearchResult[];
  aiResponse: AIResponse | null;
  error: string | null;
} 