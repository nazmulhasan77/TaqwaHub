import type { Settings } from '../types';
import { formatClock, formatDate } from '../utils/dateUtils';

interface Props {
  now: Date;
  clockMode: Settings['clockMode'];
  onClockModeChange: (mode: Settings['clockMode']) => void;
}

export default function AnalogClock({ now, clockMode, onClockModeChange }: Props) {
  const seconds = now.getSeconds();
  const minutes = now.getMinutes() + seconds / 60;
  const hours = (now.getHours() % 12) + minutes / 60;

  return (
    <aside className="left-rail">
      <div className="brand-mark">
        <span className="brand-icon">✺</span>
        <strong><span>Taqwa</span>Hub</strong>
      </div>

      <div className="clock-toggle segmented">
        <button className={clockMode === 'analog' ? 'active' : ''} onClick={() => onClockModeChange('analog')}>Analog</button>
        <button className={clockMode === 'digital' ? 'active' : ''} onClick={() => onClockModeChange('digital')}>Digital</button>
      </div>

      {clockMode === 'analog' ? (
        <div className="analog-clock" aria-label="Analog clock">
          {Array.from({ length: 60 }).map((_, index) => (
            <span
              key={index}
              className={index % 5 === 0 ? 'tick major' : 'tick'}
              style={{ transform: `rotate(${index * 6}deg) translateY(-112px)` }}
            />
          ))}
          <span className="hand hour" style={{ transform: `rotate(${hours * 30}deg)` }} />
          <span className="hand minute" style={{ transform: `rotate(${minutes * 6}deg)` }} />
          <span className="hand second" style={{ transform: `rotate(${seconds * 6}deg)` }} />
          <span className="clock-pin" />
        </div>
      ) : (
        <div className="digital-clock glass">
          <span>{new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(now)}</span>
          <strong>{formatClock(now, '12h')}</strong>
          <small>{formatDate(now)}</small>
        </div>
      )}

      <div className="greeting">
        <strong>Assalamu Alaikum 👋</strong>
        <span>Have a blessed day!</span>
        <small>Click here to edit</small>
      </div>

      <div className="date-pill">📅 {formatDate(now)}</div>
    </aside>
  );
}
