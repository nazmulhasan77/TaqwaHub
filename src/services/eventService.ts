import { islamicEvents } from '../data/islamicEvents';
import type { HijriDate, Language } from '../types';

function approxDayOfYear(month: number, day: number) {
  return Math.round((month - 1) * 29.5 + day);
}

export function getUpcomingIslamicEvent(hijri: HijriDate, language: Language) {
  const today = approxDayOfYear(hijri.monthNumber, hijri.day);
  const events = islamicEvents
    .map((event) => {
      let days = approxDayOfYear(event.month, event.day) - today;
      if (days < 0) days += 354;
      return { ...event, days, label: language === 'bn' ? event.bnName : event.name };
    })
    .sort((a, b) => a.days - b.days);
  return events[0];
}

export function getAyyamReminder(hijri: HijriDate, language: Language): string | null {
  const d = hijri.day;
  if ([13, 14, 15].includes(d)) {
    return language === 'bn' ? 'আজ আইয়ামে বীজ রোজার দিন।' : 'Today is Ayyam al-Bid fasting day.';
  }
  if (d === 12) return language === 'bn' ? 'আগামীকাল আইয়ামে বীজ শুরু।' : 'Ayyam al-Bid starts tomorrow.';
  if (d >= 10 && d <= 12) return language === 'bn' ? 'আইয়ামে বীজ শীঘ্রই আসছে।' : 'Ayyam al-Bid is coming soon.';
  return null;
}
