import type { Language, PrayerTimes } from '../types';
import { getNextPrayer, parsePrayerTime } from '../utils/prayerUtils';
import { secondsToClock } from '../utils/dateUtils';
interface Props { language: Language; prayerTimes: PrayerTimes; now: Date; taraweeh: boolean; onTaraweeh: () => void; }
export default function RamadanMode({ language, prayerTimes, now, taraweeh, onTaraweeh }: Props) {
  if (prayerTimes.hijri.monthNumber !== 9) return null;
  const maghrib = parsePrayerTime(prayerTimes.timings.Maghrib, now);
  const fajr = parsePrayerTime(prayerTimes.timings.Fajr, now);
  const target = now < fajr ? fajr : now < maghrib ? maghrib : getNextPrayer(prayerTimes, now).at;
  const label = now < fajr ? (language === 'bn' ? 'সেহরি শেষ হতে' : 'Sehri ends in') : now < maghrib ? (language === 'bn' ? 'ইফতার হতে' : 'Iftar in') : (language === 'bn' ? 'পরবর্তী সালাত' : 'Next salah');
  return <section className="glass card feature-card ramadan-card"><div className="section-title"><span>🌙 Ramadan Day {prayerTimes.hijri.day}</span></div><div className="ramadan-countdown"><span>{label}</span><strong>{secondsToClock((target.getTime()-now.getTime())/1000)}</strong></div><button className={`big-toggle ${taraweeh ? 'active' : ''}`} onClick={onTaraweeh}>{taraweeh ? '✓ ' : ''}{language === 'bn' ? 'তারাবিহ সম্পন্ন' : 'Taraweeh completed'}</button></section>;
}
