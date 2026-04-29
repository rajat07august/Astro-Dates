import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year');
  const month = searchParams.get('month');

  if (!year || !month) {
    return NextResponse.json(
      { error: 'Missing year or month parameter' },
      { status: 400 }
    );
  }

  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key is not configured on the server' },
      { status: 500 }
    );
  }

  const url = `https://api.freeastroapi.com/api/v1/moon/month?year=${year}&month=${month}&tz_str=AUTO&include_visuals=true`;

  try {
    const response = await fetch(url, {
      headers: {
        'x-api-key': apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `FreeAstroAPI error: ${response.status} ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching from FreeAstroAPI:', error);
    return NextResponse.json(
      { error: 'Failed to fetch moon data' },
      { status: 500 }
    );
  }
}
