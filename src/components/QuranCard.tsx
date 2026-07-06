import type { Language, QuranAyah } from '../types';

interface Props {
  ayah: QuranAyah;
  language: Language;
  onRandom: () => void;
  onFavorite: () => void;
}

export default function QuranCard({ ayah, language, onRandom, onFavorite }: Props) {
  const translation = language === 'bn' ? ayah.bangla : ayah.english;

  return (
    <section className="glass card quote-card ayah-card">
      <div className="section-title">
        <span>📖 Ayah of the Day <small>{ayah.surah} ({ayah.id})</small></span>
        <div className="actions">
          <span className="language-pill">বাংলা / English</span>
          <button onClick={onRandom}>↻</button>
          <button onClick={onFavorite}>♡</button>
        </div>
      </div>
      <p className="arabic">{ayah.arabic}</p>
      <p>{translation}</p>
    </section>
  );
}
