import type { Language, PrayerTimes } from '../types';
import { prayerLabels } from '../data/translations';
import { secondsToClock } from '../utils/dateUtils';
import { getNextPrayer } from '../utils/prayerUtils';
import { t } from '../utils/languageUtils';

interface Props {
  prayerTimes: PrayerTimes;
  now: Date;
  language: Language;
}

export default function NextPrayerCountdown({ prayerTimes, now, language }: Props) {
  const next = getNextPrayer(prayerTimes, now);
  const seconds = (next.at.getTime() - now.getTime()) / 1000;
  return (
    <section className="hero-prayer glass">
      <span>{t(language, 'nextPrayer')}</span>
      <h1>{prayerLabels[next.name][language]}</h1>
      <strong>{secondsToClock(seconds)}</strong>
      <small>{next.at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
    </section>
  );
}
