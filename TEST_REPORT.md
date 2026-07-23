# TaqwaHub v1.2.1 Validation Report

Date: 2026-07-23

## Requested changes verified

- Quick-link `All` and `General` category tabs removed.
- Quick-link category input removed from Settings.
- Legacy quick-link category values are stripped during settings migration.
- The sparkle/AI-style button beside Settings was removed.
- More Tools contains only the Hijri Calendar.
- More Tools received a focused responsive drawer design.
- Location selection now has separate City/Country and Current Location modes.
- Location fields no longer trigger prayer API calls for every typed character; changes apply once with **Apply settings**.
- Current-location mode includes success, timeout, unavailable and permission-denied feedback.
- Chrome geolocation permission is declared in both extension manifests.

## Automated checks passed

- 45 TypeScript/TSX files passed isolated transpilation validation.
- Project source passed TypeScript structural checking with local dependency stubs.
- `public/background.js` syntax check passed.
- `public/popup.js` syntax check passed.
- Both manifest files and package JSON files passed JSON validation.
- Manual City/Country prayer API URL test passed.
- Current-coordinate prayer API URL test passed.
- Current-location result label test passed.
- Legacy quick-link category migration test passed.
- Ayyam al-Bid priority tests passed for Hijri days 1, 10, 11, 13, 14, 15 and 16.
- Requested UI static assertions passed.
- Git whitespace validation passed.

## Build environment note

A full `npm ci` / Vite production build could not run in this environment because the npm registry was unreachable. The project source, package lock and build configuration are included and can be built with:

```bash
npm install
npm run build
```
