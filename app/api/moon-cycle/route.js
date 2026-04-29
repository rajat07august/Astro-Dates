import { NextResponse } from 'next/server';
import { computeMoonCycle } from '../../../lib/moonCycle';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get('year'), 10);

  if (!year || year < 1900 || year > 2100) {
    return NextResponse.json(
      { error: 'Invalid year. Please provide a year between 1900 and 2100.' },
      { status: 400 }
    );
  }

  try {
    const events = computeMoonCycle(year);
    return NextResponse.json({ year, count: events.length, events });
  } catch (err) {
    console.error('[moon-cycle] calculation error:', err);
    return NextResponse.json({ error: 'Calculation failed.' }, { status: 500 });
  }
}
