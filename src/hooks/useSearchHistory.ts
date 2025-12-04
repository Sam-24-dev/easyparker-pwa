import { useState, useEffect } from 'react';

const STORAGE_KEY = 'easyparker-search-history';

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  const addSearch = (query: string) => {
    if (!query.trim()) return;
    
    const newHistory = [
      query.trim(),
      ...history.filter(h => h.toLowerCase() !== query.toLowerCase())
    ].slice(0, 3);
    
    setHistory(newHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { history, addSearch, clearHistory };
}
