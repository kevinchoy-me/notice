# Occura

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

- The site is served at https://occura.co, which is connected to the Cloudflare Worker.
- Canonical links, Open Graph URLs, `robots.txt` and `sitemap.xml` all name that domain. If it changes, update `SITE_URL` in `client/src/app/core/seo.ts` and the URLs in `client/public/robots.txt` and `client/public/sitemap.xml` together.
- After a deploy, submit https://occura.co/sitemap.xml in Google Search Console.
- Google Search Console verification file: `client/public/google8cbf628a1c17b8d1.html/index.html`. It's a folder on purpose: Cloudflare's `drop-trailing-slash` handling redirects a plain `.html` file to its extensionless address, and this layout serves `/google8cbf628a1c17b8d1.html` directly with a 200. Don't remove it, or the site loses verification.
