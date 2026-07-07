import { useEffect, useState } from 'react';
import type { WordChangeInterval } from '../types';
import {
  getDailyVocabulary,
  getFallbackDailyVocabulary,
  getVocabularyKey,
  type DailyWords
} from '../services/dailyWordsService';

interface Props {
  now: Date;
  wordChangeInterval: WordChangeInterval;
}

export default function AsmaulHusnaCard({ now, wordChangeInterval }: Props) {
  const vocabularyKey = getVocabularyKey(now, wordChangeInterval);
  const [words, setWords] = useState<DailyWords>(() => getFallbackDailyVocabulary(now, wordChangeInterval));

  useEffect(() => {
    let ignore = false;
    setWords(getFallbackDailyVocabulary(now, wordChangeInterval));

    void getDailyVocabulary(now, wordChangeInterval).then((dailyWords) => {
      if (!ignore) setWords(dailyWords);
    });

    return () => {
      ignore = true;
    };
  }, [vocabularyKey, wordChangeInterval]);

  const { quran, ielts } = words;

  return (
    <section className="glass card compact-quote daily-word-card">
      <div className="section-title">
        <span>Words</span>
      </div>
      <div className="word-group">
        <span className="word-label">Quran Arabic</span>
        <p className="arabic" lang="ar" dir="rtl">{quran.arabic}</p>
        <p>{quran.english}</p>
        <small>{quran.bangla}</small>
      </div>
      <div className="word-group">
        <span className="word-label">English</span>
        <p className="ielts-word">
          {ielts.word}
          <small>{ielts.type}</small>
        </p>
        <small>{ielts.meaning}</small>
      </div>
    </section>
  );
}
