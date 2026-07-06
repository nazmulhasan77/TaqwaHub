export type Language = 'en' | 'bn';
export type PrayerName = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export interface Settings {
  city: string;
  country: string;
  method: number;
  language: Language;
  timeFormat: '12h' | '24h';
  clockMode: 'analog' | 'digital';
  notificationsEnabled: boolean;
  notificationMinutes: number;
  showQuran: boolean;
  showHadith: boolean;
  showProductivity: boolean;
}

export interface HijriDate {
  day: number;
  month: string;
  monthNumber: number;
  year: number;
}

export interface PrayerTimes {
  dateKey: string;
  city: string;
  country: string;
  method: number;
  timings: Record<PrayerName | 'Sunrise' | 'Sunset', string>;
  hijri: HijriDate;
  gregorianDate: string;
  source: 'api' | 'cache';
}

export interface QuranAyah {
  id: string;
  arabic: string;
  english: string;
  bangla: string;
  surah: string;
  ayah: number;
}

export interface Hadith {
  id: string;
  arabic?: string;
  english: string;
  bangla: string;
  source: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface IslamicEvent {
  id: string;
  name: string;
  bnName: string;
  month: number;
  day: number;
  type?: 'single' | 'range';
  endDay?: number;
}
