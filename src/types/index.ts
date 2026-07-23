export type Language = 'en' | 'bn';
export type PrayerName = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
export type BackgroundTheme = 'default' | 'ocean' | 'forest' | 'sunset' | 'midnight';
export type WordChangeInterval = 'daily' | '12h' | '6h' | '3h' | 'hourly';
export type Madhab = 'hanafi' | 'shafi';

export interface QuickLink {
  id: string;
  name: string;
  url: string;
  icon?: string;
  useFavicon?: boolean;
  category?: string;
}

export interface PrayerNotificationSetting {
  enabled: boolean;
  beforeMinutes: number;
  atTime: boolean;
}

export interface CustomIslamicEvent {
  id: string;
  name: string;
  bnName: string;
  month: number;
  day: number;
  reminderEnabled: boolean;
}

export interface DailyActionDefinition {
  id: string;
  name: string;
  bnName: string;
  icon: string;
}

export interface Settings {
  city: string;
  country: string;
  method: number;
  madhab: Madhab;
  language: Language;
  timeFormat: '12h' | '24h';
  clockMode: 'analog' | 'digital';
  notificationsEnabled: boolean;
  notificationMinutes: number;
  prayerNotifications: Record<PrayerName, PrayerNotificationSetting>;
  hourlyRemindersEnabled: boolean;
  showQuran: boolean;
  showHadith: boolean;
  showDua: boolean;
  showProductivity: boolean;
  showIslamicCalendar: boolean;
  showFastingTracker: boolean;
  showSalahStats: boolean;
  showQuranGoal: boolean;
  showRamadanMode: boolean;
  autoLocationEnabled: boolean;
  latitude: number | null;
  longitude: number | null;
  customPrayerTimes: Record<PrayerName, string | null>;
  hijriAdjustment: number;
  backgroundTheme: BackgroundTheme;
  customBackground: string;
  accentColor: string;
  glassBlur: number;
  wordChangeInterval: WordChangeInterval;
  quickLinks: QuickLink[];
  quranDailyGoal: number;
  dhikrTarget: number;
  customDhikrName: string;
  customEvents: CustomIslamicEvent[];
  dailyActions: DailyActionDefinition[];
  toolOrder: string[];
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

export interface Dua {
  id: string;
  arabic: string;
  english: string;
  bangla: string;
  category: string;
  reference: string;
}
