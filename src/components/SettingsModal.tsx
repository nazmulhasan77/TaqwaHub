import type { Settings, BackgroundTheme, WordChangeInterval, Madhab } from '../types';
import LanguageToggle from './LanguageToggle';
import { clearAllStored } from '../services/storageService';

const CALCULATION_METHODS = [
  { value: 1, label: 'University of Islamic Sciences, Karachi' },
  { value: 2, label: 'Islamic Society of North America (ISNA)' },
  { value: 3, label: 'Muslim World League (MWL)' },
  { value: 4, label: 'Umm al-Qura University, Makkah' },
  { value: 5, label: 'Egyptian General Authority of Survey' },
  { value: 7, label: 'Institute of Geophysics, University of Tehran' },
  { value: 8, label: 'Gulf Region' },
  { value: 9, label: 'Kuwait' },
  { value: 10, label: 'Qatar' },
  { value: 11, label: 'Majlis Ugama Islam Singapura (MUIS)' },
  { value: 12, label: 'Ministry of Religious Affairs, Indonesia' },
  { value: 13, label: 'Morocco' },
  { value: 14, label: 'Turkey' },
  { value: 15, label: 'Directorate of Religious Affairs, Russia' },
  { value: 16, label: 'Dubai' },
  { value: 17, label: 'Jakim, Malaysia' },
  { value: 18, label: 'Ministry of Awqaf, Jordan' },
  { value: 19, label: 'Ministry of Awqaf and Islamic Affairs, Palestine' },
  { value: 20, label: 'Religious Administration of Muslims of Ukraine' },
  { value: 21, label: 'Ministry of Religious Affairs, Tunisia' },
  { value: 22, label: 'Algerian Ministry of Religious Affairs and Awqaf' },
  { value: 23, label: 'Ministry of Awqaf, Oman' },
  { value: 24, label: 'Deutsche Islam Konferenz' },
  { value: 25, label: 'Birmingham' },
  { value: 26, label: 'Baku' },
  { value: 27, label: 'Ministry of Religious Affairs, Bosnia and Herzegovina' },
  { value: 28, label: 'Islamic Community of the Republic of Slovenia' },
  { value: 99, label: 'Custom' },
];

const BACKGROUND_THEMES: { value: BackgroundTheme; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'ocean', label: 'Ocean' },
  { value: 'forest', label: 'Forest' },
  { value: 'sunset', label: 'Sunset' },
  { value: 'midnight', label: 'Midnight' },
];

const WORD_INTERVALS: { value: WordChangeInterval; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: '12h', label: 'Every 12 hours' },
  { value: '6h', label: 'Every 6 hours' },
  { value: '3h', label: 'Every 3 hours' },
  { value: 'hourly', label: 'Hourly' },
];

const MADHABS: { value: Madhab; label: string }[] = [
  { value: 'hanafi', label: 'Hanafi' },
  { value: 'shafi', label: 'Shafi' },
];

interface Props {
  open: boolean;
  settings: Settings;
  onClose: () => void;
  onSave: (settings: Settings) => void;
}

export default function SettingsModal({ open, settings, onClose, onSave }: Props) {
  if (!open) return null;
  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => onSave({ ...settings, [key]: value });
  
  const updateCustomPrayerTime = (prayer: keyof Settings['customPrayerTimes'], time: string) => {
    update('customPrayerTimes', {
      ...settings.customPrayerTimes,
      [prayer]: time || null
    });
  };
  
  const requestLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const newSettings = {
            ...settings,
            autoLocationEnabled: true,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          onSave(newSettings);
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  return (
    <div className="modal-backdrop">
      <section className="glass modal">
        <div className="section-title">
          <span>Settings</span>
          <button onClick={onClose}>×</button>
        </div>
        <div className="form-grid">
          <label>
            Auto Location
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input type="checkbox" checked={settings.autoLocationEnabled} onChange={(e) => update('autoLocationEnabled', e.target.checked)} />
              {!settings.latitude && <button onClick={requestLocation}>Enable</button>}
            </div>
          </label>
          {settings.autoLocationEnabled && settings.latitude && settings.longitude ? (
            <>
              <label>Latitude<input value={settings.latitude} readOnly /></label>
              <label>Longitude<input value={settings.longitude} readOnly /></label>
            </>
          ) : (
            <>
              <label>City<input value={settings.city} onChange={(e) => update('city', e.target.value)} /></label>
              <label>Country<input value={settings.country} onChange={(e) => update('country', e.target.value)} /></label>
            </>
          )}
          <label>
            Calculation Method
            <select value={settings.method} onChange={(e) => update('method', Number(e.target.value))}>
              {CALCULATION_METHODS.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Madhab (Asr Calculation)
            <select value={settings.madhab} onChange={(e) => update('madhab', e.target.value as Madhab)}>
              {MADHABS.map((madhab) => (
                <option key={madhab.value} value={madhab.value}>
                  {madhab.label}
                </option>
              ))}
            </select>
          </label>
          <label>Hijri Date Adjustment<input type="number" value={settings.hijriAdjustment} onChange={(e) => update('hijriAdjustment', Number(e.target.value))} /></label>
          <label>Prayer Alert<select value={settings.notificationMinutes} onChange={(e) => update('notificationMinutes', Number(e.target.value))}><option value={5}>5 min</option><option value={10}>10 min</option><option value={15}>15 min</option></select></label>
          <label>Clock Mode<select value={settings.clockMode} onChange={(e) => update('clockMode', e.target.value as Settings['clockMode'])}><option value="digital">Digital</option><option value="analog">Analog</option></select></label>
          <label>Background Theme
            <select value={settings.backgroundTheme} onChange={(e) => update('backgroundTheme', e.target.value as BackgroundTheme)}>
              {BACKGROUND_THEMES.map((theme) => (
                <option key={theme.value} value={theme.value}>
                  {theme.label}
                </option>
              ))}
            </select>
          </label>
          <label>Content Change
            <select value={settings.wordChangeInterval} onChange={(e) => update('wordChangeInterval', e.target.value as WordChangeInterval)}>
              {WORD_INTERVALS.map((interval) => (
                <option key={interval.value} value={interval.value}>
                  {interval.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        
        <h4 style={{ margin: '20px 0 10px' }}>Custom Prayer Times (Jamaat)</h4>
        <div className="form-grid">
          {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((prayer) => (
            <label key={prayer}>
              {prayer}
              <input 
                type="time" 
                value={settings.customPrayerTimes[prayer as keyof typeof settings.customPrayerTimes] || ''} 
                onChange={(e) => updateCustomPrayerTime(prayer as keyof typeof settings.customPrayerTimes, e.target.value)} 
              />
            </label>
          ))}
        </div>
        
        <LanguageToggle language={settings.language} onChange={(language) => update('language', language)} />
        <div className="toggle-list">
          <label><input type="checkbox" checked={settings.timeFormat === '12h'} onChange={(e) => update('timeFormat', e.target.checked ? '12h' : '24h')} /> 12-hour time</label>
          <label><input type="checkbox" checked={settings.notificationsEnabled} onChange={(e) => update('notificationsEnabled', e.target.checked)} /> Enable notifications</label>
          <label><input type="checkbox" checked={settings.showQuran} onChange={(e) => update('showQuran', e.target.checked)} /> Quran card</label>
          <label><input type="checkbox" checked={settings.showDua} onChange={(e) => update('showDua', e.target.checked)} /> Dua card</label>
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
