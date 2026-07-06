import { prayerLabels } from '../data/translations';
import { getUpcomingIslamicEvent } from '../services/eventService';
import type { Language, PrayerTimes } from '../types';
import { dayPart, secondsToClock } from '../utils/dateUtils';
import { getCurrentOrNextPrayer, getNextPrayer, prayerOrder } from '../utils/prayerUtils';

interface Props {
  now: Date;
  language: Language;
  timeFormat: '12h' | '24h';
  prayerTimes: PrayerTimes;
}

export default function Dashboard({ now, language, timeFormat, prayerTimes }: Props) {
  const hijri = prayerTimes.hijri;
  const event = getUpcomingIslamicEvent(hijri, language);
  const { current } = getCurrentOrNextPrayer(prayerTimes, now);
  const next = getNextPrayer(prayerTimes, now);
  const countdown = secondsToClock((next.at.getTime() - now.getTime()) / 1000);
  const date = new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).format(now);
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(now);
  const clock = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: timeFormat === '12h'
  }).format(now).replace(/\s?(AM|PM)$/i, '');
  const period = timeFormat === '12h'
    ? new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: true })
      .formatToParts(now)
      .find((part) => part.type === 'dayPeriod')?.value
    : '';

  return (
    <section className="salah-hero glass">
      <div className="salah-top">
        <div className="hijri-block">
          <strong>{hijri.day} {hijri.month}</strong>
          <strong>{hijri.year} AH</strong>
          <strong>{weekday} {dayPart(now)}</strong>
        </div>
        <div className="time-block">
          <span>{date}</span>
          <strong>{clock}</strong>
          {period && <em>{period}</em>}
        </div>
        <div className="event-block">
          <strong>{event.label}</strong>
          <span>{event.days === 0 ? (language === 'bn' ? 'আজ' : 'today') : language === 'bn' ? `${event.days} দিন` : `in ${event.days} days`}</span>
        </div>
      </div>

      <div className="next-prayer-band">
        <div className="sun-pill">
          <span>🌅 SUNRISE</span>
          <strong>{prayerTimes.timings.Sunrise}</strong>
        </div>
        <div className="next-prayer-main">
          <span>Next Prayer</span>
          <h2>{prayerLabels[current][language]} Ends</h2>
          <strong>{countdown}</strong>
        </div>
        <div className="sun-pill right">
          <span>🌇 SUNSET</span>
          <strong>{prayerTimes.timings.Sunset}</strong>
        </div>
      </div>

      <div className="prayer-strip">
        {prayerOrder.map((name) => (
          <div key={name} className={next.name === name ? 'prayer-chip active' : 'prayer-chip'}>
            <span>{prayerLabels[name][language]}</span>
            <strong>{prayerTimes.timings[name]}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
