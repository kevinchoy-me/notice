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
