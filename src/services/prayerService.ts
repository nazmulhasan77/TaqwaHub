import type { HijriDate, PrayerTimes, Settings } from '../types';
import { aladhanDate, dateKey } from '../utils/dateUtils';
import { getStored, setStored } from './storageService';

const HIJRI_MONTHS = [
  'Muharram','Safar',"Rabi' al-Awwal","Rabi' al-Thani",'Jumada al-Awwal','Jumada al-Thani',
  'Rajab',"Sha'ban",'Ramadan','Shawwal',"Dhu al-Qi'dah",'Dhu al-Hijjah'
];

function cacheKey(settings: Settings, date = new Date()) {
  const school = settings.madhab === 'hanafi' ? 1 : 0;
  if (settings.autoLocationEnabled && settings.latitude != null && settings.longitude != null) {
    return `prayer:${dateKey(date)}:${settings.latitude}:${settings.longitude}:${settings.method}:${school}`;
  }
  return `prayer:${dateKey(date)}:${settings.city.toLowerCase()}:${settings.country.toLowerCase()}:${settings.method}:${school}`;
}

function buildPrayerUrl(settings: Settings, date = new Date()): URL {
  const byCoordinates = settings.autoLocationEnabled && settings.latitude != null && settings.longitude != null;
  const url = new URL(byCoordinates
    ? `https://api.aladhan.com/v1/timings/${aladhanDate(date)}`
    : `https://api.aladhan.com/v1/timingsByCity/${aladhanDate(date)}`);
  if (byCoordinates) {
    url.searchParams.set('latitude', String(settings.latitude));
    url.searchParams.set('longitude', String(settings.longitude));
  } else {
    url.searchParams.set('city', settings.city);
    url.searchParams.set('country', settings.country);
  }
  url.searchParams.set('method', String(settings.method));
  url.searchParams.set('school', settings.madhab === 'hanafi' ? '1' : '0');
  return url;
}

function parseHijri(hijri: any): HijriDate {
  return { day: Number(hijri.day), month: hijri.month.en, monthNumber: Number(hijri.month.number), year: Number(hijri.year) };
}

function parseTimeToday(time: string, base = new Date()): Date {
  const [hour, minute] = time.split(' ')[0].split(':').map(Number);
  const date = new Date(base); date.setHours(hour, minute, 0, 0); return date;
}

function manualHijriShift(hijri: HijriDate, offset: number): HijriDate {
  let { day, monthNumber, year } = hijri;
  day += offset;
  const assumedDays = (month: number) => month === 12 ? 30 : (month % 2 === 1 ? 30 : 29);
  while (day < 1) { monthNumber -= 1; if (monthNumber < 1) { monthNumber = 12; year -= 1; } day += assumedDays(monthNumber); }
  while (day > assumedDays(monthNumber)) { day -= assumedDays(monthNumber); monthNumber += 1; if (monthNumber > 12) { monthNumber = 1; year += 1; } }
  return { day, monthNumber, year, month: HIJRI_MONTHS[monthNumber - 1] };
}

async function fetchRaw(settings: Settings, date = new Date()): Promise<PrayerTimes> {
  const byCoordinates = settings.autoLocationEnabled && settings.latitude != null && settings.longitude != null;
  if (!byCoordinates && (!settings.city.trim() || !settings.country.trim())) {
    throw new Error('City and country are required');
  }
  const response = await fetch(buildPrayerUrl(settings, date));
  if (!response.ok) throw new Error(`Aladhan responded ${response.status}`);
  const json = await response.json(); const timings = json.data.timings;
  return {
    dateKey: dateKey(date),
    city: byCoordinates ? 'Current Location' : settings.city.trim(),
    country: byCoordinates ? `${settings.latitude!.toFixed(4)}, ${settings.longitude!.toFixed(4)}` : settings.country.trim(),
    method: settings.method,
    timings: { Fajr:timings.Fajr,Dhuhr:timings.Dhuhr,Asr:timings.Asr,Maghrib:timings.Maghrib,Isha:timings.Isha,Sunrise:timings.Sunrise,Sunset:timings.Sunset },
    hijri: parseHijri(json.data.date.hijri), gregorianDate: json.data.date.readable, source:'api'
  };
}

async function resolveAdjustedHijri(raw: PrayerTimes, settings: Settings, now = new Date()): Promise<HijriDate> {
  const afterSunset = now >= parseTimeToday(raw.timings.Sunset, now);
  const offset = settings.hijriAdjustment + (afterSunset ? 1 : 0);
  if (offset === 0) return raw.hijri;
  const target = new Date(now); target.setDate(target.getDate() + offset);
  try { return (await fetchRaw(settings, target)).hijri; }
  catch { return manualHijriShift(raw.hijri, offset); }
}

async function finalize(raw: PrayerTimes, settings: Settings, source: 'api'|'cache'): Promise<PrayerTimes> {
  const result: PrayerTimes = { ...raw, source, timings: { ...raw.timings }, hijri: await resolveAdjustedHijri(raw, settings) };
  Object.entries(settings.customPrayerTimes).forEach(([name,time]) => { if (time) result.timings[name as keyof typeof result.timings] = time; });
  return result;
}

export async function getPrayerTimes(settings: Settings): Promise<{data:PrayerTimes;warning?:string}> {
  const key = cacheKey(settings); const cached = await getStored<PrayerTimes|null>(key,null);
  if (cached) return { data: await finalize(cached, settings, 'cache') };
  try {
    const raw = await fetchRaw(settings); await setStored(key, raw); await setStored('lastPrayerTimes', raw);
    return { data: await finalize(raw, settings, 'api') };
  } catch (error) {
    const last = await getStored<PrayerTimes|null>('lastPrayerTimes',null);
    if (last) return { data: await finalize(last, settings, 'cache'), warning:'Using cached prayer times. Refresh when internet is available.' };
    throw error;
  }
}
