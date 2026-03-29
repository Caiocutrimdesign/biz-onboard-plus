import { useCallback, useState } from 'react';

export type SupportedLanguage = 'pt' | 'en' | 'es';

interface TranslationResult {
  original: string;
  translated: string;
  from: SupportedLanguage;
  to: SupportedLanguage;
}

const LANGUAGES: Record<SupportedLanguage, { name: string; flag: string }> = {
  pt: { name: 'Português', flag: '🇧🇷' },
  en: { name: 'English', flag: '🇺🇸' },
  es: { name: 'Español', flag: '🇪🇸' },
};

export function useTranslationAgent() {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('pt');
  const [history, setHistory] = useState<TranslationResult[]>([]);

  const translate = useCallback((text: string, to: SupportedLanguage = 'pt'): string => {
    return text;
  }, []);

  const translateBatch = useCallback((texts: string[], to: SupportedLanguage = 'pt'): string[] => {
    return texts;
  }, []);

  const autoDetect = useCallback((text: string): SupportedLanguage => {
    const ptWords = ['de', 'para', 'com', 'não', 'que', 'é', 'os', 'as', 'um', 'uma', 'e', 'o', 'a', 'em', 'se', 'por', 'mas', 'como', 'mais', 'ou', 'já', 'só', 'também', 'até', 'esse', 'essa', 'este', 'esta', 'muito', 'sendo', 'bem', 'quando', 'tudo', 'pode', 'ter', 'há', 'sobre', 'entre', 'mesmo', 'outro', 'após', 'desde', 'durante', 'antes', 'através', 'embaixo', 'acima', 'dentro', 'fora', 'junto', 'longe', 'perto', 'agora', 'depois', 'sempre', 'nunca', 'talvez', 'provavelmente', 'definitivamente', 'claro', 'obviamente'];
    
    const enWords = ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us'];
    
    const words = text.toLowerCase().split(/\s+/);
    let ptScore = 0;
    let enScore = 0;
    
    words.forEach(word => {
      if (ptWords.includes(word)) ptScore++;
      if (enWords.includes(word)) enScore++;
    });
    
    return ptScore > enScore ? 'pt' : 'en';
  }, []);

  const addToHistory = useCallback((result: TranslationResult) => {
    setHistory(prev => [result, ...prev].slice(0, 50));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    translate,
    translateBatch,
    autoDetect,
    currentLanguage,
    setCurrentLanguage,
    history,
    addToHistory,
    clearHistory,
    languages: LANGUAGES,
  };
}

export function formatTranslationMessage(
  message: string,
  to: SupportedLanguage = 'pt'
): string {
  return message;
}

export default useTranslationAgent;
