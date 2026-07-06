import type { Language, PrayerName } from '../types';

export const prayerLabels: Record<PrayerName | 'Sunrise' | 'Sunset', Record<Language, string>> = {
  Fajr: { en: 'Fajr', bn: 'ফজর' },
  Dhuhr: { en: 'Dhuhr', bn: 'যোহর' },
  Asr: { en: 'Asr', bn: 'আসর' },
  Maghrib: { en: 'Maghrib', bn: 'মাগরিব' },
  Isha: { en: 'Isha', bn: 'এশা' },
  Sunrise: { en: 'Sunrise', bn: 'সূর্যোদয়' },
  Sunset: { en: 'Sunset', bn: 'সূর্যাস্ত' }
};

export const labels = {
  en: {
    nextPrayer: 'Next Prayer',
    dailyQuran: 'Hourly Quran Ayah',
    dailyHadith: 'Hourly Hadith',
    salahProgress: "Today’s Salah Progress",
    tasks: "Today’s Focus Tasks",
    note: 'Quick Note',
    settings: 'Settings',
    reset: 'Reset',
    start: 'Start',
    pause: 'Pause',
    save: 'Save',
    dhikr: 'Dhikr Counter',
    focus: 'Barakah Focus Timer'
  },
  bn: {
    nextPrayer: 'পরবর্তী নামাজ',
    dailyQuran: 'প্রতি ঘণ্টার কুরআন আয়াত',
    dailyHadith: 'প্রতি ঘণ্টার হাদিস',
    salahProgress: 'আজকের নামাজ অগ্রগতি',
    tasks: 'আজকের ফোকাস কাজ',
    note: 'দ্রুত নোট',
    settings: 'সেটিংস',
    reset: 'রিসেট',
    start: 'শুরু',
    pause: 'বিরতি',
    save: 'সংরক্ষণ',
    dhikr: 'জিকির কাউন্টার',
    focus: 'বারাকাহ ফোকাস টাইমার'
  }
};
