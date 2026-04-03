# InsightOS Recode 2026

Privacy-first lightweight analytics engine with:

- tracker script for pageviews, clicks, scroll depth, and rage clicks
- backend event ingestion + queue worker
- dashboard for traffic, heatmap, funnel, sessions, and UX signals

## Project Structure

- `client/`: Vite + React dashboard
- `server/`: Express + BullMQ + MongoDB + Redis API

## Quick Start

1. Create env files:
   - copy `server/.env.example` to `server/.env`
   - copy `client/.env.example` to `client/.env`

2. Install dependencies:
   - in `client/`: `npm install`
   - in `server/`: `npm install`

3. Run backend:
   - in `server/`: `npm run dev`

4. Run frontend:
   - in `client/`: `npm run dev`

5. (Optional) Seed funnel manually:
   - in `server/`: `npm run seed`

   The app now also auto-seeds default funnel steps on first funnel request when missing.

## Tracking URL and Script

Backend serves the collector script at:

- `http://localhost:5000/tracker.js`

Embed on any website:

```html
<script
  defer
  src="http://localhost:5000/tracker.js"
  data-site="default"
  data-api="http://localhost:5000"
></script>
```

Notes:

- `data-site` should match the site id you view in dashboard (default: `default`)
- `data-api` is your backend base URL
- dashboard now includes a `Tracking setup` card with copy buttons

## Default Login

- email: value of `AUTH_EMAIL` from `server/.env`
- password: value of `AUTH_PASSWORD` from `server/.env`

## Security Reminder

If real credentials/secrets were committed or shared, rotate them immediately (MongoDB, Redis, JWT, auth password).
