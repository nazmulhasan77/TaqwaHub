import type { Language, PrayerTimes, Settings } from '../types';
import { prayerLabels } from '../data/translations';
import { getCurrentOrNextPrayer, prayerOrder } from '../utils/prayerUtils';
import { formatTime } from '../utils/dateUtils';

interface Props {
  prayerTimes: PrayerTimes;
  now: Date;
  language: Language;
  timeFormat: Settings['timeFormat'];
}

export default function PrayerTimesCard({ prayerTimes, now, language, timeFormat }: Props) {
  const { next } = getCurrentOrNextPrayer(prayerTimes, now);
  return (
    <section className="glass card">
      <div className="section-title">
        <span>🕌 Salah</span>
        {prayerTimes.source === 'cache' && <em>Cached</em>}
      </div>
      <div className="prayer-list">
        {prayerOrder.map((name) => (
          <div key={name} className={`prayer-row ${next.name === name ? 'next' : ''}`}>
            <span>{prayerLabels[name][language]}</span>
            <strong>{formatTime(prayerTimes.timings[name], timeFormat)}</strong>
          </div>
        ))}
      </div>
      <div className="sun-grid">
        <div><span>🌅 {prayerLabels.Sunrise[language]}</span><strong>{formatTime(prayerTimes.timings.Sunrise, timeFormat)}</strong></div>
        <div><span>🌇 {prayerLabels.Sunset[language]}</span><strong>{formatTime(prayerTimes.timings.Sunset, timeFormat)}</strong></div>
      </div>
    </section>
  );
}
