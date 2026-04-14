/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://api.mapbox.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com https://api.mapbox.com https://basemaps.cartocdn.com",
            "font-src 'self' https://fonts.gstatic.com data:",
            "img-src 'self' data: blob: *",
            "connect-src 'self' https://opensky-network.org https://api.adsb.lol https://api-inference.huggingface.co https://globe.adsbexchange.com https://basemaps.cartocdn.com https://*.basemaps.cartocdn.com https://tile.openstreetmap.org https://*.tile.openstreetmap.org https://api.mapbox.com https://*.mapbox.com",
            "worker-src 'self' blob:",
          ].join('; ')
        },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }
      ]
    }
  ]
};
export default nextConfig;