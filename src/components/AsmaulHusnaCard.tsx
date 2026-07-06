import { asmaulHusna, getHourlyAsmaName } from '../data/asmaulHusna';

interface Props {
  now: Date;
}

export default function AsmaulHusnaCard({ now }: Props) {
  const name = getHourlyAsmaName(now);

  return (
    <section className="glass card compact-quote">
      <div className="section-title">
        <span>✨ Allah's Name</span>
      </div>
      <p className="arabic">{name.arabic}</p>
      <p>{name.english}</p>
      <small>{name.bangla}</small>
    </section>
  );
}
