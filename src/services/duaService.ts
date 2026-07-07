import type { Dua } from '../types';
import { duaSamples } from '../data/duaSamples';
import { deterministicIndex } from '../utils/dateUtils';

function fromFallback(seed: string): Dua {
  return duaSamples[deterministicIndex(seed, duaSamples.length)];
}

export async function getDuaForKey(key: string): Promise<Dua> {
  const fallback = fromFallback(`${key}:dua`);
  
  try {
    // Try to fetch from an Islamic dua API
    // Using a fallback approach since free dua APIs are limited
    // In production, you can replace with a proper dua API
    const res = await fetch('https://api.aladhan.com/v1/dua');
    if (!res.ok) throw new Error('Dua API unavailable');
    
    const json = await res.json();
    if (json.data && json.data.length > 0) {
      const apiDua = json.data[deterministicIndex(key, json.data.length)];
      return {
        id: apiDua.id || key,
        arabic: apiDua.arabic || fallback.arabic,
        english: apiDua.translation || fallback.english,
        bangla: fallback.bangla, // Most APIs don't have Bangla
        category: apiDua.category || 'Daily',
        reference: apiDua.reference || fallback.reference
      };
    }
  } catch {
    // Fallback to local samples if API fails
  }
  
  return fallback;
}

export async function getHourlyDua(date = new Date()): Promise<Dua> {
  const seed = `${date.toISOString().slice(0, 13)}:dua`;
  return fromFallback(seed);
}

export async function getRandomDua(): Promise<Dua> {
  return duaSamples[Math.floor(Math.random() * duaSamples.length)];
}
