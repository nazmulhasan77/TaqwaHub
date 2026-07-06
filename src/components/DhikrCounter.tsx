import type { Language } from '../types';
import { t } from '../utils/languageUtils';

interface Props {
  language: Language;
  counts: Record<string, number>;
  onCounts: (counts: Record<string, number>) => void;
}

const presets = ['SubhanAllah', 'Alhamdulillah', 'Allahu Akbar'];

export default function DhikrCounter({ language, counts, onCounts }: Props) {
  const keys = [...presets, 'Custom Dhikr'];
  return (
    <section className="glass card">
      <div className="section-title"><span>🤲 {t(language, 'dhikr')}</span></div>
      <div className="dhikr-grid">
        {keys.map((key) => (
          <div key={key} className="dhikr-item">
            <span>{key}</span>
            <strong>{counts[key] ?? 0}</strong>
            <div className="actions">
              <button onClick={() => onCounts({ ...counts, [key]: (counts[key] ?? 0) + 1 })}>+</button>
              <button onClick={() => onCounts({ ...counts, [key]: 0 })}>{t(language, 'reset')}</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
