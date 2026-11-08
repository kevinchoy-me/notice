# Occurra

Reflective, private, local-first money awareness.

- `client/` — Angular app (standalone, prerendered static output, Tailwind, Dexie)
- `server/` — reserved for Phase 2

## Develop

```bash
cd client
npm install
npm start
```

`npm run build` writes static, prerendered HTML to `client/dist/occura/browser`.

## Renewal dates

- Past renewal dates advance quietly by whole cycles (a month or a year) when any page loads, and the new date is saved.
- Each subscription remembers its renewal day (`anchorDay`), so a renewal on the 31st shows as 30 Nov or 28 Feb in shorter months and returns to the 31st after.
- The Add and Edit forms only accept today or a later date.
- Known limitation: dates advance only on page load. A tab left open past a renewal date shows the old date until the page is reloaded or another page is opened.

## Domain and search

- The site is served at https://www.occurra.co, which is connected to the Cloudflare Worker.
- Canonical links, Open Graph URLs, `robots.txt` and `sitemap.xml` all name that domain. If it changes, update `SITE_URL` in `client/src/app/core/seo.ts` and the URLs in `client/public/robots.txt` and `client/public/sitemap.xml` together.
- After a deploy, submit https://www.occurra.co/sitemap.xml in Google Search Console.
- Google Search Console verification file: `client/public/google8cbf628a1c17b8d1.html/index.html`. It's a folder on purpose: Cloudflare's `drop-trailing-slash` handling redirects a plain `.html` file to its extensionless address, and this layout serves `/google8cbf628a1c17b8d1.html` directly with a 200. Don't remove it, or the site loses verification.
- Internal names keep the old spelling on purpose: the browser database `OccuraDB` (renaming it would leave existing users with an empty list), the Angular project and package name `occura`, and the build folder `dist/occura/browser` that `wrangler.jsonc` and Cloudflare's build use.

## Logo and icons

- The mark is a sage (`#5B7C6E`) chevron on warm off-white (`#F9F8F6`). It's a clean SVG recreation from the chosen logo's description, not the original artwork; replace both SVGs if the original file becomes available.
- Sources: `client/public/icons/logo.svg` (app icons, kept inside the maskable safe zone) and `client/public/favicon.svg` (tighter crop for browser tabs).
- Exported files: `favicon.ico` (16, 32, 48), `icons/icon-192.png`, `icons/icon-512.png`, `icons/icon-maskable-512.png`, `icons/apple-touch-icon.png` (180). Re-export all of them if the SVGs change.

## Optional tip note

- A quiet "If Occurra has been useful, a small tip is welcome. Leave a tip" line sits in the footer of every page, with a matching "Tips" section on the privacy page.
- Both are hidden until `TIP_URL` in `client/src/app/core/support.ts` is set to a real tip page (e.g. Ko-fi, Buy Me a Coffee, Stripe Payment Link), so no placeholder link ever goes live.

## Install banner

- A small banner under the menu offers installing Occurra, from the second visit on (so it never stacks with the first-visit welcome).
- Chrome, Edge and Samsung Internet show an Install button that opens the browser's own dialog. The browser's install event is caught early by a small script in `client/src/index.html` and used by `client/src/app/core/install.ts`.
- iPhone and iPad Safari show "tap Share, then Add to Home Screen" instead, since Safari has no install button for sites.
- Hidden when Occurra is already running as the installed app, and in browsers with no install option (e.g. Firefox desktop).
- "Not now", or declining the browser's dialog, hides it for 30 days (`INSTALL_SNOOZE_DAYS`), stored in this browser only.
