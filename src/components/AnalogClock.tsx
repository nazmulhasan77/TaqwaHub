import type { Settings } from '../types';
import { formatClock, formatDate } from '../utils/dateUtils';

interface Props {
  now: Date;
  clockMode: Settings['clockMode'];
  timeFormat: Settings['timeFormat'];
}

export default function AnalogClock({ now, clockMode, timeFormat }: Props) {
  const seconds = now.getSeconds();
  const minutes = now.getMinutes() + seconds / 60;
  const hours = (now.getHours() % 12) + minutes / 60;

  return (
    <aside className="left-rail">
      <div className="brand-mark">
        <span className="brand-icon">✺</span>
        <strong><span>Taqwa</span>Hub</strong>
      </div>

      {clockMode === 'analog' ? (
        <div className="analog-clock" aria-label="Analog clock">
          {Array.from({ length: 60 }).map((_, index) => (
            <span
              key={index}
              className={index % 5 === 0 ? 'tick major' : 'tick'}
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
          <strong>{formatClock(now, timeFormat)}</strong>
        </div>
      )}

      <div className="greeting">
        <strong>Time is the best healer.</strong>
        <span>Have a blessed day!</span>
      </div>

      <div className="date-pill">📅 {formatDate(now)}</div>
    </aside>
  );
}
