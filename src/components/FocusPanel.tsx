import { prayerLabels } from '../data/translations';
import type { Hadith, Language, PrayerName } from '../types';
import { prayerOrder } from '../utils/prayerUtils';

interface Props {
  hadith: Hadith;
  language: Language;
  completed: PrayerName[];
  onToggle: (name: PrayerName) => void;
}

export default function FocusPanel({ hadith, language, completed, onToggle }: Props) {
  const text = language === 'bn' ? hadith.bangla : hadith.english;
  return (
    <section className="focus-panel glass">
      <div className="daily-focus">
        <strong>Daily Focus</strong>
        <p>“{text}”</p>
        <small>{hadith.source}</small>
      </div>
      <div className="tracker-line" />
      <strong>Prayer Tracker</strong>
      <div className="tracker-row">
        {prayerOrder.map((name) => (
          <button
            key={name}
            className={completed.includes(name) ? 'tracker-dot done-dot' : 'tracker-dot'}
            onClick={() => onToggle(name)}
          >
            {completed.includes(name) ? '✓' : ''}
            <span>{prayerLabels[name][language]}</span>
          </button>
        ))}
      </div>
      <p className="tracker-count">{completed.length} / 5 prayers completed</p>
    </section>
  );
}
