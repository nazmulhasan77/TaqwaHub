import { useEffect, useMemo, useState } from 'react';
import type { Language, PrayerTimes } from '../types';
import { secondsToClock } from '../utils/dateUtils';
import { getNextPrayer } from '../utils/prayerUtils';
import { t } from '../utils/languageUtils';
interface Props { language: Language; prayerTimes?: PrayerTimes; now: Date; }
export default function PomodoroTimer({ language, prayerTimes, now }: Props) {
  const [seconds,setSeconds]=useState(25*60); const [running,setRunning]=useState(false); const [mode,setMode]=useState<'focus'|'break'|'salah'>('focus');
  useEffect(()=>{if(!running)return; const id=window.setInterval(()=>setSeconds(v=>{if(v<=1){setRunning(false);return 0;}return v-1;}),1000); return()=>window.clearInterval(id);},[running]);
  const next=useMemo(()=>prayerTimes?getNextPrayer(prayerTimes,now):null,[prayerTimes,now]);
  const minutesToSalah=next?(next.at.getTime()-now.getTime())/60000:Infinity;
  const reset=(nextMode=mode)=>{setMode(nextMode);setSeconds(nextMode==='focus'?25*60:nextMode==='break'?5*60:Math.max(0,Math.floor((next?.at.getTime()??now.getTime())-now.getTime())/1000));setRunning(false);};
  return <section className="glass card"><div className="section-title"><span>⏱ {t(language,'focus')}</span>{next&&<em>{next.name}</em>}</div><div className="timer">{secondsToClock(seconds)}</div><div className="segmented wide"><button className={mode==='focus'?'active':''} onClick={()=>reset('focus')}>25m</button><button className={mode==='break'?'active':''} onClick={()=>reset('break')}>5m</button><button className={mode==='salah'?'active':''} disabled={!next} onClick={()=>reset('salah')}>{language==='bn'?'সালাত পর্যন্ত':'Until Salah'}</button></div>{minutesToSalah<10&&<p className="notice">{language==='bn'?'নামাজের সময় কাছে।':'Salah is near.'}</p>}<div className="actions"><button onClick={()=>setRunning(!running)}>{running?t(language,'pause'):t(language,'start')}</button><button onClick={()=>reset()}>{t(language,'reset')}</button></div></section>;
}
