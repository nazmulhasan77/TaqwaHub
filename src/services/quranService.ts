import type { QuranAyah } from '../types';
import { quranSamples } from '../data/quranSamples';
import { dateKey, deterministicIndex } from '../utils/dateUtils';

function fromFallback(seed: string): QuranAyah {
  return quranSamples[deterministicIndex(seed, quranSamples.length)];
}

export async function getDailyAyah(): Promise<QuranAyah> {
  const seed = dateKey();
  const fallback = fromFallback(seed);
  const ayahNumber = deterministicIndex(seed, 6236) + 1;
  try {
    const res = await fetch(`https://api.alquran.cloud/v1/ayah/${ayahNumber}/editions/quran-uthmani,en.sahih,bn.bengali`);
    if (!res.ok) throw new Error('Quran API unavailable');
    const json = await res.json();
    const [arabic, english, bangla] = json.data;
    return {
      id: `${english.surah.number}:${english.numberInSurah}`,
      arabic: arabic.text,
      english: english.text,
      bangla: bangla?.text ?? fallback.bangla,
      surah: english.surah.englishName,
      ayah: english.numberInSurah
    };
  } catch {
    return fallback;
  }
}

export async function getHourlyAyah(date = new Date()): Promise<QuranAyah> {
  const seed = `${date.toISOString().slice(0, 13)}:quran`;
  return fromFallback(seed);
}

export async function getRandomAyah(): Promise<QuranAyah> {
  return quranSamples[Math.floor(Math.random() * quranSamples.length)];
}
