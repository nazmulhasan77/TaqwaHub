import type { PrayerName, PrayerTimes } from '../types';

export const prayerOrder: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export function parsePrayerTime(time: string, base = new Date()): Date {
  const clean = time.split(' ')[0];
  const [hour, minute] = clean.split(':').map(Number);
  const date = new Date(base);
  date.setHours(hour, minute, 0, 0);
  return date;
}

export function getNextPrayer(prayerTimes: PrayerTimes, now = new Date()) {
  for (const prayer of prayerOrder) {
    const at = parsePrayerTime(prayerTimes.timings[prayer], now);
    if (at > now) return { name: prayer, at };
  }
  const tomorrow = parsePrayerTime(prayerTimes.timings.Fajr, now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { name: 'Fajr' as PrayerName, at: tomorrow };
}

export function getCurrentOrNextPrayer(prayerTimes: PrayerTimes, now = new Date()) {
  const next = getNextPrayer(prayerTimes, now);
  const index = prayerOrder.indexOf(next.name);
  const current = index <= 0 ? 'Isha' : prayerOrder[index - 1];
  return { current, next };
}
