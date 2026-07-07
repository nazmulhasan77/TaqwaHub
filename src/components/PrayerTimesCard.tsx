import type { Language, PrayerTimes } from '../types';
import { prayerLabels } from '../data/translations';
import { getCurrentOrNextPrayer, prayerOrder } from '../utils/prayerUtils';
import { formatTime12h } from '../utils/dateUtils';

interface Props {
  prayerTimes: PrayerTimes;
  now: Date;
  language: Language;
}

export default function PrayerTimesCard({ prayerTimes, now, language }: Props) {
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
            <strong>{formatTime12h(prayerTimes.timings[name])}</strong>
          </div>
        ))}
      </div>
      <div className="sun-grid">
        <div><span>🌅 {prayerLabels.Sunrise[language]}</span><strong>{formatTime12h(prayerTimes.timings.Sunrise)}</strong></div>
        <div><span>🌇 {prayerLabels.Sunset[language]}</span><strong>{formatTime12h(prayerTimes.timings.Sunset)}</strong></div>
      </div>
    </section>
  );
}
