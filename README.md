# Long Hưng Website

Astro 6 site for Long Hưng with a Cloudflare Workers runtime.

## What this repo does

- Public pages render on Cloudflare Workers so product and article data can stay fresh.
- Admin login uses the Railway backend API.
- Frontend environment variables use `PUBLIC_` prefixes.

## Important deployment note

- Deploy this frontend to **Cloudflare Workers**, not Cloudflare Pages.
- Cloudflare Pages is static-only and will not run the SSR routes used here.

## Setup

```bash
npm install
npm run build
```

## Local development

```bash
npm run dev
```

## Preview production runtime locally

```bash
npm run preview
```

## Environment variables

Create a `.env` file for local development:

```env
PUBLIC_API_URL=https://longhung-website-backend-production.up.railway.app
PUBLIC_API_TIMEOUT=30000
```

## Cloudflare config

- `astro.config.mjs` uses the Cloudflare adapter.
- `wrangler.jsonc` enables `nodejs_compat` because the catalog layer uses `node:fs` and `node:path`.

## Key routes

- `/admin-login` - Admin authentication
- `/admin/dashboard` - Admin management UI
- `/san-pham` - Public product catalog
- `/san-pham/[slug]` - Public product detail
- `/tin-tuc` - Public article list
- `/tin-tuc/[slug]` - Public article detail
