const hourlyQuran = [
  { bn:'আল্লাহ কাউকে তার সাধ্যাতীত কোনো দায়িত্ব দেন না।', en:'Allah does not charge a soul except within its capacity.', ref:'Quran 2:286' },
  { bn:'নিশ্চয়ই কষ্টের সাথে স্বস্তি রয়েছে।', en:'Indeed, with hardship comes ease.', ref:'Quran 94:5' },
  { bn:'আল্লাহর স্মরণেই অন্তরসমূহ প্রশান্ত হয়।', en:'By the remembrance of Allah hearts are assured.', ref:'Quran 13:28' }
];
const hourlyHadith = [
  { bn:'কর্মসমূহ নিয়তের উপর নির্ভরশীল।', en:'Actions are judged by intentions.', ref:'Sahih al-Bukhari 1' },
  { bn:'জ্ঞান অর্জনের পথে চললে আল্লাহ জান্নাতের পথ সহজ করেন।', en:'Allah eases a path to Paradise for the seeker of knowledge.', ref:'Sahih Muslim 2699' },
  { bn:'উত্তম চরিত্রের মানুষরাই তোমাদের মধ্যে সর্বোত্তম।', en:'The best among you have the best character.', ref:'Jami at-Tirmidhi 1987' }
];

function ensureHourlyReminder() {
  chrome.storage.local.get(['settings'], ({ settings }) => {
    chrome.alarms.clear('taqwahub-hourly-reminder', () => {
      if (settings?.hourlyRemindersEnabled === false || settings?.notificationsEnabled === false) return;
      chrome.alarms.create('taqwahub-hourly-reminder', { delayInMinutes: 60, periodInMinutes: 60 });
    });
  });
}
chrome.runtime.onInstalled.addListener(ensureHourlyReminder);
chrome.runtime.onStartup.addListener(ensureHourlyReminder);
chrome.storage.onChanged.addListener((changes) => { if (changes.settings) ensureHourlyReminder(); });

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type !== 'TAQWA_CURRENT_HIJRI') return;
  const { hijri, language, customEvents = [] } = message;
  const todayId = `${hijri.year}-${hijri.monthNumber}-${hijri.day}`;
  chrome.storage.local.get(['lastHijriReminder'], ({ lastHijriReminder }) => {
    if (lastHijriReminder === todayId) return;
    const builtIn = [
      { month:1,day:10,en:'Ashura',bn:'আশুরা' }, { month:9,day:1,en:'Ramadan begins',bn:'রমজান শুরু' },
      { month:9,day:27,en:'Laylatul Qadr estimate',bn:'লাইলাতুল কদরের সম্ভাব্য রাত' }, { month:10,day:1,en:'Eid-ul-Fitr',bn:'ঈদুল ফিতর' },
      { month:12,day:9,en:'Arafah Day',bn:'আরাফার দিন' }, { month:12,day:10,en:'Eid-ul-Adha',bn:'ঈদুল আযহা' }
    ];
    let label = null;
    if (hijri.day >= 13 && hijri.day <= 15) label = language === 'bn' ? `আজ আইয়ামে বীজের ${hijri.day-12}ম দিন` : `Ayyam al-Bid day ${hijri.day-12}`;
    const event = [...builtIn, ...customEvents.filter((e) => e.reminderEnabled).map((e) => ({month:e.month,day:e.day,en:e.name,bn:e.bnName}))].find((e) => e.month===hijri.monthNumber && e.day===hijri.day);
    if (!label && event) label = language === 'bn' ? event.bn : event.en;
    if (!label) return;
    chrome.notifications.create({ type:'basic', iconUrl:'icons/icon128.png', title: language==='bn'?'আজকের ইসলামিক স্মরণিকা':'Today’s Islamic reminder', message: label });
    chrome.storage.local.set({ lastHijriReminder: todayId });
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'taqwahub-hourly-reminder') {
    chrome.storage.local.get(['settings'], ({ settings }) => {
      if (settings?.notificationsEnabled === false || settings?.hourlyRemindersEnabled === false) return;
      const hour = new Date().getHours(); const useQuran = hour % 2 === 0; const list = useQuran ? hourlyQuran : hourlyHadith; const item = list[hour % list.length];
      const bn = settings?.language === 'bn';
      chrome.notifications.create({ type:'basic', iconUrl:'icons/icon128.png', title: bn ? (useQuran?'কুরআন স্মরণিকা':'হাদিস স্মরণিকা') : (useQuran?'TaqwaHub Quran Reminder':'TaqwaHub Hadith Reminder'), message: `${bn?item.bn:item.en}\n${item.ref}` });
    });
  }
  if (alarm.name.startsWith('prayer-snooze:')) {
    const prayer=alarm.name.split(':')[1];
    chrome.storage.local.get(['settings'],({settings})=>{const bn=settings?.language==='bn';chrome.notifications.create(`taqwahub-prayer:prayer-now:${prayer}:snooze`,{type:'basic',iconUrl:'icons/icon128.png',title:bn?`${prayer} সালাতের স্মরণিকা`:`${prayer} reminder`,message:bn?'এখন সালাত আদায় করুন।':'Please pray now.',buttons:bn?[{title:'পড়া হয়েছে'}]:[{title:'Mark as prayed'}]})});
  }
  if (alarm.name.startsWith('prayer-before:') || alarm.name.startsWith('prayer-now:')) {
    chrome.storage.local.get(['settings'], ({ settings }) => {
      if (settings?.notificationsEnabled === false) return;
      const [kind, prayer] = alarm.name.split(':'); const bn = settings?.language === 'bn';
      const mins = settings?.prayerNotifications?.[prayer]?.beforeMinutes ?? settings?.notificationMinutes ?? 10;
      const id=`taqwahub-prayer:${kind}:${prayer}:${new Date().toISOString().slice(0,10)}`;
      const options={ type:'basic', iconUrl:'icons/icon128.png', title: bn ? (kind==='prayer-before'?`${prayer} সালাতের সময় কাছাকাছি`:`${prayer} সালাতের সময়`) : (kind==='prayer-before'?`${prayer} is coming soon`:`${prayer} time`), message: bn ? (kind==='prayer-before'?`${mins} মিনিট পর ${prayer} সালাত।`:`এখন ${prayer} সালাতের সময়।`) : (kind==='prayer-before'?`About ${mins} minutes until ${prayer}.`:`It is time for ${prayer}.`) };
      if(kind==='prayer-now') options.buttons=bn?[{title:'পড়া হয়েছে'},{title:'১০ মিনিট পরে'}]:[{title:'Mark as prayed'},{title:'Snooze 10 min'}];
      chrome.notifications.create(id,options);
    });
  }
});

chrome.notifications.onButtonClicked.addListener((notificationId,buttonIndex)=>{
  if(!notificationId.startsWith('taqwahub-prayer:'))return;
  const parts=notificationId.split(':');const prayer=parts[2];
  if(buttonIndex===0){const now=new Date();const key=new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,10);chrome.storage.local.get([`salah:${key}`],data=>{const items=data[`salah:${key}`]||[];if(!items.includes(prayer))chrome.storage.local.set({[`salah:${key}`]:[...items,prayer]});chrome.notifications.clear(notificationId)})}
  else if(buttonIndex===1){chrome.alarms.create(`prayer-snooze:${prayer}`,{delayInMinutes:10});chrome.notifications.clear(notificationId)}
});
