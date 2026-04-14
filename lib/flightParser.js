export function parseStateVector(arr) {
  if (!arr || arr.length < 17) return null;
  return {
    icao24:         arr[0],
    callsign:       arr[1]?.trim() || null,
    origin_country: arr[2],
    time_position:  arr[3],
    last_contact:   arr[4],
    longitude:      arr[5],
    latitude:       arr[6],
    baro_altitude:  arr[7],
    on_ground:      arr[8],
    velocity:       arr[9],
    true_track:     arr[10],
    vertical_rate:  arr[11],
    sensors:        arr[12],
    geo_altitude:   arr[13],
    squawk:         arr[14],
    spi:            arr[15],
    position_source:arr[16],
  };
}

export function parseOpenSkyResponse(data) {
  if (!data?.states) return [];
  return data.states
    .map(parseStateVector)
    .filter(f => f && f.latitude && f.longitude);
}

export function flightsToGeoJSON(flights) {
  return {
    type: 'FeatureCollection',
    features: flights.map(f => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [f.longitude, f.latitude] },
      properties: {
        icao24:      f.icao24,
        callsign:    f.callsign ?? '------',
        altitude:    f.baro_altitude ?? 0,
        velocity:    f.velocity ?? 0,
        heading:     f.true_track ?? 0,
        on_ground:   f.on_ground,
        country:     f.origin_country,
        squawk:      f.squawk,
        vert_rate:   f.vertical_rate ?? 0,
        last_contact:f.last_contact,
        alt_color:   f.on_ground ? 'red' : f.baro_altitude > 10000 ? 'cyan' : f.baro_altitude > 5000 ? 'white' : 'amber',
      }
    }))
  };
}

export function formatAltitude(alt) {
  if (alt == null || alt < 0) return '---';
  if (alt >= 1000) {
    return `${(alt / 1000).toFixed(1)}k`;
  }
  return `${alt.toFixed(0)}`;
}

export function formatSpeed(speed) {
  if (speed == null) return '---';
  const kts = speed * 1.94384;
  if (kts >= 100) return `${kts.toFixed(0)} kts`;
  return `${kts.toFixed(0)} kts`;
}

export function formatHeading(heading) {
  if (heading == null || isNaN(heading)) return '---';
  const h = ((heading % 360) + 360) % 360;
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  const d = dirs[Math.round(h / 45) % 8];
  return `${h.toFixed(0).padStart(3, '0')}° ${d}`;
}

export function getCountryFlag(country) {
  const flags = {
    'United States': '🇺🇸',
    'Germany': '🇩🇪',
    'United Kingdom': '🇬🇧',
    'France': '🇫🇷',
    'China': '🇨🇳',
    'Russia': '🇷🇺',
    'Japan': '🇯🇵',
    'Canada': '🇨🇦',
    'Australia': '🇦🇺',
    'Brazil': '🇧🇷',
    'India': '🇮🇳',
    'Spain': '🇪🇸',
    'Netherlands': '🇳🇱',
    'Italy': '🇮🇹',
    'Turkey': '🇹🇷',
    'Mexico': '🇲🇽',
    'South Korea': '🇰🇷',
    'Singapore': '🇸🇬',
    'UAE': '🇦🇪',
    'Saudi Arabia': '🇸🇦',
  };
  return flags[country] || '🌐';
}

export function timeAgo(timestamp) {
  if (!timestamp) return '---';
  const now = Date.now() / 1000;
  const diff = Math.floor(now - timestamp);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}