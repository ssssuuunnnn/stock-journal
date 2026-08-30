# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

存股日記 (stock-journal) — a purely client-side React + Vite tool for tracking stock-savings goals and buy records. No backend: all data lives in the browser's `localStorage`. Deployed as a static PWA to GitHub Pages.

## Commands

```bash
npm install
npm run dev       # start Vite dev server
npm run build     # production build to dist/ (postbuild copies dist/index.html -> dist/404.html)
npm run preview   # serve the dist/ build locally — required to test PWA/offline/install behavior
npm run lint       # oxlint
```

There is no test suite/framework configured in this repo.

## Deployment

`.github/workflows/deploy.yml` builds and deploys `dist/` to GitHub Pages automatically on every push to `main` (via `actions/deploy-pages`). There is no separate staging step — pushing to `main` is a production deploy.

`.github/workflows/update-market-data.yml` runs `npm run update:prices` + `npm run update:dividends` on a daily cron (and `workflow_dispatch`), commits `src/data/twClosePrices.json` / `src/data/twDividends.json` when either changed, then explicitly `gh workflow run deploy.yml` — a `GITHUB_TOKEN` push does **not** trigger `deploy.yml`'s `push` event, so the deploy must be dispatched by hand. The job is guarded to the `ssssuuunnnn/stock-journal` repo so forks don't run it.

## Architecture

**Routing without a router library.** `src/App.jsx` implements its own tiny router on top of the History API (no `#` hashes): `VIEW_PATHS` maps view keys (`goals`, `goals-new`, `records`, `records-new`, `overview`, `dividends`, `about`, `author`, `changelog`) to path segments, `viewFromPath`/`pathForView` convert between them, and `goTo()` calls `window.history.pushState` + updates state. A `popstate` listener keeps state in sync with back/forward navigation. On touch devices, `useSwipe` (`src/hooks/useSwipe.js`) on `<main>` lets a horizontal swipe move between the four top-level tabs — only when the current view is one of the bare list views (`effectiveView === tab`), never inside a form/detail sub-view, and never when the swipe starts in a horizontally-scrollable area (heatmap, tables) or a modal. Tap-to-switch on `.tab` buttons is unchanged. Because GitHub Pages is static hosting with no server-side rewrites, `npm run build` copies `index.html` to `404.html` (see `postbuild` in package.json) so that a hard refresh on e.g. `/stock-journal/records` still serves the SPA, which then reads `window.location.pathname` to pick the right view.

**`BASE_PATH` must stay consistent across three places** if the repo/site path ever changes: `vite.config.js`'s `BASE_PATH` const (used both for `base` and the PWA manifest's `scope`/`start_url`), and `App.jsx`'s own `BASE_PATH` derived from `import.meta.env.BASE_URL`. The GitHub repo name is `stock-journal` (see `git remote`) even though the local working directory is named `stock-daily` — don't assume they match.

**State model.** Two top-level collections held in `App.jsx` via the `useLocalStorage` hook (`src/hooks/useLocalStorage.js`, a thin `useState` + `localStorage` sync wrapper): `goals` (key `stock-daily:goals`) and `records` (key `stock-daily:records`). Note the storage key prefix is `stock-daily`, not `stock-journal` — do not "fix" this to match the repo name, since it would orphan existing users' saved data. `holdingsByStock` is derived via `useMemo` by summing `records` shares per `stockCode`; goal progress bars compare this against each goal's `targetShares`.

**Units.** All quantities are stored internally in shares (`lib/units.js`). The UI lets users enter either 張 (lots) or 股 (shares); `toShares()` converts on input (1 lot = 1000 shares, Taiwan convention), and `formatShares`/`formatSharesShort` convert back for display.

**Components** (`src/components/`) are simple, mostly stateless-except-local-form-state presentation components fed by props from `App.jsx`: `GoalForm`/`RecordForm` (add flows, each their own route/view), `GoalList`/`RecordTable` (list + delete, each owns a `ConfirmDialog`-gated delete), `Overview` (aggregate stats + combined feed), `About`/`AboutAuthor`/`Changelog` (static content routes, footer-linked; `Changelog` holds the user-facing update log — add a dated entry there when shipping a visible feature). There is no global state library — everything flows down from the two `useLocalStorage`-backed arrays in `App.jsx`.

**Analytics.** Since navigation uses `pushState` rather than full page loads, GA's automatic pageview-on-load doesn't fire on tab switches; `trackPageview()` in `App.jsx` manually sends a `gtag('event', 'page_view', ...)` on every `goTo()` and on `popstate`.

**PWA.** Configured via `vite-plugin-pwa` in `vite.config.js` (`registerType: 'autoUpdate'`, manifest, Workbox precaching). PWA/service-worker behavior only exists in the real `npm run build` output — `npm run dev` has a no-op service worker, so installability/offline must be verified with `npm run build && npm run preview`.

**Stock code autocomplete.** `src/data/twStockList.json` is a static snapshot of Taiwan stock/ETF codes and names (listed, OTC, and emerging-board — TWSE ISIN `strMode=2`/`4`/`5`), generated by `scripts/fetch-stock-list.mjs` (`npm run update:stocks`). It only includes the 股票 (stock) and ETF categories (warrants, TDRs, preferred shares, REIT beneficiary certificates are excluded). The TWSE pages don't send CORS headers, so this must be regenerated locally/at dev time (Node has no CORS restriction) and committed — the browser never fetches TWSE directly. Re-run `npm run update:stocks` manually when the list goes stale; there's no scheduled refresh. `StockCodeField` (`src/components/StockCodeField.jsx`) imports this JSON directly and powers the code-prefix dropdown + name autofill in `GoalForm`.

**Close prices.** `src/data/twClosePrices.json` is a latest-trading-day-only snapshot of `{ date, updatedAt, sources, prices: { <code>: <closePrice> } }`, merging TWSE listed (`STOCK_DAY_ALL` open-data CSV) and TPEX OTC (`stk_wn1430` CSV) closing quotes. Generated by `scripts/fetch-close-prices.mjs` (`npm run update:prices`) and refreshed automatically by the workflow above. Both source CSVs are UTF-8 with ROC-era dates in column 0; no auth or CORS proxy needed server-side, but the browser still can't fetch them directly. `src/lib/closePrices.js` wraps it (`getClosePrice(code)`, `closePriceDate`); consumed by `RecordForm` (auto-fills 成交價 with the latest close until the user edits it — `form.priceAuto` tracks that) and by `Overview` via `portfolioValuation()` in `overviewMetrics.js` (現值 / 未實現損益 — buys-only model, so 持有 = Σ buys and cost = Σ priced buys; P&L only sums stocks whose every buy is priced). Gain/loss colours use `--color-gain` (red) / `--color-loss` (green) per the Taiwan up-is-red convention.

**Ex-dividend forecast.** `src/data/twDividends.json` (`{ updatedAt, count, events: { <code>: { name, date, type, cash, stock } } }`) merges TWSE's 上市股票除權除息預告表 (OpenAPI `TWT48U_ALL`) and TPEX's 上櫃股票除權除息預告 (OpenAPI `tpex_exright_prepost`), each ~2 months forward-looking. `type` is normalised to `息` / `權` / `權息` (TPEX prefixes `除`, stripped); `cash` is 元/股; `stock` is 元/股 = the API's `StockDividendRatio` (配股率) × 10. TPEX's feed includes a few already-past rows — kept in the file, hidden by `getDividendEvent`'s date check. Generated by `scripts/fetch-dividends.mjs` (`npm run update:dividends`). `src/lib/dividends.js` exposes `getDividendEvent(code)` (returns null once the date has passed), `dividendEvents` (the raw map), and the calendar-link helpers. `DividendNotice.jsx` renders the "即將除權息" line + add-to-Google-Calendar link under each matching goal in both `GoalList` and `Overview`; the `dividends` tab (`DividendList.jsx`) lists every event as a table, upcoming-only by default with a "顯示已除權息" toggle, tagging rows that match one of the user's goals.

**`design_handoff_broadsheet/`** is a one-off design-handoff package (reference HTML mockups + proposed CSS + an `APPLY.md` with instructions) for migrating the UI to a "Broadsheet" newspaper-style design system. It's excluded from lint (`.oxlintrc.json` `ignorePatterns`) and is not part of the build — treat it as a spec to consult if asked to apply that redesign, not as live source.
