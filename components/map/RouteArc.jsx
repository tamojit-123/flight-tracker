'use client';
import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';

export function RouteArc({ map, start, end, color = '#00D4FF', opacity = 0.6 }) {
  const sourceRef = useRef(null);

  useEffect(() => {
    if (!map || !start || !end) return;

    const arcCoordinates = createArcCoordinates(start, end, 50);

    const geojson = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: arcCoordinates,
      },
      properties: { color, opacity },
    };

    if (map.getSource('route-arc')) {
      map.getSource('route-arc').setData(geojson);
    } else {
      map.addSource('route-arc', {
        type: 'geojson',
        data: geojson,
      });

      map.addLayer({
        id: 'route-arc-line',
        type: 'line',
        source: 'route-arc',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 2,
          'line-opacity': ['get', 'opacity'],
          'line-dasharray': [2, 2],
        },
      });
    }

    return () => {
      if (map && !map.isRemoved()) {
        if (map.getLayer('route-arc-line')) map.removeLayer('route-arc-line');
        if (map.getSource('route-arc')) map.removeSource('route-arc');
      }
    };
  }, [map, start, end, color, opacity]);

  return null;
}

function createArcCoordinates(start, end, numPoints) {
  const coordinates = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lat = start[1] + (end[1] - start[1]) * t;
    const lng = start[0] + (end[0] - start[0]) * t;
    const midLat = (start[1] + end[1]) / 2;
    const arcHeight = Math.sin(t * Math.PI) * 5;
    const adjustedLat = lat + arcHeight * (1 - Math.abs(t - 0.5) * 2);
    coordinates.push([lng, adjustedLat]);
  }
  return coordinates;
}