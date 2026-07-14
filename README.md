# TOF Social

Marketing site and platform prototype for TOF Social — helping tennis and padel clubs engage youth members through activity tracking, streaks, and club leaderboards.

## Stack

- [Next.js 14](https://nextjs.org/) (App Router)
- TypeScript, Tailwind CSS
- Local demo mode (localStorage prototype, no backend yet)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3005](http://localhost:3005) (see `package.json` for the dev port).

## Demo routes

- `/` — marketing homepage
- `/vereniging` — club demo (TC De Smash)
- `/verenigingen` — club leaderboard
- `/profiel`, `/log`, `/spelers` — player flows

## Tenniskamp (live)

Site staat in **kamp-modus**: homepage en oude demo-routes redirecten naar het live scorebord.

| Route | Doel |
|-------|------|
| **`/tof-kamp`** | Live wall (ouders + projector) — ook via `/` |
| `/trainer` | Begeleiders punten geven |
| `/groepen` | Spelers indelen in groep 1–9 |

### Supabase setup

1. Run `supabase/migrations/001_camp.sql` in the [SQL Editor](https://supabase.com/dashboard/project/iemgpccgdlwpsrsjuumo/sql)
2. Copy `.env.example` → `.env.local` (local) and add the same keys in Vercel

**Vercel environment variables:**

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://iemgpccgdlwpsrsjuumo.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your `anon` `public` JWT key |
| `SUPABASE_SERVICE_ROLE_KEY` | your `service_role` secret (server only, optional) |

Without env vars the camp falls back to localStorage (single browser only).

## License

Private — 2xGen / TOF Sports.
