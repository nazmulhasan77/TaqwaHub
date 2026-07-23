import { useEffect, useMemo, useState } from 'react';
import AnalogClock from './components/AnalogClock';
import AsmaulHusnaCard from './components/AsmaulHusnaCard';
import BarakahActions, { type BarakahAction } from './components/BarakahActions';
import Dashboard from './components/Dashboard';
import DuaCard from './components/DuaCard';
import HadithCard from './components/HadithCard';
import IslamicCalendar from './components/IslamicCalendar';
import LanguageToggle from './components/LanguageToggle';
import QuranCard from './components/QuranCard';
import QuickLinks from './components/QuickLinks';
import SettingsModal from './components/SettingsModal';
import { vocabularyIntervalKey } from './data/dailyWords';
import { hadithSamples } from './data/hadithSamples';
import { getDuaForKey } from './services/duaService';
import { schedulePrayerNotifications } from './services/notificationService';
import { getPrayerTimes } from './services/prayerService';
import { getAyahForKey } from './services/quranService';
import { defaultSettings, getStored, mergeSettings, setStored } from './services/storageService';
import type { Dua, Hadith, PrayerTimes, QuranAyah, QuickLink, Settings } from './types';
import { dateKey, deterministicIndex } from './utils/dateUtils';

export default function App() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [now, setNow] = useState(new Date());
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [warning, setWarning] = useState('');
  const [error, setError] = useState('');
  const [ayah, setAyah] = useState<QuranAyah | null>(null);
  const [hadith, setHadith] = useState<Hadith>(hadithSamples[0]);
  const [dua, setDua] = useState<Dua | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [barakahActions, setBarakahActions] = useState<BarakahAction[]>([]);

  const today = dateKey(now);
  const contentChangeKey = useMemo(
    () => vocabularyIntervalKey(now, settings.wordChangeInterval),
    [now, settings.wordChangeInterval]
  );
  const customPrayerTimesKey = useMemo(
    () => JSON.stringify(settings.customPrayerTimes),
    [settings.customPrayerTimes]
  );
  const notificationKey = useMemo(
    () => JSON.stringify(settings.prayerNotifications),
    [settings.prayerNotifications]
  );

  useEffect(() => {
    document.body.className = settings.backgroundTheme === 'default' ? '' : `theme-${settings.backgroundTheme}`;
    document.documentElement.style.setProperty('--accent', settings.accentColor);
    document.documentElement.style.setProperty('--glass-blur', `${settings.glassBlur}px`);
    if (settings.customBackground) {
      document.body.style.backgroundImage = `linear-gradient(rgba(3,8,20,.62),rgba(3,8,20,.78)),url("${settings.customBackground.replace(/"/g, '')}")`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
    } else {
      document.body.style.backgroundImage = '';
    }
  }, [settings.backgroundTheme, settings.customBackground, settings.accentColor, settings.glassBlur]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const stored = mergeSettings(await getStored<Partial<Settings>>('settings', {}));
      if (cancelled) return;
      setSettings(stored);
      const raw = await getStored<Array<string | BarakahAction>>(`barakah:${today}`, []);
      setBarakahActions(
        stored.dailyActions.map((action) => ({
          ...action,
          completed: raw.some((saved) => {
            if (typeof saved === 'string') return saved === action.id;
            return saved.id === action.id && saved.completed !== false;
          })
        }))
      );
      setSettingsLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [today]);

  useEffect(() => {
    if (!settingsLoaded) return;
    setBarakahActions((current) => settings.dailyActions.map((action) => ({
      ...action,
      completed: current.find((item) => item.id === action.id)?.completed ?? false
    })));
  }, [settings.dailyActions, settingsLoaded]);

  useEffect(() => {
    setHadith(hadithSamples[deterministicIndex(`${contentChangeKey}:hadith`, hadithSamples.length)]);
    void getAyahForKey(contentChangeKey).then(setAyah);
    void getDuaForKey(contentChangeKey).then(setDua);
  }, [contentChangeKey]);

  useEffect(() => {
    if (
      !settingsLoaded ||
      !settings.autoLocationEnabled ||
      (settings.latitude != null && settings.longitude != null) ||
      !navigator.geolocation
    ) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSettings((current) => ({
          ...current,
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6))
        }));
      },
      () => {
        setSettings((current) => ({
          ...current,
          autoLocationEnabled: false,
          latitude: null,
          longitude: null
        }));
        setWarning('Current location was unavailable, so city and country are being used.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
    );
  }, [
    settingsLoaded,
    settings.autoLocationEnabled,
    settings.latitude,
    settings.longitude
  ]);

  useEffect(() => {
    if (!settingsLoaded) return;
    void setStored('settings', settings);
    void (async () => {
      try {
        setError('');
        const result = await getPrayerTimes(settings);
        setPrayerTimes(result.data);
        void setStored('currentPrayerTimes', result.data);
        setWarning(result.warning ?? '');
        await schedulePrayerNotifications(settings, result.data);
      } catch {
        setError('Prayer times could not be loaded. Please check the selected location and internet connection.');
      }
    })();
  }, [
    settingsLoaded,
    settings.autoLocationEnabled,
    settings.latitude,
    settings.longitude,
    settings.city,
    settings.country,
    settings.method,
    settings.madhab,
    settings.hijriAdjustment,
    settings.notificationsEnabled,
    settings.hourlyRemindersEnabled,
    settings.language,
    settings.customEvents,
    customPrayerTimesKey,
    notificationKey
  ]);

  useEffect(() => {
    if (barakahActions.length) void setStored(`barakah:${today}`, barakahActions);
  }, [barakahActions, today]);

  const updateSettings = (next: Settings) => {
    setSettings(next);
    void setStored('settings', next);
  };

  const addQuickLink = () => {
    const newLink: QuickLink = {
      id: crypto.randomUUID(),
      name: 'New Link',
      url: 'https://',
      useFavicon: true
    };
    updateSettings({ ...settings, quickLinks: [...settings.quickLinks, newLink] });
    setSettingsOpen(true);
  };

  const isFriday = now.getDay() === 5;
  const isRamadan = prayerTimes?.hijri.monthNumber === 9;

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="header-actions">
          <LanguageToggle
            language={settings.language}
            onChange={(language) => updateSettings({ ...settings, language })}
          />
          <button
            className="round-action"
            type="button"
            title={settings.language === 'bn' ? 'সেটিংস' : 'Settings'}
            aria-label={settings.language === 'bn' ? 'সেটিংস খুলুন' : 'Open settings'}
            onClick={() => setSettingsOpen(true)}
          >
            ⚙
          </button>
        </div>
      </header>

      {error && <div className="banner error">{error}</div>}
      {warning && <div className="banner">{warning}</div>}

      <section className="newtab-grid">
        <div className="left-column">
          <AnalogClock now={now} clockMode={settings.clockMode} timeFormat={settings.timeFormat} />
          {settings.showDua && dua && <DuaCard dua={dua} language={settings.language} />}
        </div>

        <div className="center-column">
          {prayerTimes ? (
            <Dashboard
              now={now}
              language={settings.language}
              prayerTimes={prayerTimes}
              contentChangeKey={contentChangeKey}
              timeFormat={settings.timeFormat}
              customEvents={settings.customEvents}
            />
          ) : (
            <section className="glass loading">Loading prayer dashboard…</section>
          )}
          <BarakahActions
            actions={barakahActions}
            onToggle={(id) => setBarakahActions((actions) => actions.map((action) => (
              action.id === id ? { ...action, completed: !action.completed } : action
            )))}
            language={settings.language}
          />
          <QuickLinks quickLinks={settings.quickLinks} onAddLink={addQuickLink} />
        </div>

        <div className="right-column">
          <AsmaulHusnaCard now={now} wordChangeInterval={settings.wordChangeInterval} />
          {settings.showQuran && ayah && <QuranCard ayah={ayah} language={settings.language} />}
          {settings.showHadith && <HadithCard hadith={hadith} language={settings.language} />}
        </div>
      </section>

      <details className="tools-drawer hijri-only-drawer">
        <summary>
          <span className="tools-summary-icon" aria-hidden="true">☾</span>
          <span className="tools-summary-copy">
            <strong>{settings.language === 'bn' ? 'আরও টুলস' : 'More Tools'}</strong>
            <small>{settings.language === 'bn' ? 'হিজরি ক্যালেন্ডার' : 'Hijri Calendar'}</small>
          </span>
          <span className="tools-summary-chevron" aria-hidden="true">⌄</span>
        </summary>
        <div className="hijri-tools-panel">
          {prayerTimes ? (
            <IslamicCalendar
              hijri={prayerTimes.hijri}
              language={settings.language}
              customEvents={settings.customEvents}
            />
          ) : (
            <section className="glass card loading">Loading Hijri calendar…</section>
          )}
        </div>
      </details>

      {isFriday && (
        <section className="glass card jummah-banner">
          <h3>🕌 Today is Jumu'ah</h3>
          <p>Read Surah Al-Kahf, send Salawat, go early to the masjid, and make dua before Maghrib.</p>
        </section>
      )}

      {isRamadan && <div className="ramadan-glow" />}
      <SettingsModal
        open={settingsOpen}
        settings={settings}
        onClose={() => setSettingsOpen(false)}
        onSave={updateSettings}
      />
      <footer className="app-footer">
        <p>
          Developed by:{' '}
          <a href="https://www.facebook.com/butterflydevs/" target="_blank" rel="noopener noreferrer">
            Butterfly Devs
          </a>
        </p>
      </footer>
    </main>
  );
}
