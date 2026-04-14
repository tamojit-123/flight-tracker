const INJECTION_PATTERNS = [
  /ignore\s*(previous|all|above|prior|instructions?)/gi,
  /disregard\s*(previous|all|above)/gi,
  /disregard/gi,
  /system\s*prompt/gi,
  /<script/gi,
  /javascript:/gi,
  /onerror=/gi,
  /onload=/gi,
  /data:/gi,
  /\bDROP\b/i,
  /\bDELETE\b/i,
  /\bINSERT\b/i,
  /\bSELECT\b/i,
  /\bUPDATE\b/i,
  /\bUNION\b/i,
  /\bEXEC\b/i,
  /\bEXECUTE\b/i,
  /eval\s*\(/gi,
  /Function\s*\(/gi,
  /new\s+Function/gi,
  /import\s*\(?[\'"]/gi,
  /require\s*\(/gi,
];

const DANGEROUS_WORDS = [
  'ignore all previous instructions',
  'ignore previous instructions',
  'disregard your guidelines',
  'you are now',
  'pretend you are',
  'override',
  'bypass',
  'jailbreak',
  'roleplay',
];

export function sanitizePrompt(text) {
  if (typeof text !== 'string') return '';

  let clean = text
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;|&gt;|&amp;|&quot;|&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500);

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(clean)) return '[Message blocked: potentially unsafe content]';
  }

  const lower = clean.toLowerCase();
  for (const word of DANGEROUS_WORDS) {
    if (lower.includes(word)) return '[Message blocked: potentially unsafe content]';
  }

  clean = clean.replace(/[\x00-\x1F\x7F]/g, '');

  return clean;
}

export function sanitizeSearchQuery(query) {
  if (typeof query !== 'string') return '';
  return query
    .replace(/[^A-Za-z0-9\s\-]/g, '')
    .trim()
    .toUpperCase()
    .slice(0, 8);
}

export function isValidIcao24(icao) {
  if (typeof icao !== 'string') return false;
  return /^[0-9a-fA-F]{6}$/i.test(icao);
}

export function isValidCallsign(callsign) {
  if (typeof callsign !== 'string') return false;
  return /^[A-Z0-9\s]{1,8}$/i.test(callsign.trim());
}