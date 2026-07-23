import type { PrayerTimes, Settings } from '../types';
import { prayerOrder, parsePrayerTime } from '../utils/prayerUtils';

export async function schedulePrayerNotifications(settings: Settings, prayerTimes: PrayerTimes) {
  if (typeof chrome === 'undefined' || !chrome.alarms) return;
  const alarms = await chrome.alarms.getAll();
  await Promise.all(alarms.filter((a) => a.name.startsWith('prayer-before:') || a.name.startsWith('prayer-now:')).map((a) => chrome.alarms.clear(a.name)));
  if (!settings.notificationsEnabled) return;

  prayerOrder.forEach((name) => {
    const config = settings.prayerNotifications[name];
    if (!config?.enabled) return;
    const at = parsePrayerTime(prayerTimes.timings[name]).getTime();
    const before = at - config.beforeMinutes * 60_000;
    if (config.beforeMinutes > 0 && before > Date.now()) chrome.alarms.create(`prayer-before:${name}`, { when: before });
    if (config.atTime && at > Date.now()) chrome.alarms.create(`prayer-now:${name}`, { when: at });
  });

  chrome.runtime?.sendMessage?.({
    type: 'TAQWA_CURRENT_HIJRI',
    hijri: prayerTimes.hijri,
    language: settings.language,
    customEvents: settings.customEvents
  }).catch?.(() => undefined);
}
