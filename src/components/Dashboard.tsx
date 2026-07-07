import { getAsmaNameForKey } from '../data/asmaulHusna';
import { prayerLabels } from '../data/translations';
import { getUpcomingIslamicEvent } from '../services/eventService';
import type { Language, PrayerTimes } from '../types';
import { dayPart, secondsToClock, formatTime12h } from '../utils/dateUtils';
import {
  formatPrayerWindowTime,
  getCurrentSalahPeriod,
  getForbiddenPrayerWindows,
  getNextPrayer,
  getPrayerProgress,
  prayerOrder
} from '../utils/prayerUtils';

interface Props {
  now: Date;
  language: Language;
  prayerTimes: PrayerTimes;
  contentChangeKey: string;
}

export default function Dashboard({ now, language, prayerTimes, contentChangeKey }: Props) {
  const hijri = prayerTimes.hijri;
  const event = getUpcomingIslamicEvent(hijri, language);
  const asmaName = getAsmaNameForKey(contentChangeKey);
  const { current, at, status } = getCurrentSalahPeriod(prayerTimes, now);
  const next = getNextPrayer(prayerTimes, now);
  const forbiddenWindows = getForbiddenPrayerWindows(prayerTimes, now);
  const countdown = secondsToClock((at.getTime() - now.getTime()) / 1000);
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(now);

  return (
    <section className="salah-hero glass">
      <div className="salah-top">
        <div className="hijri-block">
          <strong>{hijri.day} {hijri.month}</strong>
          <strong>{hijri.year} AH</strong>
          <strong>{weekday} {dayPart(now)}</strong>
        </div>
        <div className="time-block">
          <div className="hourly-asma" aria-label="Hourly name of Allah">
            <strong lang="ar" dir="rtl">{asmaName.arabic}</strong>
            <span lang="bn">{asmaName.bangla}</span>
            <em>{asmaName.english}</em>
          </div>
        </div>
        <div className="event-block">
          <strong>{event.label}</strong>
          <span>{event.days === 0 ? (language === 'bn' ? 'আজ' : 'today') : language === 'bn' ? `${event.days} দিন` : `in ${event.days} days`}</span>
        </div>
      </div>

      <div className="next-prayer-band">
        <div className="sun-pill">
          <span>🌅 SUNRISE</span>
          <strong>{formatTime12h(prayerTimes.timings.Sunrise)}</strong>
        </div>
        <div className="next-prayer-main">
          <span>Next Prayer</span>
          <h2>{prayerLabels[current][language]} {status}</h2>
          <strong>{countdown}</strong>
        </div>
        <div className="sun-pill right">
          <span>🌇 SUNSET</span>
          <strong>{formatTime12h(prayerTimes.timings.Sunset)}</strong>
        </div>
      </div>

      <div className="forbidden-times">
        <span>{language === 'bn' ? 'নিষিদ্ধ সময়' : 'Forbidden Times'}</span>
        <div>
          {forbiddenWindows.map((window) => (
            <small key={window.id} className={window.active ? 'active' : ''}>
              <strong>{window.label[language]}</strong>
              {formatPrayerWindowTime(window.startsAt)} - {formatPrayerWindowTime(window.endsAt)}
            </small>
          ))}
        </div>
      </div>

      <div className="prayer-strip">
        {prayerOrder.map((name) => {
          const progress = getPrayerProgress(prayerTimes, name, now);
          return (
            <div key={name} className={current === name ? 'prayer-chip active' : 'prayer-chip'}>
              <div className="prayer-chip-content">
                <span>{prayerLabels[name][language]}</span>
                <strong>{formatTime12h(prayerTimes.timings[name])}</strong>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
