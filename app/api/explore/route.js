import { rateLimiter } from '@/lib/rateLimiter';

// Simple in-memory cache to reduce API calls
let cachedData = null;
let cacheTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

async function fetchWithRetry(url, options = {}, maxRetries = 2) {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const res = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(8000),
      });
      return res;
    } catch (err) {
      if (i === maxRetries) throw err;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

async function fetchAllFlights() {
  // Check cache first
  if (cachedData && Date.now() - cacheTime < CACHE_DURATION) {
    return cachedData;
  }

  // Try OpenSky first
  try {
    console.log('Fetching from OpenSky Network...');
    const res = await fetchWithRetry(
      'https://opensky-network.org/api/states/all',
      {
        headers: { 
          'User-Agent': 'AeroTrack/1.0 (open-source flight tracker)',
          'Accept-Encoding': 'gzip',
        },
        cache: 'no-store',
      },
      1
    );
    
    if (res.ok) {
      const data = await res.json();
      if (data.states && data.states.length > 0) {
        cachedData = data;
        cacheTime = Date.now();
        return data;
      }
    } else if (res.status === 429) {
      console.warn('OpenSky rate limited, trying fallback...');
    } else {
      console.warn(`OpenSky returned ${res.status}`);
    }
  } catch (err) {
    console.warn('OpenSky failed:', err.message);
  }

  // Fallback 1: ADSB.lol - large geographic range
  try {
    console.log('Fetching from ADSB.lol (large range)...');
    const fbRes = await fetchWithRetry(
      'https://api.adsb.lol/v2/lat/0/lon/0/range/180',
      { cache: 'no-store' },
      1
    );
    
    if (fbRes.ok) {
      const data = await fbRes.json();
      if (data.ac && Object.keys(data.ac).length > 0) {
        const states = Object.values(data.ac).map(ac => [
          ac.icao,
          ac.call?.trim() || null,
          ac.country || 'Unknown',
          ac.ts || Math.floor(Date.now() / 1000),
          ac.ts || Math.floor(Date.now() / 1000),
          ac.lon ?? 0,
          ac.lat ?? 0,
          ac.alt ?? null,
          ac.gnd ?? false,
          ac.spd ?? 0,
          ac.track ?? 0,
          ac.vert_rate ?? 0,
          null,
          ac.alt ?? null,
          ac.squawk || null,
          false,
          null,
          ac.ts || null,
        ]);
        
        const result = { states, time: Math.floor(Date.now() / 1000) };
        cachedData = result;
        cacheTime = Date.now();
        return result;
      }
    } else {
      console.warn(`ADSB.lol returned ${fbRes.status}`);
    }
  } catch (err) {
    console.warn('ADSB.lol (large) failed:', err.message);
  }

  // Fallback 2: try smaller ADSB.lol regions
  try {
    console.log('Fetching from ADSB.lol (multi-region)...');
    const regions = [
      { lat: 45, lon: -100, range: 90 }, // North America
      { lat: 48, lon: 10, range: 90 },   // Europe
      { lat: 35, lon: 135, range: 80 },  // Asia
      { lat: -25, lon: 135, range: 80 }, // Australia
    ];

    const allAircraft = {};
    for (const region of regions) {
      try {
        const res = await fetch(
          `https://api.adsb.lol/v2/lat/${region.lat}/lon/${region.lon}/range/${region.range}`,
          { 
            signal: AbortSignal.timeout(5000),
            cache: 'no-store',
          }
        );
        if (res.ok) {
          const data = await res.json();
          Object.assign(allAircraft, data.ac || {});
        }
      } catch (e) {
        console.warn(`Region fetch failed:`, e.message);
      }
    }

    if (Object.keys(allAircraft).length > 0) {
      const states = Object.values(allAircraft).map(ac => [
        ac.icao,
        ac.call?.trim() || null,
        ac.country || 'Unknown',
        ac.ts || Math.floor(Date.now() / 1000),
        ac.ts || Math.floor(Date.now() / 1000),
        ac.lon ?? 0,
        ac.lat ?? 0,
        ac.alt ?? null,
        ac.gnd ?? false,
        ac.spd ?? 0,
        ac.track ?? 0,
        ac.vert_rate ?? 0,
        null,
        ac.alt ?? null,
        ac.squawk || null,
        false,
        null,
        ac.ts || null,
      ]);

      const result = { states, time: Math.floor(Date.now() / 1000) };
      cachedData = result;
      cacheTime = Date.now();
      return result;
    }
  } catch (err) {
    console.warn('ADSB.lol (regional) failed:', err.message);
  }

  // If we have any cached data, return it even if stale
  if (cachedData) {
    console.warn('Returning stale cache');
    return cachedData;
  }

  throw new Error('All flight data sources exhausted');
}

export async function GET(req) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (!rateLimiter.check(ip)) {
    return Response.json({ error: 'Rate limited', states: [] }, { status: 429 });
  }

  try {
    const data = await fetchAllFlights();
    return Response.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=30, s-maxage=60',
      },
    });
  } catch (err) {
    console.error('Explore API error:', err.message);
    
    // Return cached data if available, even if error
    if (cachedData) {
      console.log('Returning cached data due to error');
      return Response.json(cachedData, {
        headers: {
          'Cache-Control': 'public, max-age=5',
          'X-From-Cache': 'true',
        },
        status: 200,
      });
    }

    // Return empty but valid response instead of 503
    // This prevents client-side errors while APIs recover
    console.warn('Returning empty data - all APIs unavailable');
    return Response.json({ 
      states: [],
      time: Math.floor(Date.now() / 1000),
      error: 'Flight data sources temporarily overloaded - try again in 1-2 minutes',
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=10',
        'X-Status': 'degraded',
      },
    });
  }
}