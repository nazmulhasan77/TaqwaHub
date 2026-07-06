const hourlyQuran = [
  {
    bn: 'আল্লাহ কাউকে তার সাধ্যাতীত কোনো দায়িত্ব দেন না।',
    en: 'Allah does not charge a soul except within its capacity.',
    ref: 'Quran 2:286'
  },
  {
    bn: 'নিশ্চয়ই কষ্টের সাথে স্বস্তি রয়েছে।',
    en: 'For indeed, with hardship comes ease.',
    ref: 'Quran 94:5'
  },
  {
    bn: 'আল্লাহর স্মরণেই অন্তরসমূহ প্রশান্ত হয়।',
    en: 'By the remembrance of Allah hearts are assured.',
    ref: 'Quran 13:28'
  }
];

const hourlyHadith = [
  {
    bn: 'কর্মসমূহ নিয়তের উপর নির্ভরশীল।',
    en: 'Actions are judged only by intentions.',
    ref: 'Sahih al-Bukhari 1'
  },
  {
    bn: 'জ্ঞান অর্জনের পথে চললে আল্লাহ জান্নাতের পথ সহজ করেন।',
    en: 'Whoever follows a path seeking knowledge, Allah makes easy a path to Paradise.',
    ref: 'Sahih Muslim 2699'
  },
  {
    bn: 'উত্তম চরিত্রের মানুষরাই তোমাদের মধ্যে সর্বোত্তম।',
    en: 'The best among you are those with the best character.',
    ref: 'Jami at-Tirmidhi 1987'
  }
];

function scheduleHourlyReminder() {
  chrome.alarms.create('taqwahub-hourly-reminder', {
    delayInMinutes: 60,
    periodInMinutes: 60
  });
}

chrome.runtime.onInstalled.addListener(scheduleHourlyReminder);
chrome.runtime.onStartup.addListener(scheduleHourlyReminder);

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'taqwahub-hourly-reminder') {
    chrome.storage.local.get(['settings'], ({ settings }) => {
      if (settings?.notificationsEnabled === false) return;
      const hour = new Date().getHours();
      const useQuran = hour % 2 === 0;
      const list = useQuran ? hourlyQuran : hourlyHadith;
      const item = list[hour % list.length];
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: useQuran ? 'TaqwaHub Quran Reminder' : 'TaqwaHub Hadith Reminder',
        message: `${item.bn}\n${item.en}\n${item.ref}`
      });
    });
  }

  if (alarm.name.startsWith('prayer-before:') || alarm.name.startsWith('prayer-now:')) {
    chrome.storage.local.get(['settings'], ({ settings }) => {
      if (settings?.notificationsEnabled === false) return;
      const [kind, prayer] = alarm.name.split(':');
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: kind === 'prayer-before' ? `${prayer} is coming soon` : `${prayer} time`,
        message: kind === 'prayer-before'
          ? `About ${settings?.notificationMinutes ?? 10} minutes until ${prayer}.`
          : `It is time for ${prayer}.`
      });
    });
  }
});
