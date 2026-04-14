'use client';
import { useEffect, useRef } from 'react';

export function FlightPathLayer({ map, positionHistory = [] }) {
  const sourceRef = useRef(null);
  const layerAddedRef = useRef(false);

  useEffect(() => {
    if (!map || !positionHistory || positionHistory.length < 2 || !map.loaded) return;

    const coordinates = positionHistory.map(p => [p.longitude, p.latitude]);

    const geojson = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: coordinates,
      },
      properties: {},
    };

    try {
      if (map.getSource('flight-path')) {
        map.getSource('flight-path').setData(geojson);
      } else if (!layerAddedRef.current) {
        map.addSource('flight-path', {
          type: 'geojson',
          data: geojson,
        });

        // Add gradient line layer
        map.addLayer({
          id: 'flight-path-line',
          type: 'line',
          source: 'flight-path',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': [
              'interpolate',
              ['linear'],
              ['line-progress'],
              0, '#FF3A5C',
              0.5, '#FFB800',
              1, '#00D4FF',
            ],
            'line-width': [
              'interpolate',
              ['linear'],
              ['zoom'],
              2, 1,
              6, 2,
              10, 3,
            ],
            'line-opacity': 0.7,
            'line-blur': 0.5,
          },
        });

        // Add waypoint markers
        map.addLayer({
          id: 'flight-waypoints',
          type: 'circle',
          source: 'flight-path',
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              2, 1,
              6, 2,
              10, 3,
            ],
            'circle-color': '#00D4FF',
            'circle-opacity': [
              'interpolate',
              ['linear'],
              ['line-progress'],
              0, 0.3,
              0.5, 0.5,
              1, 0.8,
            ],
            'circle-stroke-width': 1,
            'circle-stroke-color': 'rgba(255,255,255,0.5)',
          },
          filter: ['!=', ['geometry-type'], 'LineString'],
        });

        layerAddedRef.current = true;
      }
    } catch (err) {
      console.warn('FlightPathLayer error:', err);
    }
  }, [map, positionHistory]);

  return null;
}
