# ₿ BTC ETF Flow Dashboard

A clean, real-time Bitcoin spot ETF daily net flow tracker built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **Recharts**.

🔗 **Live Demo:** [btc-etf-dashboard.vercel.app](https://btc-etf-dashboard.vercel.app)

---

## Features

- 📊 **Daily flow chart** — stacked bar chart with total line overlay (last 30 days)
- 📋 **ETF breakdown table** — color-coded inflows (green) and outflows (red) per fund
- 📅 **Weekly & Monthly aggregated views** — tabs to switch timeframes
- 🔢 **Summary cards** — today's flow, weekly total, 30-day net flow
- 🌑 **Dark-mode-first UI** — built for readability on dark backgrounds
- 📱 **Responsive** — mobile-friendly layout

## ETFs Tracked

| Ticker | Fund |
|--------|------|
| IBIT | iShares Bitcoin Trust (BlackRock) |
| FBTC | Fidelity Wise Origin Bitcoin Fund |
| GBTC | Grayscale Bitcoin Trust |
| ARKB | ARK 21Shares Bitcoin ETF |
| BITB | Bitwise Bitcoin ETF |
| HODL | VanEck Bitcoin Trust |
| BRRR | Valkyrie Bitcoin Fund |
| EZBC | Franklin Bitcoin ETF |
| BTCO | Invesco Galaxy Bitcoin ETF |
| DEFI | Hashdex Bitcoin ETF |

## Data Source

The app attempts to scrape live data from **[Farside Investors](https://farside.co.uk/btc/)** via a server-side Next.js API route (avoids CORS issues). If the live fetch fails (e.g., Cloudflare protection), it automatically falls back to **realistic mock data** clearly labeled in the UI.

The API route lives at `/api/flows` and caches responses for 1 hour.

## Tech Stack

- **Framework:** Next.js 14 App Router (TypeScript)
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Parsing:** node-html-parser (for Farside scraping)
- **Deployment:** Vercel

## Getting Started

```bash
git clone https://github.com/enndee-dev22/btc-etf-dashboard
cd btc-etf-dashboard
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

Deployed on Vercel with zero configuration. Any push to `main` auto-deploys.

```bash
vercel --prod
```

## Caveats

- Live data scraping from Farside Investors may be blocked by Cloudflare bot protection
- When live data is unavailable, the dashboard shows clearly-labeled simulated data based on realistic historical ETF flow patterns
- All values are in USD millions (M)
- Not financial advice

## License

MIT
