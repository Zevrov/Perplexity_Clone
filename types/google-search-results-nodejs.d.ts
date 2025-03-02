declare module 'google-search-results-nodejs' {
  export class GoogleSearch {
    constructor(apiKey: string);
    json(
      params: { [key: string]: string },
      callback: (data: any) => void
    ): void;
  }
} 