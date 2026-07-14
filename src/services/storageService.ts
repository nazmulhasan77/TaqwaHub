import type { Settings, BackgroundTheme } from '../types';

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
  showQuran: true,
  showHadith: true,
  showDua: true,
  showProductivity: true,
  autoLocationEnabled: false,
  latitude: null,
  longitude: null,
  customPrayerTimes: {
    Fajr: null,
    Dhuhr: null,
    Asr: null,
    Maghrib: null,
    Isha: null
  },
  hijriAdjustment: -1,
  backgroundTheme: 'default',
  wordChangeInterval: 'hourly',
  quickLinks: [
    { id: '1', name: 'Quran.com', url: 'https://quran.com', useFavicon: true },
    { id: '2', name: 'Sunnah.com', url: 'https://sunnah.com', useFavicon: true },
    { id: '3', name: 'YouTube', url: 'https://youtube.com', useFavicon: true },
    { id: '4', name: 'GitHub', url: 'https://github.com', useFavicon: true }
  ]
};

const hasChromeStorage = () => typeof chrome !== 'undefined' && Boolean(chrome.storage?.local);

export async function getStored<T>(key: string, fallback: T): Promise<T> {
  if (hasChromeStorage()) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => resolve((result[key] as T) ?? fallback));
    });
  }
  const raw = localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : fallback;
}

export async function setStored<T>(key: string, value: T): Promise<void> {
  if (hasChromeStorage()) {
    return new Promise((resolve) => chrome.storage.local.set({ [key]: value }, resolve));
  }
  localStorage.setItem(key, JSON.stringify(value));
}

export async function removeStored(key: string): Promise<void> {
  if (hasChromeStorage()) {
    return new Promise((resolve) => chrome.storage.local.remove(key, resolve));
  }
  localStorage.removeItem(key);
}

export async function clearAllStored(): Promise<void> {
  if (hasChromeStorage()) {
    return new Promise((resolve) => chrome.storage.local.clear(resolve));
  }
  localStorage.clear();
}
