const ADSB_BASE = 'https://api.adsb.lol/v2';

export async function fetchFlightByIcao24(icao24, signal) {
  const res = await fetch(`${ADSB_BASE}/icao/${icao24.toLowerCase()}`, {
    signal,
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`ADS-B.lol error: ${res.status}`);
  }
  return res.json();
}

export async function fetchFlightByCallsign(callsign, signal) {
  const res = await fetch(`${ADSB_BASE}/callsign/${encodeURIComponent(callsign.toUpperCase().trim())}`, {
    signal,
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`ADS-B.lol error: ${res.status}`);
  }
  return res.json();
}

export async function fetchMilitaryFlights(signal) {
  const res = await fetch(`${ADSB_BASE}/mil`, {
    signal,
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`ADS-B.lol military error: ${res.status}`);
  }
  return res.json();
}

export function parseADSBResponse(data) {
  if (!data || !data.ac) return null;
  const ac = data.ac[0];
  if (!ac) return null;
  return {
    icao24:   ac.icao || ac.icao24,
    callsign: ac.flight || null,
    latitude: ac.lat,
    longitude: ac.lon,
    altitude: ac.alt_baro ?? ac.alt_geom,
    velocity: ac.gs,
    heading:  ac.trk ?? ac.hdg,
    vertical_rate: ac.vsip ?? ac.baro_rate,
    on_ground: !!ac.gnd,
    origin_country: data.ctry || ac.r,
    squawk: ac.squawk,
    last_contact: ac.seen ?? 0,
    from_adsb: true,
  };
}