import type { PrayerTimes, Settings } from '../types';
import { prayerOrder, parsePrayerTime } from '../utils/prayerUtils';

export function schedulePrayerNotifications(settings: Settings, prayerTimes: PrayerTimes) {
  if (!settings.notificationsEnabled || typeof chrome === 'undefined' || !chrome.alarms) return;
  prayerOrder.forEach((name) => {
    const at = parsePrayerTime(prayerTimes.timings[name]).getTime();
    const before = at - settings.notificationMinutes * 60_000;
    if (before > Date.now()) chrome.alarms.create(`prayer-before:${name}`, { when: before });
    if (at > Date.now()) chrome.alarms.create(`prayer-now:${name}`, { when: at });
  });
}
