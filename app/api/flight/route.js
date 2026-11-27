import { z } from 'zod';
import { rateLimiter } from '@/lib/rateLimiter';
import { adsbResponseToStates } from '@/lib/flightParser';

const querySchema = z.object({
  icao24:   z.string().regex(/^[0-9a-f]{6}$/i).optional(),
  callsign: z.string().max(8).regex(/^[A-Z0-9]+$/i).optional(),
});

export async function GET(req) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (!rateLimiter.check(ip)) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const params = querySchema.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!params.success) {
    return Response.json({ error: 'Invalid parameters' }, { status: 400 });
  }

  const { icao24, callsign } = params.data;

  try {
    const url = icao24
      ? `https://opensky-network.org/api/states/all?icao24=${icao24.toLowerCase()}`
      : `https://opensky-network.org/api/states/all`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: { 'User-Agent': 'AeroTrack/1.0 (open-source flight tracker)' },
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      if (callsign && Array.isArray(data.states)) {
        const needle = callsign.toUpperCase().trim();
        data.states = data.states.filter(s =>
          (s[1] || '').trim().toUpperCase().includes(needle)
        );
      }
      return Response.json(data);
    }
  } catch (e) {}

  const fallbackUrl = icao24
    ? `https://api.adsb.lol/v2/icao/${icao24.toLowerCase()}`
    : callsign
    ? `https://api.adsb.lol/v2/callsign/${encodeURIComponent(callsign.toUpperCase().trim())}`
    : null;

  if (!fallbackUrl) return Response.json({ states: [] });

  try {
    const res = await fetch(fallbackUrl, { signal: AbortSignal.timeout(5000), cache: 'no-store' });
    if (!res.ok) {
      return Response.json({ error: 'All upstream APIs failed' }, { status: 503 });
    }
    const data = await res.json();
    return Response.json({
      states: adsbResponseToStates(data),
      time: Math.floor(Date.now() / 1000),
    });
  } catch {
    return Response.json({ error: 'All upstream APIs failed' }, { status: 503 });
  }
}