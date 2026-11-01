# Quotation App

A mobile-first quotation manager that runs entirely in the browser. Create
quotations, calculate GST, and download a print-ready A4 PDF on your own
letterhead. It works offline after the first load and can be installed on a
phone or desktop as a PWA.

## Features

- Create, edit, duplicate, search, and delete quotations.
- Automatic quote numbers in `PREFIX/FY/0001` format, reset each financial year
  (April to March).
- Per-line GST rates, paise-safe totals, and a visible rupee round-off.
- Amount in words, Indian number formatting, and optional signature.
- Letterhead PDF with logo, company details, repeated table header, page
  numbers, and footer.
- Local-first storage in IndexedDB. No account, server, or network required.
- JSON backup export and restore.
- Installable PWA with offline support and an update prompt.

## Stack

React 19, TypeScript, Vite, Tailwind CSS v4, React Router, Dexie, React Hook
Form, Zod, React PDF, and vite-plugin-pwa. Tests use Vitest, jsdom, and
fake-indexeddb.

## Getting started

Requires Node.js 22 or newer (tested on Node 24).

```bash
npm install
npm run dev
```

Open the URL printed by Vite. The app uses hash routing, so all routes work
without server rewrites.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | Run the TypeScript compiler |
| `npm run lint` | Run oxlint |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Run tests in watch mode |

## Using the app

1. Open **Settings** and enter your company details, logo, and signature.
2. Set your default GST rate and quote prefix.
3. Tap **New** to create a quotation. Prices are entered GST-exclusive.
4. Pick a date, add line items, and review the live totals.
5. Open the quotation and download or share the PDF.

The typed signatory name is only used when no signature image is uploaded. A
transparent PNG works best.

## Data and backup

All data is stored in the browser's IndexedDB database `quotation-app` on the
current device. Clearing browser data removes it, so export a JSON backup from
**Settings** before clearing storage or moving to another device. Restoring a
backup replaces all data on the device.

## PWA and offline use

Run `npm run build` and `npm run preview` to test the production service worker.
After the first visit, the app shell is cached and works offline. The app shows
an offline notice, an "update available" prompt when a new version is deployed,
and an install card in Settings where the browser supports it.

On iOS, use Safari's Share menu and choose **Add to Home Screen**.

## Deployment

`npm run build` writes a static site to `dist/`. Deploy that folder to any static
host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, or a normal web server)
over HTTPS. PWAs require HTTPS, except on `localhost`.

The app is configured for a site root (`/`). To host it under a subpath, set
Vite's `base` option and update `start_url`, `scope`, and icon paths in the PWA
manifest accordingly.

## Money and PDF notes

- Amounts are calculated in paise and rounded per line; the grand total is
  rounded to the nearest rupee with a visible round-off.
- The PDF uses `Rs.` instead of `₹` because the built-in PDF font does not
  include the rupee glyph. The UI still uses `₹`.
- PDFs are generated on the device. Nothing is uploaded.

## Project structure

```
src/
  app/          Layout, routing shell, error boundary
  components/   Shared UI components
  features/     Quotations, settings, PDF, PWA features
  lib/          Database, validation, formatting, calculations
  types/        Shared TypeScript types
```
