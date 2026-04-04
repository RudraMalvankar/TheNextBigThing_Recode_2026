# ⚡ InsightOS v2: The Nuclear Update (Full Project Guide)

Welcome to the comprehensive technical guide for **InsightOS v2**. This platform has evolved from a basic tracker into a premium, high-conversion analytics suite with real-time intelligence and AI-driven growth insights.

---

## 🏗 System Architecture: The "Nervous System"

InsightOS is built for extreme performance and scalability, ensuring that tracking scripts never slow down the host website.

### 1. The Ingestion Pipeline
- **Tracker Script (`tracker.js`)**: A ultra-lightweight (<5KB) vanilla JS script that batches events (clicks, pageviews, moves, scrolls) and sends them via `navigator.sendBeacon` (failover to `fetch`).
- **Redis & BullMQ**: Events hit the `/api/track` endpoint and are immediately pushed to a **Redis-backed queue**. This prevents database bottlenecks during traffic spikes.
- **Background Worker (`eventWorker.js`)**: A dedicated worker pulls events from the queue, performs GeoIP lookups, parses User-Agents, and hydrates the **Session** model.

### 2. The Real-time Engine
- **Socket.io**: Broadcasts live updates. When the worker finishes processing an event, it emits to the "Live Pulse" and "Live Activity Feed" dashboards.

---

## 🚀 Key Modules & Features

### 🔐 Authentication & Onboarding
- **Secure Sessions**: JWT-based auth with `httpOnly` cookies.
- **Onboarding Flow**: 2-step setup (Site Creation ➔ Tracker Installation) designed for high conversion.

### 🔥 Advanced Heatmap Engine
- **Real Screenshots**: Uses a backend **Puppeteer + Chromium** engine to capture pixel-perfect snapshots of your pages.
- **Click Overlays**: Historical click data is rendered as a thermal density map directly on top of the screenshot using the HTML5 Canvas API.
- **View Modes**: Toggle between "Combined", "Heatmap Only", and "Screenshot Only".

### 🧠 Gemini AI Insights
- **Intelligence**: Integrated with **Google Gemini 1.5 Flash**.
- **Analysis**: Aggregates 24h data (Bounce rate, rage clicks, funnel drop-offs, geography) and generates 6 actionable "Conversion Wins".
- **Fallback**: Built-in heuristic engine if the AI API is unavailable.

### ⚡ Live Activity Feed (Hacker Dashboard)
- **Pulse**: A real-time, scrolling monospace feed of *every* action.
- **Frustration Tracking**: Automatically flags **Rage Clicks** (😤) in the feed for immediate attention.

### 📊 Audience & Attribution
- **Referrer Tracking**: Automatically categorizes traffic sources (Google, Facebook, LinkedIn, Direct).
- **Device Analytics**: Granular breakdown of Browsers (Chrome, Safari), OS (iOS, Android), and Device Types (Mobile, Desktop).
- **Geography**: Interactive global map + detailed country-level stats table.

### 🎯 Custom Events & Performance
- **Custom API**: `InsightOS.track("event_name", { props })` allows developers to track anything.
- **Speed Monitoring**: Tracks **TTFB**, **DOM Load**, and **Full Page Load** times for every visitor.

### 🔔 Smart Alerts
- **Thresholds**: Users can set up alerts for metrics like "Bounce Rate > 70%" or "Traffic Drop < 10 users".
- **Notifications**: Real-time socket alerts and dashboard history.

---

## 🛠 Tech Stack Breakdown

| Component | Technology |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS, Framer Motion, Recharts |
| **Backend** | Node.js, Express, MongoDB (Mongoose) |
| **Queue/Cache** | Redis, BullMQ |
| **Auth** | JWT, bcryptjs, cookie-parser |
| **AI** | Google Generative AI (Gemini) |
| **Automation** | Puppeteer-core, @sparticuz/chromium |
| **Utilities** | ua-parser-js, geoip-lite, socket.io |

---

## 📂 Data Topology (`server/src/models/`)

- **`User`**: Secure account data.
- **`Site`**: The core tracking entity.
- **`Event`**: Individual atomic actions (click, scroll, custom).
- **`Session`**: The "User Journey" container.
- **`Screenshot`**: Daily snapshots of tracked pages.
- **`Alert`**: User-defined monitoring triggers.

---

## 📋 Developer Quick Start

1. **Install Deps**: `npm install` in both `client` and `server`.
2. **Environment**: Ensure `JWT_SECRET`, `MONGO_URI`, and `REDIS_URL` are set.
3. **AI**: Add `GEMINI_API_KEY` for intelligent insights.
4. **Execution**:
   - Backend: `npm run dev` (starts express + BullMQ worker)
   - Frontend: `npm run dev` (Vite)

---
**Status**: v2 Nuclear Complete  
**Design Spirit**: Kreosio Light / Enterprise Analytics
