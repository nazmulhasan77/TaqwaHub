import type { Language } from '../types';
interface Props { language: Language; history: number[]; }
export default function SalahStats({ language, history }: Props) {
  const total = history.reduce((a, b) => a + b, 0);
  const percent = Math.round(total / Math.max(1, history.length * 5) * 100);
  return <section className="glass card feature-card">
    <div className="section-title"><span>📊 {language === 'bn' ? 'সালাত পরিসংখ্যান' : 'Salah Statistics'}</span><em>{percent}%</em></div>
    <div className="salah-bars">{history.map((count, index) => <div key={index} title={`${count}/5`}><span style={{ height: `${Math.max(8, count * 18)}%` }} /><small>{index === history.length - 1 ? (language === 'bn' ? 'আজ' : 'Now') : `${history.length - 1 - index}d`}</small></div>)}</div>
    <p>{language === 'bn' ? `গত ৭ দিনে ${total}/${history.length * 5} ওয়াক্ত সম্পন্ন।` : `${total}/${history.length * 5} prayers completed in the last 7 days.`}</p>
  </section>;
}
