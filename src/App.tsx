import { useEffect, useMemo, useState } from 'react';
import AnalogClock from './components/AnalogClock';
import AsmaulHusnaCard from './components/AsmaulHusnaCard';
import Dashboard from './components/Dashboard';
import DhikrCounter from './components/DhikrCounter';
import DuaCard from './components/DuaCard';
import FocusPanel from './components/FocusPanel';
import HadithCard from './components/HadithCard';
import LanguageToggle from './components/LanguageToggle';
import PomodoroTimer from './components/PomodoroTimer';
import PrayerTimesCard from './components/PrayerTimesCard';
import ProductivityTasks from './components/ProductivityTasks';
import QuranCard from './components/QuranCard';
import SalahTracker from './components/SalahTracker';
import SearchBar from './components/SearchBar';
import SettingsModal from './components/SettingsModal';
import { hadithSamples } from './data/hadithSamples';
import { vocabularyIntervalKey } from './data/dailyWords';
import { getPrayerTimes } from './services/prayerService';
import { getAyahForKey } from './services/quranService';
import { getDuaForKey } from './services/duaService';
import { defaultSettings, getStored, setStored } from './services/storageService';
import { schedulePrayerNotifications } from './services/notificationService';
import type { Dua, Hadith, PrayerName, PrayerTimes, QuranAyah, Settings, Task } from './types';
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
  const [completed, setCompleted] = useState<PrayerName[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [note, setNote] = useState('');
  const [dhikr, setDhikr] = useState<Record<string, number>>({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const today = dateKey(now);
  const contentChangeKey = useMemo(
    () => vocabularyIntervalKey(now, settings.wordChangeInterval),
    [now, settings.wordChangeInterval]
  );
  const customPrayerTimesKey = useMemo(() => JSON.stringify(settings.customPrayerTimes), [settings.customPrayerTimes]);

  // Apply background theme
  useEffect(() => {
    // Remove all existing theme classes
    document.body.classList.remove(
      'theme-ocean',
      'theme-forest',
      'theme-sunset',
      'theme-midnight'
    );
    
    // Add current theme class if not default
    if (settings.backgroundTheme !== 'default') {
      document.body.classList.add(`theme-${settings.backgroundTheme}`);
    }
  }, [settings.backgroundTheme]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const stored = await getStored('settings', defaultSettings);
      if (cancelled) return;
      setSettings({ ...defaultSettings, ...stored });
      setCompleted(await getStored(`salah:${today}`, []));
      setTasks(await getStored(`tasks:${today}`, []));
      setNote(await getStored('quickNote', ''));
      setDhikr(await getStored(`dhikr:${today}`, {}));
      setSettingsLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [today]);

  useEffect(() => {
    setHadith(hadithSamples[deterministicIndex(`${contentChangeKey}:hadith`, hadithSamples.length)]);
    void getAyahForKey(contentChangeKey).then(setAyah);
    void getDuaForKey(contentChangeKey).then(setDua);
  }, [contentChangeKey]);

  useEffect(() => {
    if (!settingsLoaded) return;

    if (settings.autoLocationEnabled && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSettings((current) => {
            const newSettings = {
              ...current,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            void setStored('settings', newSettings);
            return newSettings;
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  }, [settingsLoaded, settings.autoLocationEnabled]);

  useEffect(() => {
    if (!settingsLoaded) return;

    void setStored('settings', settings);
    void (async () => {
      try {
        setError('');
        const result = await getPrayerTimes(settings);
        setPrayerTimes(result.data);
        setWarning(result.warning ?? '');
        schedulePrayerNotifications(settings, result.data);
      } catch {
        setError('Prayer times could not be loaded. Please check your city, country, and connection.');
      }
    })();
  }, [
    settings.autoLocationEnabled,
    settings.latitude,
    settings.longitude,
    settings.city,
    settings.country,
    settings.method,
    settings.madhab,
    settings.hijriAdjustment,
    settings.notificationsEnabled,
    settings.notificationMinutes,
    customPrayerTimesKey,
    settingsLoaded
  ]);

  useEffect(() => { void setStored(`salah:${today}`, completed); }, [completed, today]);
  useEffect(() => { void setStored(`tasks:${today}`, tasks); }, [tasks, today]);
  useEffect(() => { void setStored('quickNote', note); }, [note]);
  useEffect(() => { void setStored(`dhikr:${today}`, dhikr); }, [dhikr, today]);

  const updateSettings = (next: Settings) => {
    setSettings(next);
    void setStored('settings', next);
  };

  const togglePrayer = (name: PrayerName) => {
    setCompleted((items) => items.includes(name) ? items.filter((item) => item !== name) : [...items, name]);
  };

  const isFriday = now.getDay() === 5;
  const isRamadan = prayerTimes?.hijri.monthNumber === 9;
  const ramadanDay = prayerTimes?.hijri.day;

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="header-actions">
          <button className="round-action">✦</button>
          <LanguageToggle language={settings.language} onChange={(language) => updateSettings({ ...settings, language })} />
          <button className="round-action" onClick={() => setSettingsOpen(true)}>⚙</button>
        </div>
      </header>

      {error && <div className="banner error">{error}</div>}
      {warning && <div className="banner">{warning}</div>}

      <section className="newtab-grid">
        <div className="left-column">
          <AnalogClock
            now={now}
            clockMode={settings.clockMode}
          />
          {settings.showDua && dua && <DuaCard dua={dua} language={settings.language} />}
        </div>

        <div className="center-column">
          {prayerTimes ? (
            <Dashboard now={now} language={settings.language} prayerTimes={prayerTimes} contentChangeKey={contentChangeKey} />
          ) : (
            <section className="glass loading">Loading prayer dashboard...</section>
          )}
          <SearchBar />
        </div>

        <div className="right-column">
          <AsmaulHusnaCard now={now} wordChangeInterval={settings.wordChangeInterval} />
          {settings.showQuran && ayah && <QuranCard ayah={ayah} language={settings.language} />}
          {settings.showHadith && <HadithCard hadith={hadith} language={settings.language} />}
        </div>


      </section>

      <details className="tools-drawer">
        <summary>More tools</summary>
        <div className="content-grid compact-tools">
          {prayerTimes && <PrayerTimesCard prayerTimes={prayerTimes} now={now} language={settings.language} />}
          <SalahTracker language={settings.language} completed={completed} onToggle={togglePrayer} />
          {settings.showHadith && <HadithCard hadith={hadith} language={settings.language} />}
          {prayerTimes && <PomodoroTimer language={settings.language} prayerTimes={prayerTimes} now={now} />}
          <DhikrCounter language={settings.language} counts={dhikr} onCounts={setDhikr} />
          {settings.showProductivity && <ProductivityTasks language={settings.language} tasks={tasks} note={note} onTasks={setTasks} onNote={setNote} />}
        </div>
      </details>

      {(isFriday || isRamadan) && (
        <div className="content-grid compact-tools">
          {isFriday && <section className="glass card"><h3>Today is Jumu'ah</h3><p>Read Surah Al-Kahf, send Salawat, go early to the masjid, and make dua before Maghrib.</p></section>}
          {isRamadan && <section className="glass card"><h3>Ramadan Day {ramadanDay}</h3><p>Sehri ends at Fajr. Iftar is at Maghrib. Taraweeh reminder and daily Ramadan dua can be customized in a future release.</p></section>}
        </div>
      )}

      <SettingsModal open={settingsOpen} settings={settings} onClose={() => setSettingsOpen(false)} onSave={updateSettings} />
      
      <footer className="app-footer">
        <p>
          Developed by: <a href="https://www.facebook.com/butterflydevs/" target="_blank" rel="noopener noreferrer">Butterfly Devs</a>
        </p>
      </footer>
    </main>
  );
}
