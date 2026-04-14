const OPENSKY_BASE = 'https://opensky-network.org/api';

export async function fetchAllFlights(signal) {
  const res = await fetch(`${OPENSKY_BASE}/states/all`, {
    signal,
    headers: { 'User-Agent': 'AeroTrack/1.0 (open-source flight tracker)' },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`OpenSky error: ${res.status}`);
  }
  return res.json();
}

export async function fetchFlightByIcao24(icao24, signal) {
  const url = `${OPENSKY_BASE}/states/all?icao24=${icao24.toLowerCase()}`;
  const res = await fetch(url, {
    signal,
    headers: { 'User-Agent': 'AeroTrack/1.0' },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`OpenSky error: ${res.status}`);
  }
  return res.json();
}

export async function fetchFlightsByCallsign(callsign, signal) {
  const allFlights = await fetchAllFlights(signal);
  const cs = callsign.toUpperCase().trim();
  return {
    ...allFlights,
    states: allFlights.states?.filter(s => {
      const sc = (s[1] || '').trim().toUpperCase();
      return sc.includes(cs) || sc.startsWith(cs);
    }) || [],
  };
}