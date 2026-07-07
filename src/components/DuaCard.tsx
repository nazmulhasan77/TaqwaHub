import type { Language, Dua } from '../types';

interface Props {
  dua: Dua;
  language: Language;
}

export default function DuaCard({ dua, language }: Props) {
  const translation = language === 'bn' ? dua.bangla : dua.english;

  return (
    <section className="glass card quote-card compact-quote dua-one-line">
      <p>{translation}</p>
    </section>
  );
}
