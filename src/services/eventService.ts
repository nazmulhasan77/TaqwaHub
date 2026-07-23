import { islamicEvents } from '../data/islamicEvents';
import type { HijriDate, Language, CustomIslamicEvent } from '../types';

function approxDayOfYear(month: number, day: number) {
  return Math.round((month - 1) * 29.5 + day);
}

function isAyyamAlBidDay(day: number): boolean {
  return day >= 13 && day <= 15;
}

function getAyyamAlBidEvent(hijri: HijriDate, language: Language) {
  const active = isAyyamAlBidDay(hijri.day);
  const dayNumber = active ? hijri.day - 12 : null;
  const bnDayName = dayNumber === 1
    ? 'প্রথম'
    : dayNumber === 2
      ? 'দ্বিতীয়'
      : 'তৃতীয়';

  const name = active
    ? `Ayyam al-Bid — Day ${dayNumber}`
    : 'Ayyam al-Bid';
  const bnName = active
    ? `আইয়ামে বীজ — ${bnDayName} দিন`
    : 'আইয়ামে বীজ';

  return {
    id: 'aiyame-bij',
    name,
    bnName,
    month: hijri.monthNumber,
    day: 13,
    type: 'range' as const,
    endDay: 15,
    days: active ? 0 : Math.max(0, 13 - hijri.day),
    label: language === 'bn' ? bnName : name
  };
}

function getFixedEvents(hijri: HijriDate, language: Language, customEvents: CustomIslamicEvent[] = []) {
  const today = approxDayOfYear(hijri.monthNumber, hijri.day);

  return [...islamicEvents, ...customEvents].map((event) => {
    let days = approxDayOfYear(event.month, event.day) - today;
    if (days < 0) days += 354;

    return {
      ...event,
      days,
      label: language === 'bn' ? event.bnName : event.name
    };
  });
}

export function getUpcomingIslamicEvent(hijri: HijriDate, language: Language, customEvents: CustomIslamicEvent[] = []) {
  const fixedEvents = getFixedEvents(hijri, language, customEvents);

  // 13, 14 and 15: always show only Ayyam al-Bid,
  // even when another Islamic event shares one of these dates.
  if (isAyyamAlBidDay(hijri.day)) {
    return getAyyamAlBidEvent(hijri, language);
  }

  // 1 through 12: Ayyam al-Bid is the default upcoming event.
  // A fixed event can replace it only when that event is today or occurs
  // before Ayyam al-Bid starts (before the 13th of the current Hijri month).
  if (hijri.day >= 1 && hijri.day <= 12) {
    const eventBeforeAyyam = fixedEvents
      .filter((event) => (
        event.month === hijri.monthNumber
        && event.day >= hijri.day
        && event.day < 13
      ))
      .sort((a, b) => a.days - b.days)[0];

    return eventBeforeAyyam ?? getAyyamAlBidEvent(hijri, language);
  }

  // After the 15th, do not show the next month's Ayyam al-Bid.
  // Show the nearest regular Islamic event instead.
  return fixedEvents.sort((a, b) => a.days - b.days)[0];
}

export function getAyyamReminder(hijri: HijriDate, language: Language): string | null {
  const d = hijri.day;
  if (!isAyyamAlBidDay(d)) return null;

  if (d === 15) {
    return language === 'bn'
      ? 'আজ আইয়ামে বীজের শেষ দিন।'
      : 'Today is the last day of Ayyam al-Bid.';
  }

  const dayNumber = d - 12;
  const bnDayName = dayNumber === 1 ? 'প্রথম' : 'দ্বিতীয়';
  return language === 'bn'
    ? `আজ আইয়ামে বীজের ${bnDayName} দিন।`
    : `Today is Day ${dayNumber} of Ayyam al-Bid.`;
}
