# sdin.dev — Personal Website

Source for [sdin.dev](https://sdin.dev): a static, GitHub Pages–hosted portfolio and services site.

## Pages

- `index.html` — home (developer / consultant)
- `ai/` — AI development services (DFY & DWY)
- `automation/` — business automation services
- `coaching/` — coaching, consulting & fractional-CTO services
- `resume/` — canonical resume
- `privacy/` — analytics, contact-action, and third-party processing disclosure
- `sean-dinwiddie_resume.html` — legacy static redirect to `/resume/`
- `404.html` — branded route-not-found page

## Shared assets (single source of truth)

The canonical service pages share the assets below instead of duplicating CSS and behavior. The privacy page intentionally omits analytics and tracking, while the resume keeps its print-specific CSS inline.

- `styles.css` — self-contained Ayu Mirage palette (`--ayu-*` CSS variables), syntax-inspired presentation, typography, animations, and accessibility rules.
- `tailwind.css` — **generated** Tailwind utilities (see Build). Do not edit by hand.
- `normalize.js` — generated canonical production-host normalization; leaves local and preview hosts untouched.
- `analytics.js` — privacy-signal-aware Google Analytics loader with ad-personalization signals disabled.
- `site.js` — shared behavior: AOS init and accessible mobile-menu state/focus handling. Native fragment navigation and CSS provide scrolling.
- `tracking.js` — shared Google Analytics conversion tracking (page views by path, mailto/tel, scroll-depth, time-on-page, outbound links).
- `vendor/` in the built artifact — locally packaged AOS and Font Awesome files copied from exact, lockfile-pinned npm packages; service pages do not contact visual CDNs or Google Fonts.

Colors are referenced everywhere as `var(--ayu-*)` (e.g. `bg-[var(--ayu-panel)]`) so the whole site re-themes from the `:root` block in `styles.css`.

SEO metadata, the stable Person/WebSite/WebPage/Service schema graph, routes, sitemap entries, the phone allowlist, and the deployment allowlist are defined in `scripts/site-manifest.mjs`. Generated absolute SEO URLs use `https://sdin.dev` in committed source files; set `SITE_URL` to an alternate HTTPS origin to render a portable `dist/` artifact without coupling the source checkout to another site.

## Build

Tailwind is compiled to a static `tailwind.css` (the dev CDN is not used in production).

```bash
npm install      # first install; package-lock.json is committed
npm run build    # regenerate metadata, CSS, sitemaps, and dist/
npm run check    # validate semantics, links, schema, phone, sitemap, and artifact contents
```

The build compiles Tailwind, generates page metadata and both XML sitemaps from immutable page entities, then creates a portable, explicitly allowlisted `dist/` artifact. Sitemap `lastmod` values use each clean page's Git commit date and the current UTC date for new or locally modified pages.

**Re-run it whenever you add/remove Tailwind classes or add/change an indexable route**, or CI will flag the generated files as stale (see `.github/workflows/build.yml`).

## Local preview

Build and serve the deployment artifact so root-relative assets resolve exactly as they do in production:

```bash
npm run build
python3 -m http.server 8000 --directory dist
```

## Deployment

The GitHub Actions workflow builds and checks the site, uploads only `dist/`, and deploys that artifact to GitHub Pages. Repository notes, test harnesses, build scripts, and workspace files are never included. GitHub Pages must use **GitHub Actions** as its deployment source; pushing to `main` then deploys the verified artifact.

## Migration Notes

- **Migration date:** September 2, 2024
- **Purpose:** Separate public website content from private business materials
- **Private content:** Moved to `sdin-business-private` repository

## License

All rights reserved. This is a personal website and its contents are protected by copyright.

## Contact

See the contact details on the website.
