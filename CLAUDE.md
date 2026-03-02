# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server (localhost:5173, hot reload)
npm run build     # Type-check with tsc then bundle to dist/
npm run lint      # Run ESLint
npm run preview   # Preview production build locally
node server.js    # Run the production server (serves dist/ + API)
```

There are no tests.

## Architecture

React 19 + TypeScript SPA built with Vite, served in production by a zero-dependency Node.js HTTP server (`server.js`).

### Data persistence

All settings (bookmarks + theme) are stored in a single `settings.json` file on the server at `$DATA_DIR` (default `/data`). The server keeps an in-memory copy and writes to disk on every PATCH. Two API endpoints:

- `GET /api/settings` → returns `{ bookmarks: [...], theme: 'system' | 'light' | 'dark' }`
- `PATCH /api/settings` → merges the body into the in-memory object and writes to disk

Both `useBookmarks` and `useTheme` load from the API on mount and PATCH on every change. If the API is unreachable (e.g. during `npm run dev` where there is no `server.js` running), both hooks fall back to `localStorage`.

### The `loaded` ref pattern in `useTheme`

`useTheme` uses a `loaded` ref to prevent writing back to the API during the initial hydration. The save effect checks `if (!loaded.current) return` — the ref is set to `true` only after the initial API fetch resolves (or fails). Without this, the default `'system'` value would overwrite the stored preference before it was read.

### `generateId()` in `useBookmarks`

`crypto.randomUUID()` requires a secure context (HTTPS or localhost) and is unavailable when the app is served over plain HTTP on a LAN IP. The `generateId()` helper calls `crypto.randomUUID()` when available and falls back to a `Math.random`-based UUID otherwise.

### Filtering and sorting

`App.tsx` derives `filtered` via `useMemo`. Search matches against a combined haystack of title, description, lanUrl, wanUrl, and tags. Multiple active tags all must match. Sort order: pinned bookmarks first, then alphabetical by title.

### Deployment

Pushing to `main` triggers the GitHub Actions workflow (`.github/workflows/docker.yml`), which builds and pushes the image to `ghcr.io/regalen/bookmark-dashboard:latest`. On the homelab, run `docker compose pull && docker compose up -d` from the directory containing `docker-compose.yml`. The volume at `/data` inside the container holds `settings.json`.

`DATA_DIR` and `PORT` can be overridden via environment variables in the server.
