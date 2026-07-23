export function dateKey(date = new Date()): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export function aladhanDate(date = new Date()): string {
  return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
}

export function formatClock(date: Date, format: '12h' | '24h'): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: format === '12h'
  }).format(date);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(date);
}

export function dayPart(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  if (hour < 20) return 'Evening';
  return 'Night';
}

export function secondsToClock(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function deterministicIndex(seed: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return hash % length;
}

export function formatTime(time: string, format: '12h' | '24h'): string {
  const clean = time.split(' ')[0];
  const [hourRaw, minuteRaw] = clean.split(':').map(Number);
  if (format === '24h') return `${String(hourRaw).padStart(2, '0')}:${String(minuteRaw).padStart(2, '0')}`;
  const period = hourRaw >= 12 ? 'PM' : 'AM';
  const hour = hourRaw % 12 || 12;
  return `${String(hour).padStart(2, '0')}:${String(minuteRaw).padStart(2, '0')} ${period}`;
}

export const formatTime12h = (time: string) => formatTime(time, '12h');
