import type { Language } from '../types';
import { t } from '../utils/languageUtils';
interface Props { language: Language; counts: Record<string, number>; onCounts: (counts: Record<string, number>) => void; target: number; customName: string; }
export default function DhikrCounter({ language, counts, onCounts, target, customName }: Props) {
  const keys = ['SubhanAllah', 'Alhamdulillah', 'Allahu Akbar', customName || 'Astaghfirullah'];
  return <section className="glass card"><div className="section-title"><span>🤲 {t(language, 'dhikr')}</span><em>{language === 'bn' ? `লক্ষ্য ${target}` : `Target ${target}`}</em></div><div className="dhikr-grid">{keys.map((key) => { const count=counts[key]??0; return <div key={key} className={`dhikr-item ${count >= target ? 'completed' : ''}`}><span>{key}</span><strong>{count}/{target}</strong><div className="goal-progress"><span style={{width:`${Math.min(100,count/Math.max(1,target)*100)}%`}} /></div><div className="actions"><button onClick={() => onCounts({ ...counts, [key]: count + 1 })}>+</button><button onClick={() => onCounts({ ...counts, [key]: 0 })}>{t(language, 'reset')}</button></div></div>;})}</div></section>;
}
