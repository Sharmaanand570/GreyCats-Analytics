# GreyCats Analytics

> Unify marketing data across platforms, build custom dashboards and reports, and deliver insights to clients on a schedule.

GreyCats Analytics is a multi-platform analytics and reporting tool for agencies and businesses. Connect data sources once, then build dashboards and white-labelled client reports without manual data wrangling.

## Features

- **Unified data layer** — single batch resolver fetches metrics across all connected integrations in one request
- **Drag-and-drop report builder** — multi-slide reports with charts, tables, metric cards, images, and embeds
- **Live dashboards** — customizable widget grids with date-range scoping and real-time metrics
- **Goals & alerts** — track KPIs, set thresholds, get notified daily/weekly/monthly
- **Scheduled delivery** — automate PDF report generation and client distribution
- **Broadcasts** — manage outbound communications with provider/template management
- **Admin console** — clients, plans, subscriptions, system health, activity feed

### Supported Integrations

Meta Ads · Facebook · Instagram · Google Analytics · Google Search Console · Google Ads · YouTube · Shopify · WooCommerce

## Tech Stack

| Area | Tools |
|------|-------|
| Core | React 19, TypeScript 5.9, Vite 7 |
| State | TanStack Query 5, Zustand 5, React Hook Form 7 |
| UI | Tailwind CSS 3, Radix UI, shadcn/ui, Lucide |
| Charts & Layout | Recharts 3, React Grid Layout |
| Editor | Tiptap 3 |
| PDF | @react-pdf/renderer, jsPDF, html2canvas |
| Routing & HTTP | React Router 7, Axios |
| Validation | Zod 4, DOMPurify |

## Getting Started

### Prerequisites

- Node.js 18+
- A running backend API (see backend repo)

### Setup

```bash
git clone <repository-url>
cd greycats-analytics-v1
npm install
```

Create a `.env` in the project root:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Run the dev server:

```bash
npm run dev
```

App is served at `http://localhost:5173`.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Type-check and produce production bundle |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest suite |
| `npm run audit` | Audit production dependencies |

## Project Structure

```
src/
├── components/        Shared UI (ui/, layout/, widgets, dialogs)
├── features/          Feature modules (auth, reports, broadcasts, admin, ...)
├── hooks/             Custom hooks, including hooks/metrics/* (unified data layer)
├── services/          API clients (unifiedMetrics.api.ts, etc.)
├── lib/               Utilities and metric transformers
├── constants/         Shared constants (metricKeys, integration enum)
├── pages/             Top-level route components
├── types/             Shared TypeScript types
├── App.tsx
└── main.tsx
```

## Architecture Notes

### Unified Metrics Layer

Dashboard and report widgets resolve through a single batch endpoint instead of per-widget fetches:

- `POST /api/unified-metrics/resolve` — batch resolver (preferred for dashboards)
- `GET  /api/unified-metrics/data` — single-metric time-series
- `GET  /api/metabusiness/demographics/:accountId` — Meta demographics

Hooks live in `src/hooks/metrics/`. `useBatchMetricsQuery` is the primary entry point; `BatchMetricsContext` shares results across a slide grid so date-range changes trigger one request, not N.

### Auth

JWT-based auth with Axios interceptors that attach the bearer token and handle 401/403 (see `src/apiConfig.ts`). OAuth 2.0 is used for connecting third-party platforms.

## Configuration

- `tailwind.config.js` — theme and design tokens
- `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` — TypeScript configs
- `components.json` — shadcn/ui config; add components via `npx shadcn-ui@latest add <name>`

## Testing

```bash
npm test                # run once
npm test -- --watch     # watch mode
npm test -- --ui        # Vitest UI
```

## Build & Deploy

```bash
npm run build
npm run preview
```

Output is emitted to `dist/`. Deploy as a static SPA — make sure your host rewrites unknown routes to `index.html` so React Router can take over.

## Troubleshooting

**API requests fail** — confirm `VITE_API_BASE_URL`, that the backend is reachable, and check the browser console for CORS errors.

**OAuth redirects fail** — verify redirect URIs match what's registered with each provider and that callback routes exist in the router.

**Stale build** — clear caches: `rm -rf node_modules .vite dist && npm install`.

## Contributing

- Keep changes scoped — match the existing feature-module structure under `src/features/`
- TypeScript strict mode is on; don't loosen it to make code compile
- Run `npm run lint` and `npm test` before opening a PR
- Prefer the unified metrics hooks over re-introducing per-integration fetchers

---

Built by the GreyCats team.
