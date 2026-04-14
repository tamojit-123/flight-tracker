import { rateLimiter } from '@/lib/rateLimiter';

async function fetchAllFlights() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch('https://opensky-network.org/api/states/all', {
      signal: controller.signal,
      headers: { 'User-Agent': 'AeroTrack/1.0' },
      next: { revalidate: 10 },
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error('OpenSky unavailable');
    return res.json();
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

export async function GET(req) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (!rateLimiter.check(ip)) {
    return Response.json({ error: 'Rate limited' }, { status: 429 });
  }

  try {
    const data = await fetchAllFlights();
    return Response.json(data);
  } catch (err) {
    console.error('OpenSky fetch failed:', err.message);
    return Response.json({ error: 'Service unavailable', states: [] }, { status: 503 });
  }
}