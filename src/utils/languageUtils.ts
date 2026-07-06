import { labels } from '../data/translations';
import type { Language } from '../types';

export function t(language: Language, key: keyof typeof labels.en): string {
  return labels[language][key];
}
