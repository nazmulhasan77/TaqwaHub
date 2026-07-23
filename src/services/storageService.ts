import type { Settings, PrayerName } from '../types';

const prayers: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const prayerNotifications = Object.fromEntries(prayers.map((name) => [name, {
  enabled: true,
  beforeMinutes: 10,
  atTime: true
}])) as Settings['prayerNotifications'];

export const defaultSettings: Settings = {
  city: 'Dhaka',
  country: 'Bangladesh',
  method: 3,
  madhab: 'hanafi',
  language: 'en',
  timeFormat: '12h',
  clockMode: 'analog',
  notificationsEnabled: true,
  notificationMinutes: 10,
  prayerNotifications,
  hourlyRemindersEnabled: true,
  showQuran: true,
  showHadith: true,
  showDua: true,
  showProductivity: true,
  showIslamicCalendar: true,
  showFastingTracker: true,
  showSalahStats: true,
  showQuranGoal: true,
  showRamadanMode: true,
  autoLocationEnabled: false,
  latitude: null,
  longitude: null,
  customPrayerTimes: { Fajr: null, Dhuhr: null, Asr: null, Maghrib: null, Isha: null },
  hijriAdjustment: -1,
  backgroundTheme: 'default',
  customBackground: '',
  accentColor: '#71a8ff',
  glassBlur: 22,
  wordChangeInterval: 'hourly',
  quickLinks: [
    { id: '1', name: 'Quran.com', url: 'https://quran.com', useFavicon: true },
    { id: '2', name: 'Sunnah.com', url: 'https://sunnah.com', useFavicon: true },
    { id: '3', name: 'YouTube', url: 'https://youtube.com', useFavicon: true },
    { id: '4', name: 'GitHub', url: 'https://github.com', useFavicon: true }
  ],
  quranDailyGoal: 5,
  dhikrTarget: 33,
  customDhikrName: 'Astaghfirullah',
  customEvents: [],
  dailyActions: [
    { id: 'quran-mushaf', name: 'Quran Mushaf', bnName: 'কুরআন মুশাফ', icon: '📖' },
    { id: 'hadith', name: 'Hadith', bnName: 'হাদিস', icon: '🤲' },
    { id: 'dua', name: 'Dua', bnName: 'দোয়া', icon: '🕊️' },
    { id: 'dhikr', name: 'Dhikr', bnName: 'যিকির', icon: '📿' }
  ],
  toolOrder: ['prayer-times', 'salah', 'salah-stats', 'calendar', 'fasting', 'quran-goal', 'ramadan', 'focus', 'dhikr', 'tasks']
};

const hasChromeStorage = () => typeof chrome !== 'undefined' && Boolean(chrome.storage?.local);

export async function getStored<T>(key: string, fallback: T): Promise<T> {
  if (hasChromeStorage()) {
    return new Promise((resolve) => chrome.storage.local.get([key], (result) => resolve((result[key] as T) ?? fallback)));
  }
  const raw = localStorage.getItem(key);
  try { return raw ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; }
}

export async function setStored<T>(key: string, value: T): Promise<void> {
  if (hasChromeStorage()) return new Promise((resolve) => chrome.storage.local.set({ [key]: value }, resolve));
  localStorage.setItem(key, JSON.stringify(value));
}

export async function removeStored(key: string): Promise<void> {
  if (hasChromeStorage()) return new Promise((resolve) => chrome.storage.local.remove(key, resolve));
  localStorage.removeItem(key);
}

export async function clearAllStored(): Promise<void> {
  if (hasChromeStorage()) return new Promise((resolve) => chrome.storage.local.clear(resolve));
  localStorage.clear();
}

export async function exportAllStored(): Promise<Record<string, unknown>> {
  if (hasChromeStorage()) return new Promise((resolve) => chrome.storage.local.get(null, resolve));
  return Object.fromEntries(Object.keys(localStorage).map((key) => {
    const raw = localStorage.getItem(key);
    try { return [key, raw ? JSON.parse(raw) : null]; } catch { return [key, raw]; }
  }));
}

export async function importAllStored(data: Record<string, unknown>): Promise<void> {
  if (hasChromeStorage()) return new Promise((resolve) => chrome.storage.local.set(data, resolve));
  Object.entries(data).forEach(([key, value]) => localStorage.setItem(key, JSON.stringify(value)));
}

export function mergeSettings(stored?: Partial<Settings> | null): Settings {
  const merged = { ...defaultSettings, ...(stored ?? {}) };
  merged.customPrayerTimes = { ...defaultSettings.customPrayerTimes, ...(stored?.customPrayerTimes ?? {}) };
  merged.prayerNotifications = { ...defaultSettings.prayerNotifications };
  prayers.forEach((name) => {
    merged.prayerNotifications[name] = {
      ...defaultSettings.prayerNotifications[name],
      ...(stored?.prayerNotifications?.[name] ?? {}),
      beforeMinutes: stored?.prayerNotifications?.[name]?.beforeMinutes ?? stored?.notificationMinutes ?? 10
    };
  });
  merged.quickLinks = (stored?.quickLinks ?? defaultSettings.quickLinks).map(({ category: _category, ...link }) => link);
  return merged;
}
