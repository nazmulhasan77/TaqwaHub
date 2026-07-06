import type { Language, PrayerName } from '../types';
import { prayerLabels } from '../data/translations';
import { prayerOrder } from '../utils/prayerUtils';
import { t } from '../utils/languageUtils';

interface Props {
  language: Language;
  completed: PrayerName[];
  onToggle: (name: PrayerName) => void;
}

export default function SalahTracker({ language, completed, onToggle }: Props) {
  return (
    <section className="glass card">
      <div className="section-title"><span>✅ {t(language, 'salahProgress')}: {completed.length}/5</span></div>
      <div className="check-grid">
        {prayerOrder.map((name) => (
          <label key={name}>
            <input type="checkbox" checked={completed.includes(name)} onChange={() => onToggle(name)} />
            {prayerLabels[name][language]}
          </label>
        ))}
      </div>
    </section>
  );
}
