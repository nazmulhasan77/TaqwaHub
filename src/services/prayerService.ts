import type { HijriDate, PrayerTimes, Settings } from '../types';
import { aladhanDate, dateKey } from '../utils/dateUtils';
import { getStored, setStored } from './storageService';

function applyHijriAdjustment(prayerTimes: PrayerTimes, adjustment: number): PrayerTimes {
  const result = { ...prayerTimes, hijri: { ...prayerTimes.hijri } };
  
  // Manually adjust hijri date
  let adjustedDay = result.hijri.day + adjustment;
  let adjustedMonthNumber = result.hijri.monthNumber;
  let adjustedYear = result.hijri.year;
  let adjustedMonthEn = result.hijri.month;
  
  // Handle month/year transitions
  const hijriMonths = [
    { number: 1, en: "Muharram", days: 29 },
    { number: 2, en: "Safar", days: 30 },
    { number: 3, en: "Rabi' al-Awwal", days: 29 },
    { number: 4, en: "Rabi' al-Thani", days: 30 },
    { number: 5, en: "Jumada al-Awwal", days: 29 },
    { number: 6, en: "Jumada al-Thani", days: 30 },
    { number: 7, en: "Rajab", days: 29 },
    { number: 8, en: "Sha'ban", days: 30 },
    { number: 9, en: "Ramadan", days: 29 },
    { number: 10, en: "Shawwal", days: 30 },
    { number: 11, en: "Dhu al-Qi'dah", days: 29 },
    { number: 12, en: "Dhu al-Hijjah", days: 30 }
  ];
  
  // Helper function to get month safely
  const getMonth = (monthNum: number) => {
    return hijriMonths.find(m => m.number === monthNum) || hijriMonths[0];
  };
  
  // Adjust backwards
  while (adjustedDay < 1) {
    adjustedMonthNumber--;
    if (adjustedMonthNumber < 1) {
      adjustedMonthNumber = 12;
      adjustedYear--;
    }
    const month = getMonth(adjustedMonthNumber);
    adjustedMonthEn = month.en;
    adjustedDay += month.days;
  }
  
  // Adjust forwards
  let currentMonth = getMonth(adjustedMonthNumber);
  while (adjustedDay > currentMonth.days) {
    adjustedDay -= currentMonth.days;
    adjustedMonthNumber++;
    if (adjustedMonthNumber > 12) {
      adjustedMonthNumber = 1;
      adjustedYear++;
    }
    const nextMonth = getMonth(adjustedMonthNumber);
    adjustedMonthEn = nextMonth.en;
    currentMonth = nextMonth;
  }
  
  result.hijri = {
    day: adjustedDay,
    month: adjustedMonthEn,
    monthNumber: adjustedMonthNumber,
    year: adjustedYear
  };
  
  return result;
}

function cacheKey(settings: Settings, date = new Date()) {
  // Convert madhab string to numeric school value for consistency (1 = Hanafi, 0 = Shafi)
  const schoolValue = settings.madhab === 'hanafi' ? 1 : 0;
  if (settings.autoLocationEnabled && settings.latitude && settings.longitude) {
    return `prayer:${dateKey(date)}:${settings.latitude}:${settings.longitude}:${settings.method}:${schoolValue}`;
  }
  return `prayer:${dateKey(date)}:${settings.city.toLowerCase()}:${settings.country.toLowerCase()}:${settings.method}:${schoolValue}`;
}

function buildPrayerUrl(settings: Settings, date = new Date()): URL {
  let url: URL;
  if (settings.autoLocationEnabled && settings.latitude && settings.longitude) {
    url = new URL(`https://api.aladhan.com/v1/timings/${aladhanDate(date)}`);
    url.searchParams.set('latitude', String(settings.latitude));
    url.searchParams.set('longitude', String(settings.longitude));
    url.searchParams.set('method', String(settings.method));
    // Convert madhab string to API school parameter (1 = Hanafi, 0 = Shafi)
    const schoolValue = settings.madhab === 'hanafi' ? 1 : 0;
    url.searchParams.set('school', String(schoolValue));
  } else {
    url = new URL(`https://api.aladhan.com/v1/timingsByCity/${aladhanDate(date)}`);
    url.searchParams.set('city', settings.city);
    url.searchParams.set('country', settings.country);
    url.searchParams.set('method', String(settings.method));
    // Convert madhab string to API school parameter (1 = Hanafi, 0 = Shafi)
    const schoolValue = settings.madhab === 'hanafi' ? 1 : 0;
    url.searchParams.set('school', String(schoolValue));
  }
  return url;
}

function parseHijri(hijri: any): HijriDate {
  return {
    day: Number(hijri.day),
    month: hijri.month.en,
    monthNumber: Number(hijri.month.number),
    year: Number(hijri.year)
  };
}

function parseTimeToday(time: string, base = new Date()): Date {
  const clean = time.split(' ')[0];
  const [hour, minute] = clean.split(':').map(Number);
  const date = new Date(base);
  date.setHours(hour, minute, 0, 0);
  return date;
}

async function fetchHijriForDate(settings: Settings, date: Date): Promise<HijriDate> {
  const response = await fetch(buildPrayerUrl(settings, date));
  if (!response.ok) throw new Error(`Aladhan responded ${response.status}`);
  const json = await response.json();
  return parseHijri(json.data.date.hijri);
}

async function applySunsetHijriDate(prayerTimes: PrayerTimes, settings: Settings, now = new Date()): Promise<PrayerTimes> {
  const sunset = parseTimeToday(prayerTimes.timings.Sunset, now);
  if (now < sunset) return prayerTimes;

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    return { ...prayerTimes, hijri: await fetchHijriForDate(settings, tomorrow) };
  } catch {
    return prayerTimes;
  }
}

export async function getPrayerTimes(settings: Settings): Promise<{ data: PrayerTimes; warning?: string }> {
  const key = cacheKey(settings);
  const cached = await getStored<PrayerTimes | null>(key, null);
  if (cached) {
    let dataWithCustom = applyHijriAdjustment(await applySunsetHijriDate(cached, settings), settings.hijriAdjustment);
    // Apply custom prayer times
    Object.entries(settings.customPrayerTimes).forEach(([prayer, time]) => {
      if (time) {
        dataWithCustom.timings[prayer as keyof typeof dataWithCustom.timings] = time;
      }
    });
    return { data: dataWithCustom };
  }

  const url = buildPrayerUrl(settings);

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Aladhan responded ${response.status}`);
    const json = await response.json();
    const timings = json.data.timings;
    const hijri = json.data.date.hijri;
    
    let data: PrayerTimes = {
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
      hijri: parseHijri(hijri),
      gregorianDate: json.data.date.readable,
      source: 'api'
    };
    
    // Store unadjusted, raw data in cache (without custom prayer times)
    const dataToStore = { ...data };
    await setStored(key, dataToStore);
    await setStored('lastPrayerTimes', dataToStore);
    
    // Apply hijri adjustment first
    let finalData = applyHijriAdjustment(await applySunsetHijriDate(data, settings), settings.hijriAdjustment);
    // Then apply custom prayer times
    Object.entries(settings.customPrayerTimes).forEach(([prayer, time]) => {
      if (time) {
        finalData.timings[prayer as keyof typeof finalData.timings] = time;
      }
    });
    
    return { data: finalData };
  } catch (error) {
    const last = await getStored<PrayerTimes | null>('lastPrayerTimes', null);
    if (last) {
      let dataWithCustom = applyHijriAdjustment(await applySunsetHijriDate(last, settings), settings.hijriAdjustment);
      Object.entries(settings.customPrayerTimes).forEach(([prayer, time]) => {
        if (time) {
          dataWithCustom.timings[prayer as keyof typeof dataWithCustom.timings] = time;
        }
      });
      return { data: dataWithCustom, warning: 'Using cached prayer times. Refresh when internet is available.' };
    }
    throw error;
  }
}
