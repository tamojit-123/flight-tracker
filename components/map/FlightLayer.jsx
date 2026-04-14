'use client';
import { useEffect, useRef } from 'react';

export function FlightLayer({ map, flights, onFlightClick }) {
  const sourceRef = useRef(null);
  const layerAddedRef = useRef(false);

  useEffect(() => {
    if (!map || !flights || !map.loaded) return;

    const geojson = {
      type: 'FeatureCollection',
      features: flights.map(f => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [f.longitude, f.latitude],
        },
        properties: {
          icao24: f.icao24,
          callsign: f.callsign || '------',
          altitude: f.baro_altitude || 0,
          velocity: f.velocity || 0,
          heading: f.true_track || f.heading || 0,
          on_ground: f.on_ground || false,
          country: f.origin_country || 'Unknown',
          squawk: f.squawk || '0000',
          vert_rate: f.vertical_rate || 0,
          last_contact: f.last_contact || 0,
          color: f.on_ground ? '#FF3A5C' : f.baro_altitude > 10000 ? '#00D4FF' : f.baro_altitude > 5000 ? '#ffffff' : '#FFB800',
        },
      })),
    };

    try {
      if (map.getSource('flights')) {
        map.getSource('flights').setData(geojson);
      } else if (!layerAddedRef.current) {
        map.addSource('flights', {
          type: 'geojson',
          data: geojson,
        });

        map.addLayer({
          id: 'flight-points',
          type: 'circle',
          source: 'flights',
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              2, 2,
              6, 4,
              10, 8,
            ],
            'circle-color': ['get', 'color'],
            'circle-opacity': 0.9,
            'circle-stroke-width': 1,
            'circle-stroke-color': 'rgba(255,255,255,0.3)',
          },
        });

        map.addLayer({
          id: 'flight-labels',
          type: 'symbol',
          source: 'flights',
          minzoom: 6,
          layout: {
            'text-field': ['get', 'callsign'],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 10,
            'text-rotation-alignment': 'map',
            'text-allow-overlap': false,
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': 'rgba(0,0,0,0.8)',
            'text-halo-width': 1,
          },
        });

        layerAddedRef.current = true;

        map.on('click', 'flight-points', (e) => {
          if (e.features && e.features[0]) {
            onFlightClick && onFlightClick(e.features[0].properties);
          }
        });

        map.on('mouseenter', 'flight-points', () => {
          map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'flight-points', () => {
          map.getCanvas().style.cursor = '';
        });
      }
    } catch (err) {
      console.warn('FlightLayer error:', err);
    }

    return () => {
      try {
        if (layerAddedRef.current && map && map.loaded()) {
          if (map.getLayer('flight-labels')) map.removeLayer('flight-labels');
          if (map.getLayer('flight-points')) map.removeLayer('flight-points');
          if (map.getSource('flights')) map.removeSource('flights');
          layerAddedRef.current = false;
        }
      } catch (err) {
        // Map may have been removed, ignore cleanup errors
      }
    };
  }, [map, flights, onFlightClick]);

  return null;
}