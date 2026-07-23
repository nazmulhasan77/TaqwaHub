import type { CustomIslamicEvent, HijriDate, Language } from '../types';
import { islamicEvents } from '../data/islamicEvents';

interface Props { hijri: HijriDate; language: Language; customEvents: CustomIslamicEvent[]; }

export default function IslamicCalendar({ hijri, language, customEvents }: Props) {
  const events = [...islamicEvents, ...customEvents].filter((event) => event.month === hijri.monthNumber);
  const eventFor = (day: number) => {
    if (day >= 13 && day <= 15) return language === 'bn' ? 'আইয়ামে বীজ' : 'Ayyam al-Bid';
    const event = events.find((item) => item.day === day);
    return event ? (language === 'bn' ? event.bnName : event.name) : '';
  };
  return (
    <section className="glass card feature-card">
      <div className="section-title"><span>🗓 {language === 'bn' ? 'হিজরি ক্যালেন্ডার' : 'Islamic Calendar'}</span><em>{hijri.month} {hijri.year}</em></div>
      <div className="hijri-calendar-grid">
        {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
          const event = eventFor(day);
          return <div key={day} title={event} className={`hijri-day ${day === hijri.day ? 'today' : ''} ${event ? 'event' : ''}`}><strong>{day}</strong>{event && <small>{event}</small>}</div>;
        })}
      </div>
      <p className="notice">{language === 'bn' ? '১৩–১৫ তারিখ আইয়ামে বীজ হিসেবে চিহ্নিত। স্থানীয় চাঁদ দেখার কারণে তারিখ ভিন্ন হতে পারে।' : 'Days 13–15 are marked as Ayyam al-Bid. Dates may vary with local moon sighting.'}</p>
    </section>
  );
}
