import type { Language, QuranAyah } from '../types';

interface Props {
  ayah: QuranAyah;
  language: Language;
}

export default function QuranCard({ ayah, language }: Props) {
  const translation = language === 'bn' ? ayah.bangla : ayah.english;

  return (
    <section className="glass card quote-card compact-quote">
      <div className="section-title">
        <span>📖 Ayah of the Day <small>{ayah.surah} ({ayah.id})</small></span>
      </div>
      <p>{translation}</p>
    </section>
  );
}
