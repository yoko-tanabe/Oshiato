'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { searchSpots, type SearchResult } from '@/lib/supabase/search';
import styles from './MapSearchBar.module.css';

export interface SearchState {
  results: SearchResult[];
  keyword: string;
}

interface Props {
  onSearchChange: (state: SearchState | null) => void;
}

export default function MapSearchBar({ onSearchChange }: Props) {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    const trimmed = keyword.trim();
    if (!trimmed) {
      onSearchChange(null);
      return;
    }

    setLoading(true);
    const results = await searchSpots(trimmed, null, null);
    setLoading(false);
    onSearchChange({ results, keyword: trimmed });
  };

  const handleClear = () => {
    setKeyword('');
    onSearchChange(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') handleClear();
  };

  return (
    <div className={styles.container}>
      <div className={styles.bar}>
        <Search size={16} color="var(--color-text-secondary)" className={styles.icon} />
        <input
          className={styles.input}
          type="text"
          placeholder="スポット・推し名で検索..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {keyword && (
          <button className={styles.clearButton} onClick={handleClear} aria-label="クリア">
            ✕
          </button>
        )}
        <button
          className={styles.searchButton}
          onClick={handleSearch}
          disabled={loading || !keyword.trim()}
        >
          {loading ? '...' : '検索'}
        </button>
      </div>
    </div>
  );
}
