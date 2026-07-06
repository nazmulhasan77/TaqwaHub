import type { IslamicEvent } from '../types';

export const islamicEvents: IslamicEvent[] = [
  { id: 'ashura', name: 'Ashura', bnName: 'আশুরা', month: 1, day: 10 },
  { id: 'mawlid', name: 'Eid-e-Miladunnabi', bnName: 'ঈদে মিলাদুন্নবী', month: 3, day: 12 },
  { id: 'ramadan', name: 'Ramadan', bnName: 'রমজান', month: 9, day: 1 },
  { id: 'laylatul-qadr', name: 'Laylatul Qadr estimate', bnName: 'লাইলাতুল কদর সম্ভাব্য', month: 9, day: 27 },
  { id: 'eid-fitr', name: 'Eid-ul-Fitr', bnName: 'ঈদুল ফিতর', month: 10, day: 1 },
  { id: 'arafah', name: 'Arafah Day', bnName: 'আরাফার দিন', month: 12, day: 9 },
  { id: 'eid-adha', name: 'Eid-ul-Adha', bnName: 'ঈদুল আযহা', month: 12, day: 10 }
];
