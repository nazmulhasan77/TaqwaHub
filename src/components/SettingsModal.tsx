import type { Settings } from '../types';
import LanguageToggle from './LanguageToggle';
import { clearAllStored } from '../services/storageService';

interface Props {
  open: boolean;
  settings: Settings;
  onClose: () => void;
  onSave: (settings: Settings) => void;
}

export default function SettingsModal({ open, settings, onClose, onSave }: Props) {
  if (!open) return null;
  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => onSave({ ...settings, [key]: value });
  return (
    <div className="modal-backdrop">
      <section className="glass modal">
        <div className="section-title">
          <span>Settings</span>
          <button onClick={onClose}>×</button>
        </div>
        <div className="form-grid">
          <label>City<input value={settings.city} onChange={(e) => update('city', e.target.value)} /></label>
          <label>Country<input value={settings.country} onChange={(e) => update('country', e.target.value)} /></label>
          <label>Calculation Method<input type="number" value={settings.method} onChange={(e) => update('method', Number(e.target.value))} /></label>
          <label>Prayer Alert<select value={settings.notificationMinutes} onChange={(e) => update('notificationMinutes', Number(e.target.value))}><option value={5}>5 min</option><option value={10}>10 min</option><option value={15}>15 min</option></select></label>
          <label>Clock Mode<select value={settings.clockMode} onChange={(e) => update('clockMode', e.target.value as Settings['clockMode'])}><option value="digital">Digital</option><option value="analog">Analog</option></select></label>
        </div>
        <LanguageToggle language={settings.language} onChange={(language) => update('language', language)} />
        <div className="toggle-list">
          <label><input type="checkbox" checked={settings.timeFormat === '12h'} onChange={(e) => update('timeFormat', e.target.checked ? '12h' : '24h')} /> 12-hour time</label>
          <label><input type="checkbox" checked={settings.notificationsEnabled} onChange={(e) => update('notificationsEnabled', e.target.checked)} /> Enable notifications</label>
          <label><input type="checkbox" checked={settings.showQuran} onChange={(e) => update('showQuran', e.target.checked)} /> Quran card</label>
          <label><input type="checkbox" checked={settings.showHadith} onChange={(e) => update('showHadith', e.target.checked)} /> Hadith card</label>
          <label><input type="checkbox" checked={settings.showProductivity} onChange={(e) => update('showProductivity', e.target.checked)} /> Productivity tools</label>
        </div>
        <p className="notice">Islamic dates may vary depending on local moon sighting.</p>
        <div className="actions">
          <button onClick={async () => { await clearAllStored(); location.reload(); }}>Reset all data</button>
          <button className="primary" onClick={onClose}>Done</button>
        </div>
      </section>
    </div>
  );
}
