import type { Language } from '../types';
interface Props { language: Language; progress: number; goal: number; onChange: (value: number) => void; }
export default function QuranGoalTracker({ language, progress, goal, onChange }: Props) {
  const percent = Math.min(100, Math.round(progress / Math.max(1, goal) * 100));
  return <section className="glass card feature-card">
    <div className="section-title"><span>📖 {language === 'bn' ? 'দৈনিক কুরআন লক্ষ্য' : 'Daily Quran Goal'}</span><em>{progress}/{goal}</em></div>
    <div className="goal-progress"><span style={{ width: `${percent}%` }} /></div>
    <div className="actions"><button onClick={() => onChange(Math.max(0, progress - 1))}>−</button><button className="primary" onClick={() => onChange(progress + 1)}>+ {language === 'bn' ? 'পৃষ্ঠা' : 'page'}</button><button onClick={() => onChange(0)}>Reset</button></div>
  </section>;
}
