import type { HijriDate, Language } from '../types';
interface Props { language: Language; hijri: HijriDate; fasting: boolean; onToggle: () => void; monthCount: number; yearCount: number; }
export default function FastingTracker({ language, hijri, fasting, onToggle, monthCount, yearCount }: Props) {
  const isAyyam = hijri.day >= 13 && hijri.day <= 15;
  return <section className="glass card feature-card">
    <div className="section-title"><span>🌙 {language === 'bn' ? 'নফল রোজা ট্র্যাকার' : 'Fasting Tracker'}</span></div>
    {isAyyam && <p className="highlight-note">{language === 'bn' ? `আজ আইয়ামে বীজের ${hijri.day - 12}ম দিন।` : `Today is Ayyam al-Bid day ${hijri.day - 12}.`}</p>}
    <button className={`big-toggle ${fasting ? 'active' : ''}`} onClick={onToggle}>{fasting ? '✓ ' : ''}{language === 'bn' ? 'আজ রোজা রেখেছি' : 'I am fasting today'}</button>
    <div className="mini-stats"><span>{language === 'bn' ? 'এই মাসে' : 'This month'}<strong>{monthCount}</strong></span><span>{language === 'bn' ? 'এই বছরে' : 'This year'}<strong>{yearCount}</strong></span></div>
  </section>;
}
