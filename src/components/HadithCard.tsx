import type { Hadith, Language } from '../types';
import { t } from '../utils/languageUtils';

interface Props {
  hadith: Hadith;
  language: Language;
  onRandom: () => void;
  onFavorite: () => void;
}

export default function HadithCard({ hadith, language, onRandom, onFavorite }: Props) {
  const text = language === 'bn' ? hadith.bangla : hadith.english;
  return (
    <section className="glass card quote-card compact-quote">
      <div className="section-title">
        <span>{t(language, 'dailyHadith')}</span>
        <div className="actions">
          <button onClick={onRandom}>{t(language, 'random')}</button>
          <button onClick={() => navigator.clipboard?.writeText(`${text}\n${hadith.source}`)}>{t(language, 'copy')}</button>
          <button onClick={onFavorite}>{t(language, 'favorite')}</button>
        </div>
      </div>
      <p>{text}</p>
      <small>{hadith.source}</small>
    </section>
  );
}
