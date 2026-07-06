import type { PrayerTimes, Settings } from '../types';
import { aladhanDate, dateKey } from '../utils/dateUtils';
import { getStored, setStored } from './storageService';

function cacheKey(settings: Settings, date = new Date()) {
  return `prayer:${dateKey(date)}:${settings.city.toLowerCase()}:${settings.country.toLowerCase()}:${settings.method}`;
}

export async function getPrayerTimes(settings: Settings): Promise<{ data: PrayerTimes; warning?: string }> {
  const key = cacheKey(settings);
  const cached = await getStored<PrayerTimes | null>(key, null);
  if (cached) return { data: { ...cached, source: 'cache' } };

  const url = new URL(`https://api.aladhan.com/v1/timingsByCity/${aladhanDate()}`);
  url.searchParams.set('city', settings.city);
  url.searchParams.set('country', settings.country);
  url.searchParams.set('method', String(settings.method));

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Aladhan responded ${response.status}`);
    const json = await response.json();
    const timings = json.data.timings;
    const hijri = json.data.date.hijri;
    const data: PrayerTimes = {
      dateKey: dateKey(),
      city: settings.city,
      country: settings.country,
      method: settings.method,
      timings: {
        Fajr: timings.Fajr,
        Dhuhr: timings.Dhuhr,
        Asr: timings.Asr,
        Maghrib: timings.Maghrib,
        Isha: timings.Isha,
        Sunrise: timings.Sunrise,
        Sunset: timings.Sunset
      },
      hijri: {
        day: Number(hijri.day),
        month: hijri.month.en,
        monthNumber: Number(hijri.month.number),
        year: Number(hijri.year)
      },
      gregorianDate: json.data.date.readable,
      source: 'api'
    };
    await setStored(key, data);
    await setStored('lastPrayerTimes', data);
    return { data };
  } catch (error) {
    const last = await getStored<PrayerTimes | null>('lastPrayerTimes', null);
    if (last) return { data: { ...last, source: 'cache' }, warning: 'Using cached prayer times. Refresh when internet is available.' };
    throw error;
  }
}
