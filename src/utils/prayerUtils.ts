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

export function getCurrentSalahPeriod(prayerTimes: PrayerTimes, now = new Date()) {
  const fajr = parsePrayerTime(prayerTimes.timings.Fajr, now);
  const sunrise = parsePrayerTime(prayerTimes.timings.Sunrise, now);
  const dhuhr = parsePrayerTime(prayerTimes.timings.Dhuhr, now);
  const asr = parsePrayerTime(prayerTimes.timings.Asr, now);
  const maghrib = parsePrayerTime(prayerTimes.timings.Maghrib, now);
  const isha = parsePrayerTime(prayerTimes.timings.Isha, now);

  if (now >= fajr && now < sunrise) return { current: 'Fajr' as PrayerName, at: sunrise, status: 'Ends' as const };
  if (now >= sunrise && now < dhuhr) return { current: 'Dhuhr' as PrayerName, at: dhuhr, status: 'Starts' as const };
  if (now >= dhuhr && now < asr) return { current: 'Dhuhr' as PrayerName, at: asr, status: 'Ends' as const };
  if (now >= asr && now < maghrib) return { current: 'Asr' as PrayerName, at: maghrib, status: 'Ends' as const };
  if (now >= maghrib && now < isha) return { current: 'Maghrib' as PrayerName, at: isha, status: 'Ends' as const };

  if (now >= isha) {
    const tomorrowFajr = parsePrayerTime(prayerTimes.timings.Fajr, now);
    tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
    return { current: 'Isha' as PrayerName, at: tomorrowFajr, status: 'Ends' as const };
  }

  return { current: 'Isha' as PrayerName, at: fajr, status: 'Ends' as const };
}

function addMinutes(date: Date, minutes: number): Date {
  const next = new Date(date);
  next.setMinutes(next.getMinutes() + minutes);
  return next;
}

export function formatPrayerWindowTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function getForbiddenPrayerWindows(prayerTimes: PrayerTimes, now = new Date()) {
  const sunrise = parsePrayerTime(prayerTimes.timings.Sunrise, now);
  const dhuhr = parsePrayerTime(prayerTimes.timings.Dhuhr, now);
  const sunset = parsePrayerTime(prayerTimes.timings.Sunset, now);

  return [
    {
      id: 'after-sunrise',
      label: { en: 'After Sunrise', bn: 'সূর্যোদয়ের পর' },
      startsAt: sunrise,
      endsAt: addMinutes(sunrise, 15)
    },
    {
      id: 'zawal',
      label: { en: 'Zawal', bn: 'যাওয়াল' },
      startsAt: addMinutes(dhuhr, -5),
      endsAt: dhuhr
    },
    {
      id: 'before-sunset',
      label: { en: 'Before Sunset', bn: 'সূর্যাস্তের আগে' },
      startsAt: addMinutes(sunset, -15),
      endsAt: sunset
    }
  ].map((window) => ({
    ...window,
    active: now >= window.startsAt && now < window.endsAt
  }));
}
