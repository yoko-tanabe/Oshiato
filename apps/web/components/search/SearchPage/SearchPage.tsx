'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useCurrentUser } from '@/lib/user/useCurrentUser';
import { searchSpots, type SearchResult, type Category } from '@/lib/supabase/search';
import SearchResultCard from '@/components/search/SearchResultCard/SearchResultCard';
import NearbySpots from '@/components/search/NearbySpots/NearbySpots';
import styles from './SearchPage.module.css';

interface OshiOption {
  oshiId: string;
  name: string;
  themeColor: string;
}

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'ooh', label: '屋外広告' },
  { value: 'popup', label: 'ポップアップ' },
  { value: 'event', label: 'イベント' },
  { value: 'other', label: 'その他' },
];

export default function SearchPage() {
  const { userId } = useCurrentUser();

  const [keyword, setKeyword] = useState('');
  const [selectedOshiId, setSelectedOshiId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [oshiOptions, setOshiOptions] = useState<OshiOption[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // ログイン中ユーザーの推しリストを取得（フィルターチップ用）
  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();
    supabase
      .from('user_oshis')
      .select('oshi_id, theme_color')
      .eq('user_id', userId)
      .order('display_order')
      .then(async ({ data: userOshis }) => {
        if (!userOshis || userOshis.length === 0) return;
        const ids = userOshis.map((r) => r.oshi_id);
        const { data: oshiRows } = await supabase
          .from('oshis')
          .select('id, name')
          .in('id', ids);
        if (!oshiRows) return;
        setOshiOptions(
          userOshis.map((r) => ({
            oshiId: r.oshi_id,
            name: oshiRows.find((o) => o.id === r.oshi_id)?.name ?? '',
            themeColor: r.theme_color,
          }))
        );
      });
  }, [userId]);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setSearched(true);
    const data = await searchSpots(keyword, selectedOshiId, selectedCategory);
    setResults(data);
    setLoading(false);
  }, [keyword, selectedOshiId, selectedCategory]);

  // フィルター変更時に自動検索
  useEffect(() => {
    if (!searched && !selectedOshiId && !selectedCategory) return;
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOshiId, selectedCategory]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>スポットを探す</h1>
      </header>

      {/* 検索バー */}
      <div className={styles.searchBar}>
        <input
          className={styles.input}
          type="text"
          placeholder="キーワードを入力..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className={styles.searchButton} onClick={handleSearch}>
          検索
        </button>
      </div>

      {/* 推しフィルター */}
      {oshiOptions.length > 0 && (
        <div className={styles.filterSection}>
          <p className={styles.filterLabel}>推しで絞り込む</p>
          <div className={styles.chips}>
            <button
              className={`${styles.chip} ${selectedOshiId === null ? styles.chipActive : ''}`}
              onClick={() => setSelectedOshiId(null)}
            >
              すべて
            </button>
            {oshiOptions.map((o) => (
              <button
                key={o.oshiId}
                className={`${styles.chip} ${selectedOshiId === o.oshiId ? styles.chipActive : ''}`}
                style={selectedOshiId === o.oshiId ? { backgroundColor: o.themeColor, color: '#fff', borderColor: o.themeColor } : { borderColor: o.themeColor }}
                onClick={() => setSelectedOshiId(selectedOshiId === o.oshiId ? null : o.oshiId)}
              >
                {o.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* カテゴリフィルター */}
      <div className={styles.filterSection}>
        <p className={styles.filterLabel}>カテゴリで絞り込む</p>
        <div className={styles.chips}>
          <button
            className={`${styles.chip} ${selectedCategory === null ? styles.chipActive : ''}`}
            onClick={() => setSelectedCategory(null)}
          >
            すべて
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              className={`${styles.chip} ${selectedCategory === c.value ? styles.chipActive : ''}`}
              onClick={() => setSelectedCategory(selectedCategory === c.value ? null : c.value)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* 近くのスポット */}
      <NearbySpots />

      {/* 検索結果 */}
      {searched && (
        <section className={styles.resultsSection}>
          <h2 className={styles.sectionTitle}>
            {loading ? '検索中...' : `検索結果 ${results.length}件`}
          </h2>
          {!loading && results.length === 0 && (
            <p className={styles.empty}>スポットが見つかりませんでした</p>
          )}
          <div className={styles.resultsList}>
            {results.map((result) => (
              <SearchResultCard key={result.postId} result={result} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
