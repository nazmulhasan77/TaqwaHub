import { useEffect, useRef, useState } from 'react';
import type {
  BackgroundTheme,
  Madhab,
  PrayerName,
  QuickLink,
  Settings,
  WordChangeInterval
} from '../types';
import LanguageToggle from './LanguageToggle';
import { clearAllStored, exportAllStored, importAllStored } from '../services/storageService';

const METHODS = [
  { value: 1, label: 'Karachi' },
  { value: 2, label: 'ISNA' },
  { value: 3, label: 'Muslim World League' },
  { value: 4, label: 'Umm al-Qura' },
  { value: 5, label: 'Egyptian Survey' },
  { value: 8, label: 'Gulf Region' },
  { value: 9, label: 'Kuwait' },
  { value: 10, label: 'Qatar' },
  { value: 11, label: 'Singapore' },
  { value: 12, label: 'Indonesia' },
  { value: 17, label: 'Malaysia' },
  { value: 99, label: 'Custom' }
];
const THEMES: BackgroundTheme[] = ['default', 'ocean', 'forest', 'sunset', 'midnight'];
const INTERVALS: WordChangeInterval[] = ['daily', '12h', '6h', '3h', 'hourly'];
const PRAYERS: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

type LocationStatus = { kind: 'idle' | 'loading' | 'success' | 'error'; message: string };

interface Props {
  open: boolean;
  settings: Settings;
  onClose: () => void;
  onSave: (settings: Settings) => void;
}

export default function SettingsModal({ open, settings, onClose, onSave }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<Settings>(settings);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>({ kind: 'idle', message: '' });

  useEffect(() => {
    if (!open) return;
    setDraft(settings);
    setLocationStatus(
      settings.autoLocationEnabled && settings.latitude != null && settings.longitude != null
        ? {
            kind: 'success',
            message: `Current location ready (${settings.latitude.toFixed(4)}, ${settings.longitude.toFixed(4)})`
          }
        : { kind: 'idle', message: 'Choose city/country or use your current location.' }
    );
  }, [open, settings]);

  if (!open) return null;

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const updateLink = (id: string, field: keyof QuickLink, value: string | boolean) => {
    update(
      'quickLinks',
      draft.quickLinks.map((link) => (link.id === id ? { ...link, [field]: value } : link))
    );
  };

  const useCityLocation = () => {
    setDraft((current) => ({
      ...current,
      autoLocationEnabled: false,
      latitude: null,
      longitude: null
    }));
    setLocationStatus({ kind: 'idle', message: 'Enter a valid city and country, then press Apply settings.' });
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus({ kind: 'error', message: 'Location is not supported by this browser.' });
      return;
    }

    setLocationStatus({ kind: 'loading', message: 'Detecting your current location…' });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = Number(position.coords.latitude.toFixed(6));
        const longitude = Number(position.coords.longitude.toFixed(6));
        setDraft((current) => ({
          ...current,
          autoLocationEnabled: true,
          latitude,
          longitude
        }));
        setLocationStatus({
          kind: 'success',
          message: `Location detected (${latitude.toFixed(4)}, ${longitude.toFixed(4)}). Press Apply settings.`
        });
      },
      (locationError) => {
        const messages: Record<number, string> = {
          1: 'Location permission was denied. Allow location for this extension or use city/country.',
          2: 'Your current location could not be determined. Try again or use city/country.',
          3: 'Location detection timed out. Try again or use city/country.'
        };
        setLocationStatus({
          kind: 'error',
          message: messages[locationError.code] || 'Location detection failed. Use city/country instead.'
        });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
    );
  };

  const exportData = async () => {
    const blob = new Blob([JSON.stringify(await exportAllStored(), null, 2)], { type: 'application/json' });
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `taqwahub-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  };

  const importData = async (file?: File) => {
    if (!file) return;
    try {
      const data = JSON.parse(await file.text()) as Record<string, unknown>;
      await importAllStored(data);
      location.reload();
    } catch {
      setLocationStatus({ kind: 'error', message: 'The selected backup file is not valid JSON.' });
    }
  };

  const applySettings = () => {
    const city = draft.city.trim();
    const country = draft.country.trim();

    if (draft.autoLocationEnabled && (draft.latitude == null || draft.longitude == null)) {
      setLocationStatus({ kind: 'error', message: 'Detect your current location before applying settings.' });
      return;
    }
    if (!draft.autoLocationEnabled && (!city || !country)) {
      setLocationStatus({ kind: 'error', message: 'City and country are required.' });
      return;
    }

    onSave({ ...draft, city, country });
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <section className="glass modal advanced-modal" role="dialog" aria-modal="true" aria-label="Settings">
        <div className="section-title settings-heading">
          <span>Settings</span>
          <button onClick={onClose} type="button" aria-label="Close settings">×</button>
        </div>

        <div className="settings-section">
          <h4>Location & Prayer</h4>
          <div className="location-mode" role="group" aria-label="Location method">
            <button
              type="button"
              className={!draft.autoLocationEnabled ? 'active' : ''}
              onClick={useCityLocation}
            >
              City & Country
            </button>
            <button
              type="button"
              className={draft.autoLocationEnabled ? 'active' : ''}
              onClick={requestLocation}
              disabled={locationStatus.kind === 'loading'}
            >
              {locationStatus.kind === 'loading' ? 'Detecting…' : 'Use Current Location'}
            </button>
          </div>

          <div className={`location-status ${locationStatus.kind}`} aria-live="polite">
            {locationStatus.message}
          </div>

          <div className="form-grid">
            <label>
              City
              <input
                value={draft.city}
                disabled={draft.autoLocationEnabled}
                onChange={(event) => update('city', event.target.value)}
                placeholder="Dhaka"
              />
            </label>
            <label>
              Country
              <input
                value={draft.country}
                disabled={draft.autoLocationEnabled}
                onChange={(event) => update('country', event.target.value)}
                placeholder="Bangladesh"
              />
            </label>
            <label>
              Calculation method
              <select value={draft.method} onChange={(event) => update('method', Number(event.target.value))}>
                {METHODS.map((method) => <option key={method.value} value={method.value}>{method.label}</option>)}
              </select>
            </label>
            <label>
              Madhab
              <select value={draft.madhab} onChange={(event) => update('madhab', event.target.value as Madhab)}>
                <option value="hanafi">Hanafi</option>
                <option value="shafi">Shafi</option>
              </select>
            </label>
            <label>
              Hijri adjustment
              <input
                type="number"
                min={-3}
                max={3}
                value={draft.hijriAdjustment}
                onChange={(event) => update('hijriAdjustment', Number(event.target.value))}
              />
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h4>Prayer-wise Notifications</h4>
          <div className="notification-grid">
            {PRAYERS.map((name) => {
              const config = draft.prayerNotifications[name];
              return (
                <div className="notification-row" key={name}>
                  <strong>{name}</strong>
                  <label>
                    <input
                      type="checkbox"
                      checked={config.enabled}
                      onChange={(event) => update('prayerNotifications', {
                        ...draft.prayerNotifications,
                        [name]: { ...config, enabled: event.target.checked }
                      })}
                    />
                    Enabled
                  </label>
                  <label>
                    Before
                    <input
                      type="number"
                      min={0}
                      max={60}
                      value={config.beforeMinutes}
                      onChange={(event) => update('prayerNotifications', {
                        ...draft.prayerNotifications,
                        [name]: { ...config, beforeMinutes: Number(event.target.value) }
                      })}
                    />
                    min
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={config.atTime}
                      onChange={(event) => update('prayerNotifications', {
                        ...draft.prayerNotifications,
                        [name]: { ...config, atTime: event.target.checked }
                      })}
                    />
                    At time
                  </label>
                </div>
              );
            })}
          </div>
          <div className="toggle-list">
            <label>
              <input
                type="checkbox"
                checked={draft.notificationsEnabled}
                onChange={(event) => update('notificationsEnabled', event.target.checked)}
              />
              Enable notifications
            </label>
            <label>
              <input
                type="checkbox"
                checked={draft.hourlyRemindersEnabled}
                onChange={(event) => update('hourlyRemindersEnabled', event.target.checked)}
              />
              Hourly Quran/Hadith reminder
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h4>Appearance</h4>
          <div className="form-grid">
            <label>
              Clock
              <select value={draft.clockMode} onChange={(event) => update('clockMode', event.target.value as Settings['clockMode'])}>
                <option value="analog">Analog</option>
                <option value="digital">Digital</option>
              </select>
            </label>
            <label>
              Time format
              <select value={draft.timeFormat} onChange={(event) => update('timeFormat', event.target.value as Settings['timeFormat'])}>
                <option value="12h">12 hour</option>
                <option value="24h">24 hour</option>
              </select>
            </label>
            <label>
              Theme
              <select value={draft.backgroundTheme} onChange={(event) => update('backgroundTheme', event.target.value as BackgroundTheme)}>
                {THEMES.map((theme) => <option key={theme}>{theme}</option>)}
              </select>
            </label>
            <label>
              Accent
              <input type="color" value={draft.accentColor} onChange={(event) => update('accentColor', event.target.value)} />
            </label>
            <label>
              Glass blur
              <input type="range" min={0} max={35} value={draft.glassBlur} onChange={(event) => update('glassBlur', Number(event.target.value))} />
            </label>
            <label>
              Background image URL
              <input value={draft.customBackground} onChange={(event) => update('customBackground', event.target.value)} placeholder="https://…" />
            </label>
            <label>
              Content change
              <select value={draft.wordChangeInterval} onChange={(event) => update('wordChangeInterval', event.target.value as WordChangeInterval)}>
                {INTERVALS.map((interval) => <option key={interval}>{interval}</option>)}
              </select>
            </label>
          </div>
          <LanguageToggle language={draft.language} onChange={(language) => update('language', language)} />
        </div>

        <div className="settings-section">
          <h4>Dashboard Cards</h4>
          <div className="toggle-list">
            {([
              ['showQuran', 'Quran card'],
              ['showDua', 'Dua card'],
              ['showHadith', 'Hadith card']
            ] as [keyof Settings, string][]).map(([key, label]) => (
              <label key={key}>
                <input
                  type="checkbox"
                  checked={Boolean(draft[key])}
                  onChange={(event) => update(key, event.target.checked as never)}
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <h4>Custom Jamaat Times</h4>
          <div className="form-grid">
            {PRAYERS.map((name) => (
              <label key={name}>
                {name}
                <input
                  type="time"
                  value={draft.customPrayerTimes[name] || ''}
                  onChange={(event) => update('customPrayerTimes', {
                    ...draft.customPrayerTimes,
                    [name]: event.target.value || null
                  })}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <h4>Daily Barakah Checklist</h4>
          {draft.dailyActions.map((action) => (
            <div className="daily-action-row" key={action.id}>
              <input value={action.icon} onChange={(event) => update('dailyActions', draft.dailyActions.map((item) => item.id === action.id ? { ...item, icon: event.target.value } : item))} />
              <input value={action.name} onChange={(event) => update('dailyActions', draft.dailyActions.map((item) => item.id === action.id ? { ...item, name: event.target.value } : item))} />
              <input value={action.bnName} onChange={(event) => update('dailyActions', draft.dailyActions.map((item) => item.id === action.id ? { ...item, bnName: event.target.value } : item))} />
              <button type="button" onClick={() => update('dailyActions', draft.dailyActions.filter((item) => item.id !== action.id))}>×</button>
            </div>
          ))}
          <button type="button" onClick={() => update('dailyActions', [...draft.dailyActions, { id: crypto.randomUUID(), name: 'New action', bnName: 'নতুন আমল', icon: '✓' }])}>+ Add action</button>
        </div>

        <div className="settings-section">
          <h4>Quick Links</h4>
          <div className="quick-links-settings">
            {draft.quickLinks.map((link) => (
              <div key={link.id} className="quick-link-item">
                <input value={link.name} onChange={(event) => updateLink(link.id, 'name', event.target.value)} placeholder="Name" />
                <input value={link.url} onChange={(event) => updateLink(link.id, 'url', event.target.value)} placeholder="URL" />
                <label>
                  <input type="checkbox" checked={link.useFavicon || false} onChange={(event) => updateLink(link.id, 'useFavicon', event.target.checked)} />
                  Auto icon
                </label>
                <button type="button" onClick={() => update('quickLinks', draft.quickLinks.filter((item) => item.id !== link.id))}>×</button>
              </div>
            ))}
            <button type="button" onClick={() => update('quickLinks', [...draft.quickLinks, { id: crypto.randomUUID(), name: 'New Link', url: 'https://', useFavicon: true }])}>+ Add link</button>
          </div>
        </div>

        <div className="settings-section">
          <h4>Custom Hijri Events</h4>
          {draft.customEvents.map((event) => (
            <div className="custom-event-row" key={event.id}>
              <input value={event.name} onChange={(change) => update('customEvents', draft.customEvents.map((item) => item.id === event.id ? { ...item, name: change.target.value } : item))} />
              <input value={event.bnName} onChange={(change) => update('customEvents', draft.customEvents.map((item) => item.id === event.id ? { ...item, bnName: change.target.value } : item))} />
              <input type="number" min={1} max={12} value={event.month} onChange={(change) => update('customEvents', draft.customEvents.map((item) => item.id === event.id ? { ...item, month: Number(change.target.value) } : item))} />
              <input type="number" min={1} max={30} value={event.day} onChange={(change) => update('customEvents', draft.customEvents.map((item) => item.id === event.id ? { ...item, day: Number(change.target.value) } : item))} />
              <label>
                <input type="checkbox" checked={event.reminderEnabled} onChange={(change) => update('customEvents', draft.customEvents.map((item) => item.id === event.id ? { ...item, reminderEnabled: change.target.checked } : item))} />
                Alert
              </label>
              <button type="button" onClick={() => update('customEvents', draft.customEvents.filter((item) => item.id !== event.id))}>×</button>
            </div>
          ))}
          <button type="button" onClick={() => update('customEvents', [...draft.customEvents, { id: crypto.randomUUID(), name: 'Custom event', bnName: 'কাস্টম ইভেন্ট', month: 1, day: 1, reminderEnabled: true }])}>+ Add event</button>
        </div>

        <div className="settings-section">
          <h4>Backup</h4>
          <div className="actions">
            <button type="button" onClick={() => void exportData()}>Export JSON</button>
            <button type="button" onClick={() => fileRef.current?.click()}>Import JSON</button>
            <input hidden ref={fileRef} type="file" accept="application/json" onChange={(event) => void importData(event.target.files?.[0])} />
            <button type="button" onClick={async () => { await clearAllStored(); location.reload(); }}>Reset all data</button>
          </div>
        </div>

        <p className="notice">Islamic dates may vary depending on local moon sighting.</p>
        <div className="actions settings-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button className="primary" type="button" onClick={applySettings}>Apply settings</button>
        </div>
      </section>
    </div>
  );
}
