# PlantSis 🌿

Your sassy plant care companion - A Progressive Web App

## Getting Started

### Prerequisites

- Node.js v18+ installed
- Supabase account (free tier)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your Supabase credentials:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

3. Run development server:
```bash
npm run dev
```

4. Open http://localhost:5173 in your browser

### Testing on Mobile

To test on your phone (connected to same WiFi):

```bash
npm run dev -- --host
```

Then visit `http://YOUR_LOCAL_IP:5173` on your phone.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **PWA**: vite-plugin-pwa
- **AI**: OpenAI GPT-4 Vision (coming soon)

## Project Structure

```
plant-sis/
├── public/              # Static assets
├── src/
│   ├── pages/          # React Router pages
│   ├── components/     # Reusable components
│   ├── lib/            # Business logic & API clients
│   ├── hooks/          # Custom React hooks
│   ├── types/          # TypeScript types
│   └── constants/      # App configuration
├── vite.config.ts      # Vite configuration
└── tailwind.config.js  # Tailwind CSS config
```

## Development Phases

- [x] Phase 1: Foundation & Setup
- [x] Phase 2: Supabase Setup & Authentication
- [x] Phase 3: Core Plant Management UI
- [ ] Phase 4: AI Plant Identification
- [ ] Phase 5: Guided Check-Ins
- [ ] Phase 6: PWA Configuration
- [ ] Phase 7: Smart Reminders
- [ ] Phase 8: Monetization
- [ ] Phase 9: Polish & Launch

## License

MIT
