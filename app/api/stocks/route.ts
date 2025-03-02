import { NextResponse } from 'next/server';

const STOCK_SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'NVDA'];

async function getStockQuote(symbol: string) {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Stock service unavailable');
    }

    const data = await response.json();
    const quote = data['Global Quote'];
    
    if (!quote || !quote['05. price']) {
      throw new Error('Invalid stock data');
    }

    return {
      symbol,
      price: parseFloat(quote['05. price']).toFixed(2),
      change: parseFloat(quote['09. change']).toFixed(2),
      changePercent: quote['10. change percent'].replace('%', ''),
    };
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    return null;
  }
}

export async function GET() {
  try {
    const quotes = await Promise.all(
      STOCK_SYMBOLS.map(symbol => getStockQuote(symbol))
    );

    const validQuotes = quotes.filter(quote => quote !== null);

    if (validQuotes.length === 0) {
      throw new Error('Could not fetch stock data');
    }

    return NextResponse.json(validQuotes);
  } catch (error: any) {
    console.error('Stocks error:', error);
    return NextResponse.json(
      { error: error.message || 'Could not fetch stock data' },
      { status: 500 }
    );
  }
} 