'use client';

export function PlaneIcon({ heading = 0, size = 24, color = '#00D4FF' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{
        transform: `rotate(${heading}deg)`,
        transition: 'transform 0.5s ease',
      }}
    >
      <path
        fill={color}
        d="M12 2L8 6H4l-2 4 4 2v8l2 2 2-2h4l2 2 2-2v-8l4-2-2-4h-4l-4-4z"
      />
    </svg>
  );
}

export function PlaneMarker({ flight }) {
  const { on_ground, baro_altitude, heading } = flight;
  const color = on_ground ? '#FF3A5C' : baro_altitude > 10000 ? '#00D4FF' : baro_altitude > 5000 ? '#ffffff' : '#FFB800';

  return <PlaneIcon heading={heading || 0} size={20} color={color} />;
}

export function createPlaneFeature(flight) {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [flight.longitude, flight.latitude],
    },
    properties: {
      icao24: flight.icao24,
      callsign: flight.callsign || '------',
      altitude: flight.baro_altitude || 0,
      velocity: flight.velocity || 0,
      heading: flight.true_track || flight.heading || 0,
      on_ground: flight.on_ground || false,
      country: flight.origin_country || 'Unknown',
      squawk: flight.squawk || '0000',
      vert_rate: flight.vertical_rate || 0,
      last_contact: flight.last_contact || 0,
    },
  };
}

export function createRouteArc(start, end) {
  const steps = 50;
  const arcPoints = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = start[1] + (end[1] - start[1]) * t;
    const lng = start[0] + (end[0] - start[0]) * t;
    arcPoints.push([lng, lat]);
  }

  return arcPoints;
}