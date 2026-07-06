import { useEffect, useMemo, useState } from 'react';
import type { Language, PrayerTimes } from '../types';
import { secondsToClock } from '../utils/dateUtils';
import { getNextPrayer } from '../utils/prayerUtils';
import { t } from '../utils/languageUtils';

interface Props {
  language: Language;
  prayerTimes?: PrayerTimes;
  now: Date;
}

export default function PomodoroTimer({ language, prayerTimes, now }: Props) {
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(id);
  }, [running]);
  const minutesToSalah = useMemo(() => prayerTimes ? (getNextPrayer(prayerTimes, now).at.getTime() - now.getTime()) / 60000 : Infinity, [prayerTimes, now]);
  const reset = (nextMode = mode) => {
    setMode(nextMode);
    setSeconds(nextMode === 'focus' ? 25 * 60 : 5 * 60);
    setRunning(false);
  };
  return (
    <section className="glass card">
      <div className="section-title"><span>⏱ {t(language, 'focus')}</span></div>
      <div className="timer">{secondsToClock(seconds)}</div>
      <div className="segmented wide">
        <button className={mode === 'focus' ? 'active' : ''} onClick={() => reset('focus')}>25m</button>
        <button className={mode === 'break' ? 'active' : ''} onClick={() => reset('break')}>5m</button>
      </div>
      {minutesToSalah < 10 && <p className="notice">{language === 'bn' ? 'নামাজের সময় কাছে। ছোট ফোকাস সেশন বিবেচনা করুন।' : 'Salah is near. Consider a shorter focus session.'}</p>}
      <div className="actions">
        <button onClick={() => setRunning(!running)}>{running ? t(language, 'pause') : t(language, 'start')}</button>
        <button onClick={() => reset()}>{t(language, 'reset')}</button>
      </div>
    </section>
  );
}
