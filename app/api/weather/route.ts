import { NextResponse } from 'next/server';

async function getWeather(lat: number, lon: number) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=imperial`
  );
  
  if (!response.ok) {
    throw new Error('Weather service unavailable');
  }
  
  const data = await response.json();
  return data;
}

async function getCityName(lat: number, lon: number) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${process.env.OPENWEATHER_API_KEY}`
    );
    
    if (!response.ok) {
      return 'Unknown Location';
    }

    const data = await response.json();
    return data[0]?.name || 'Unknown Location';
  } catch (error) {
    return 'Unknown Location';
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!lat || !lon) {
      throw new Error('Latitude and longitude are required');
    }

    // Get weather data
    const weather = await getWeather(Number(lat), Number(lon));
    const cityName = await getCityName(Number(lat), Number(lon));

    return NextResponse.json({
      temperature: Math.round(weather.main.temp),
      location: cityName,
      description: weather.weather[0].description,
      icon: weather.weather[0].icon,
    });
  } catch (error: any) {
    console.error('Weather error:', error);
    return NextResponse.json(
      { error: error.message || 'Could not fetch weather data' },
      { status: 500 }
    );
  }
} 