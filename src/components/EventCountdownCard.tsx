import type { Language, PrayerTimes } from '../types';
import { getAyyamReminder, getUpcomingIslamicEvent } from '../services/eventService';

interface Props {
  prayerTimes: PrayerTimes;
  language: Language;
}

export default function EventCountdownCard({ prayerTimes, language }: Props) {
  const event = getUpcomingIslamicEvent(prayerTimes.hijri, language);
  const ayyam = getAyyamReminder(prayerTimes.hijri, language);
  const suffix = language === 'bn' ? 'দিন বাকি' : event.days === 0 ? 'today' : `in ${event.days} days`;
  return (
    <section className="glass card compact">
      <div className="section-title"><span>🌙 {language === 'bn' ? 'ইসলামিক ইভেন্ট' : 'Islamic Event'}</span></div>
      <h3>{event.label}</h3>
      <p>{event.days === 0 ? (language === 'bn' ? 'আজ' : suffix) : language === 'bn' ? `${event.days} ${suffix}` : suffix}</p>
      {ayyam && <p className="notice">{ayyam}</p>}
    </section>
  );
}
