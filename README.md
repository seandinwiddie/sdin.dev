# sdin.dev — Personal Website

Source for [sdin.dev](https://sdin.dev): a static, GitHub Pages–hosted portfolio and services site.

## Pages

- `index.html` — home (developer / consultant)
- `ai/` — AI development services (DFY & DWY)
- `automation/` — business automation services
- `coaching/` — coaching, consulting & fractional-CTO services
- `sean-dinwiddie_resume.html` — resume

## Shared assets (single source of truth)

Every page links the same three files instead of duplicating CSS/JS inline. **Edit these, not per-page copies.**

- `styles.css` — theme: the Ayu Mirage palette (`--ayu-*` CSS variables), typography, animations, and accessibility rules (focus ring, skip-link, reduced-motion). Also `@import`s the Dank Mono font.
- `tailwind.css` — **generated** Tailwind utilities (see Build). Do not edit by hand.
- `site.js` — shared behavior: AOS init, mobile-menu toggle (with `aria-expanded`), smooth scroll.
- `tracking.js` — shared Google Analytics conversion tracking (page views by path, mailto/tel, scroll-depth, time-on-page, outbound links).

Colors are referenced everywhere as `var(--ayu-*)` (e.g. `bg-[var(--ayu-panel)]`) so the whole site re-themes from the `:root` block in `styles.css`.

## Build

Tailwind is compiled to a static `tailwind.css` (the dev CDN is not used in production).

```bash
npm install      # once
npm run build    # regenerate tailwind.css after editing any HTML class
```

The build (`tailwindcss -i src/input.css -o tailwind.css --minify`) scans the pages listed in `tailwind.config.js` and emits only the utilities actually used. **Re-run it whenever you add/remove Tailwind classes**, or CI will flag `tailwind.css` as stale (see `.github/workflows/build.yml`).

## Local preview

Serve from the repo root so absolute asset paths (`/styles.css`, `/tailwind.css`, `/site.js`, `/tracking.js`) resolve:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Deployment

GitHub Pages serves the committed files at the `CNAME` domain (sdin.dev). Pushing to `main` deploys.

## Migration Notes

- **Migration date:** September 2, 2024
- **Purpose:** Separate public website content from private business materials
- **Private content:** Moved to `sdin-business-private` repository

## License

All rights reserved. This is a personal website and its contents are protected by copyright.

## Contact

See the contact details on the website.
