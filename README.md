# AeroTrack — Real-Time Global Flight Intelligence

A production-grade, fully optimized Next.js 15 flight tracking platform with zero paid APIs and maximum futuristic aesthetic.

## Features

- **Live Global Flight Tracking** — Real-time aircraft positions from OpenSky Network and ADS-B.lol
- **Interactive World Map** — WebGL-powered map using MapLibre GL with dark CartoDB tiles
- **AI Copilot** — Hugging Face inference-powered aviation assistant with streaming responses
- **Flight HUD** — Aviation-style heads-up display with altitude graphs and speed arcs
- **Advanced Filtering** — Filter flights by altitude, speed, aircraft type, and country
- **Futuristic Design** — Mantine UI v8 with custom dark theme, scanline effects, and glowing elements

## Tech Stack

- **Framework**: Next.js 15.3 (App Router, JavaScript only)
- **UI**: Mantine UI v8 + @mantine/charts
- **Animation**: motion/react v12
- **Map**: react-map-gl v8 + maplibre-gl v5
- **State**: Zustand v5 with immer middleware
- **Data Fetching**: TanStack Query v5
- **AI**: @huggingface/inference v3 (Mistral-7B-Instruct-v0.3)
- **Icons**: lucide-react + @tabler/icons-react

## Getting Started

### Prerequisites

- Node.js >= 22.0.0
- Hugging Face API token (free tier sufficient)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd flight-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.local .env.local
```

Edit `.env.local` and add your Hugging Face token:
```
HF_TOKEN=hf_your_free_token_here
```

Get your free token at: https://huggingface.co/settings/tokens

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── layout.jsx          # Root layout with Mantine provider
│   ├── page.jsx            # Landing page with hero search
│   ├── explore/page.jsx    # Global flight explorer
│   ├── track/[icao24]/page.jsx  # Single flight tracking
│   └── api/
│       ├── flight/         # OpenSky + ADS-B.lol proxy
│       ├── explore/        # Cached all-flights endpoint
│       └── chat/           # HF inference streaming
├── components/
│   ├── map/                # FlightGlobe, FlightLayer, RouteArc
│   ├── flight/             # FlightHUD, AltitudeGraph, SpeedArc
│   ├── search/             # HeroSearch, SearchResults
│   ├── ai/                 # AICopilot, MessageBubble, ThinkingPulse
│   └── ui/                 # Navbar, StatsBar, GlowCard, RadarSpinner
├── lib/
│   ├── flightParser.js     # OpenSky state vector parsing
│   ├── opensky.js          # OpenSky API client
│   ├── adsbLol.js          # ADS-B.lol API client
│   ├── aircraftClassifier.js # ICAO24 prefix classification
│   ├── rateLimiter.js      # LRU-based rate limiter
│   └── promptSanitizer.js  # Chat input sanitization
├── store/
│   ├── flightStore.js      # Tracked flight + altitude history
│   ├── chatStore.js        # Chat message history
│   └── uiStore.js          # UI state (drawers, scanlines)
├── styles/
│   ├── theme.js            # Mantine theme configuration
│   ├── globals.css         # CSS custom properties + animations
│   └── modules/            # CSS Module styles
└── workers/
    └── flightProcessor.worker.js  # Comlink web worker
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/flight` | GET | Fetch flight(s) by ICAO24 or callsign |
| `/api/explore` | GET | Get all flights (cached, 10s revalidation) |
| `/api/chat` | POST | AI chat with streaming SSE |

### Query Parameters

- `icao24` — 6-character hex ICAO24 code (e.g., `a1b2c3`)
- `callsign` — Aircraft callsign (e.g., `UAL123`)

## Data Sources

- **OpenSky Network** — Real-time flight states (no auth required)
- **ADS-B.lol** — Supplementary aircraft data
- **CartoDB** — Free vector map tiles (dark style)

## Security

- Zod validation on all API inputs
- Per-IP rate limiting (20 req/min)
- Prompt injection detection for AI chat
- CSP headers configured in next.config.js
- No sensitive data in client-side code

## Performance

- MapLibre GL symbol layers for GPU-accelerated rendering
- Web Worker for off-thread flight data processing
- TanStack Query with optimized stale/gc times
- Next.js caching for explore endpoint
- Dynamic imports for map components (no SSR)

## Design System

- **Mantine v8** — Full component library
- **CSS Modules** — Scoped styles, no Tailwind
- **CSS Variables** — Custom properties for theming
- **Animations** — motion/react for smooth transitions

## License

MIT

## Credits

- OpenSky Network for flight data
- ADS-B.lol for supplementary data
- MapLibre GL for map rendering
- Hugging Face for AI inference