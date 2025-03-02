import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { SearchResult, AIResponse } from '@/app/types/search';
import { getSearchResults } from '@/app/lib/search';

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is not set');
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Get search results
    const searchResults = await getSearchResults(query);

    // Generate AI response
    const prompt = `
      Based on the following search results, please provide a comprehensive answer to the query: "${query}"
      
      Search Results:
      ${searchResults.map(result => `
        Title: ${result.title}
        URL: ${result.link}
        Snippet: ${result.snippet}
        ---
      `).join('\n')}
      
      Please provide a well-structured answer that:
      1. Synthesizes information from multiple sources
      2. Cites specific sources using [1], [2], etc.
      3. Maintains accuracy and relevance to the query
      4. Provides a balanced perspective when applicable
    `;

    const message = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 2000,
      temperature: 0.7,
      system: 'You are a helpful AI assistant that provides accurate, well-cited answers based on search results. Use clear citations and maintain a neutral, informative tone.',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Get the text content from the message
    let answer = '';
    for (const content of message.content) {
      if (content.type === 'text') {
        answer += content.text;
      }
    }

    // Extract citations from the answer
    const citations = searchResults.map((result, index) => ({
      title: result.title,
      link: result.link,
      snippet: result.snippet,
    }));

    const response: AIResponse = {
      answer,
      citations,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
} 