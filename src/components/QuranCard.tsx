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
        <span>Ayat</span>
      </div>
      <p>{translation}</p>
      <p style={{ marginTop: '10px', color: 'rgba(238, 245, 255, 0.62)', fontSize: '0.85rem' }}>
        {ayah.surah} ({ayah.id})
      </p>
    </section>
  );
}
