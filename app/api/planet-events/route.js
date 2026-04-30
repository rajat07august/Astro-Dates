import { NextResponse } from 'next/server';
import { computePlanetEvents } from '../../../lib/planetEvents';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get('year'), 10);
  const moon = searchParams.get('moon') === '1';

  if (!year || year < 1900 || year > 2100) {
    return NextResponse.json(
      { error: 'Invalid year. Please provide a year between 1900 and 2100.' },
      { status: 400 },
    );
  }

  try {
    const events = computePlanetEvents(year, moon);
    return NextResponse.json({ year, count: events.length, events });
  } catch (err) {
    console.error('[planet-events] calculation error:', err);
    return NextResponse.json({ error: 'Calculation failed.' }, { status: 500 });
  }
}
