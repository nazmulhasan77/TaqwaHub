import type { Language } from '../types';

interface Props {
  language: Language;
  onChange: (language: Language) => void;
}

export default function LanguageToggle({ language, onChange }: Props) {
  return (
    <div className="segmented" aria-label="Language">
      <button className={language === 'en' ? 'active' : ''} onClick={() => onChange('en')}>EN</button>
      <button className={language === 'bn' ? 'active' : ''} onClick={() => onChange('bn')}>বাংলা</button>
    </div>
  );
}
