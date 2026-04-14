const CLASSIFICATIONS = {
  '3c4a': { type: 'Commercial', category: 'widebody', name: 'Boeing 777' },
  '3c4b': { type: 'Commercial', category: 'narrowbody', name: 'Boeing 737' },
  '3c4c': { type: 'Commercial', category: 'narrowbody', name: 'Airbus A320' },
  '3c5a': { type: 'Commercial', category: 'widebody', name: 'Airbus A330' },
  '3c5b': { type: 'Commercial', category: 'widebody', name: 'Airbus A340' },
  '3c5c': { type: 'Commercial', category: 'regional', name: 'Airbus A300' },
  '3c6a': { type: 'Commercial', category: 'widebody', name: 'Boeing 787' },
  '3c6b': { type: 'Commercial', category: 'narrowbody', name: 'Boeing 787' },
  '4ca00': { type: 'Commercial', category: 'narrowbody', name: 'Boeing 737' },
  '4ca01': { type: 'Commercial', category: 'narrowbody', name: 'Boeing 737' },
  '4ca1': { type: 'Commercial', category: 'narrowbody', name: 'Boeing 737' },
  '4ca2': { type: 'Commercial', category: 'narrowbody', name: 'Boeing 737' },
  '4ca3': { type: 'Commercial', category: 'narrowbody', name: 'Boeing 737' },
  '4ca4': { type: 'Commercial', category: 'narrowbody', name: 'Boeing 737' },
  '4ca5': { type: 'Commercial', category: 'narrowbody', name: 'Boeing 737' },
  'e0': { type: 'Military', category: 'fighter', name: 'F-16' },
  'e4': { type: 'Military', category: 'transport', name: 'C-130' },
  'e8': { type: 'Military', category: 'airborne', name: 'E-3 Sentry' },
  'a0': { type: 'Cargo', category: 'heavy', name: 'Boeing 747F' },
  'a4': { type: 'Cargo', category: 'heavy', name: 'Boeing 747F' },
  'c0': { type: 'Private', category: 'light', name: 'Cessna' },
  'c2': { type: 'Private', category: 'light', name: 'Cessna' },
  'c4': { type: 'Private', category: 'light', name: 'Cessna' },
  'c8': { type: 'Private', category: 'light', name: 'Beechcraft' },
  '00': { type: 'General', category: 'light', name: 'Light Aircraft' },
  '3d': { type: 'Commercial', category: 'narrowbody', name: 'Boeing 737' },
  '7c0': { type: 'Commercial', category: 'narrowbody', name: 'Boeing 737' },
};

const MILITARY_PREFIXES = [
  'AE', 'AF', 'AK', 'AL', 'AM', 'AP', 'AR', 'AU', 'AV', 'AW',
  'AZ', 'BA', 'BC', 'BD', 'BF', 'BG', 'BH', 'BN', 'BO', 'BP',
  'BR', 'BT', 'BU', 'BV', 'BX', 'BZ', 'CA', 'CE', 'CF', 'CH',
  'CN', 'CR', 'CT', 'CV', 'CW', 'CY', 'CZ', 'DA', 'DC', 'DE',
  'DF', 'DH', 'DJ', 'DK', 'DL', 'DM', 'DN', 'DO', 'DP', 'DR',
];

export function classifyAircraft(icao24) {
  if (!icao24 || icao24.length !== 6) {
    return { type: 'Unknown', category: 'unknown', name: 'Unknown Aircraft' };
  }

  const prefix3 = icao24.substring(0, 4).toLowerCase();
  const prefix4 = icao24.substring(0, 4).toLowerCase();
  const prefix2 = icao24.substring(0, 2).toLowerCase();

  if (CLASSIFICATIONS[prefix3]) return CLASSIFICATIONS[prefix3];
  if (CLASSIFICATIONS[prefix4]) return CLASSIFICATIONS[prefix4];

  const isLikelyMilitary = MILITARY_PREFIXES.some(p => icao24.toUpperCase().startsWith(p));

  const firstByte = parseInt(icao24.substring(0, 2), 16);

  if (firstByte >= 0xA0 && firstByte <= 0xAF) {
    return { type: 'Cargo', category: 'heavy', name: 'Heavy Freighter' };
  }
  if (firstByte >= 0x80 && firstByte <= 0x9F) {
    return { type: 'Commercial', category: 'narrowbody', name: 'Narrow-body Airliner' };
  }
  if (firstByte >= 0xC0 && firstByte <= 0xCF) {
    return { type: 'Private', category: 'light', name: 'Light Aircraft' };
  }
  if (firstByte >= 0xE0 && firstByte <= 0xEF) {
    return { type: 'Military', category: 'various', name: 'Military Aircraft' };
  }
  if (firstByte >= 0x00 && firstByte <= 0x3F) {
    return { type: 'General', category: 'light', name: 'General Aviation' };
  }
  if (firstByte >= 0x70 && firstByte <= 0x7F) {
    return { type: 'Commercial', category: 'widebody', name: 'Wide-body Airliner' };
  }

  return { type: 'Unknown', category: 'unknown', name: 'Unidentified Aircraft' };
}

export function getAircraftIcon(category) {
  const icons = {
    widebody: '✈️',
    narrowbody: '🛫',
    regional: '🛩️',
    cargo: '📦',
    fighter: '🎯',
    transport: '✈️',
    airborne: '🔍',
    light: '🛩️',
    various: '🛫',
    heavy: '✈️',
    unknown: '✈️',
  };
  return icons[category] || '✈️';
}

export function getAircraftSVGPath(category) {
  const paths = {
    widebody: 'M12 2L8 6H4l-2 4 4 2v8l2 2 2-2h4l2 2 2-2v-8l4-2-2-4h-4z',
    narrowbody: 'M12 2L4 8h2l-2 6h4l2 4 2-4h4l-2-6h2z',
    regional: 'M12 4L6 8v6l6 4 6-4V8z',
    cargo: 'M12 2L4 6v8l8 6 8-6V6z',
    light: 'M12 4L6 8h12z',
    fighter: 'M12 2L8 10l4 2 4-2z',
    default: 'M12 2L8 6h8z',
  };
  return paths[category] || paths.default;
}