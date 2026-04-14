import * as Comlink from 'comlink';

function parseStateVector(arr) {
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

function flightsToGeoJSON(flights) {
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

const workerAPI = {
  async processStates(rawStates) {
    if (!Array.isArray(rawStates)) return { type: 'FeatureCollection', features: [] };
    const parsed = rawStates.map(parseStateVector).filter(f => f && f.latitude && f.longitude);
    return flightsToGeoJSON(parsed);
  },

  async filterByCountry(flights, countries) {
    if (!countries || countries.length === 0) return flights;
    const countrySet = new Set(countries.map(c => c.toLowerCase()));
    return flights.filter(f => f.origin_country && countrySet.has(f.origin_country.toLowerCase()));
  },

  async filterByAltitude(flights, minAlt, maxAlt) {
    return flights.filter(f => {
      const alt = f.baro_altitude ?? 0;
      return alt >= minAlt && alt <= maxAlt;
    });
  },

  async filterBySpeed(flights, minSpeed, maxSpeed) {
    return flights.filter(f => {
      const spd = f.velocity ?? 0;
      return spd >= minSpeed && spd <= maxSpeed;
    });
  },

  async filterOnGround(flights, groundOnly) {
    if (!groundOnly) return flights;
    return flights.filter(f => f.on_ground === true);
  },

  async diffFeatures(oldFeatures, newFeatures) {
    if (!oldFeatures || !oldFeatures.length) return newFeatures;
    const oldMap = new Map(oldFeatures.map(f => [f.properties.icao24, f]));
    const added = [];
    const updated = [];
    for (const f of newFeatures) {
      const old = oldMap.get(f.properties.icao24);
      if (!old) {
        added.push(f);
      } else {
        const posChanged = old.geometry.coordinates[0] !== f.geometry.coordinates[0] ||
                          old.geometry.coordinates[1] !== f.geometry.coordinates[1];
        if (posChanged) updated.push(f);
      }
    }
    return { added, updated };
  },

  async getStats(flights) {
    if (!flights || !flights.length) {
      return { count: 0, countries: 0, avgAlt: 0, maxSpeed: 0 };
    }
    const countries = new Set();
    let totalAlt = 0;
    let maxSpd = 0;
    let airborne = 0;
    for (const f of flights) {
      if (f.origin_country) countries.add(f.origin_country);
      if (f.baro_altitude != null) totalAlt += f.baro_altitude;
      if (f.velocity != null && f.velocity > maxSpd) maxSpd = f.velocity;
      if (!f.on_ground) airborne++;
    }
    return {
      count: flights.length,
      countries: countries.size,
      avgAlt: Math.round(totalAlt / flights.length),
      maxSpeed: Math.round(maxSpd),
      airborne,
    };
  },
};

Comlink.expose(workerAPI);