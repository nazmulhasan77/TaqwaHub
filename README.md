# TaqwaHub v1.2.1

**Every New Tab, A Step Closer to Allah.**

TaqwaHub is a Chrome Manifest V3 Islamic new-tab dashboard built with React, TypeScript and Vite.

## Main features

- Prayer times using either a manually selected city/country or the device's current location.
- Clear location mode selection, permission/error feedback and one-time refresh after applying settings.
- Hanafi/Shafi Asr method, custom Jamaat times and 12/24-hour display.
- Prayer-wise notifications with separate enable, advance-minute and at-time controls.
- English/Bangla prayer, Quran, Hadith and Islamic-event reminders.
- Hijri date adjustment and cached prayer-time fallback.
- Ayyam al-Bid priority rule: upcoming on Hijri 1–12 unless an earlier fixed event exists, exclusive on 13–15, hidden after 15.
- A focused **More Tools** drawer containing only the monthly Hijri calendar.
- Monthly Hijri calendar with Ayyam al-Bid, built-in events and custom Hijri events.
- Customizable daily Barakah checklist.
- Simple quick links without category filters.
- Quran, Dua and Hadith dashboard-card visibility controls.
- Theme, accent color, glass blur and custom background controls.
- JSON backup/import and complete local reset.
- Toolbar popup showing the next prayer and saved daily progress.

## Build

```bash
npm install
npm run build
```

The production extension is created in `dist/`.

## Load in Chrome

1. Build the project.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Select **Load unpacked**.
5. Choose the generated `dist` folder.

## Data migration

Version 1.2.1 keeps existing settings and quick links compatible. Old quick-link categories are removed during settings migration because categories are no longer shown.

## Notes

Hijri dates and Islamic occasions can differ according to local moon sighting and official announcements. Current-location mode uses the Chrome geolocation permission and sends coordinates directly to the Aladhan prayer-time API.
