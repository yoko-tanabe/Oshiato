'use client';

import Link from 'next/link';
import type { SearchState } from '@/components/search/MapSearchBar/MapSearchBar';
import styles from './SearchResultSheet.module.css';

const CATEGORY_LABELS: Record<string, string> = {
  ooh: '屋外広告',
  popup: 'ポップアップ',
  event: 'イベント',
  other: 'その他',
};

interface Props {
  state: SearchState;
  onClose: () => void;
}

export default function SearchResultSheet({ state, onClose }: Props) {
  const { results, keyword } = state;
  const hasResults = results.length > 0;

  return (
    <div className={styles.sheet}>
      <div className={styles.header}>
        <span className={styles.heading}>
          「{keyword}」の検索結果 {results.length}件
        </span>
        <button className={styles.closeButton} onClick={onClose} aria-label="閉じる">
          ✕
        </button>
      </div>

      <div className={styles.scroll}>
        {!hasResults && (
          <p className={styles.empty}>スポットが見つかりませんでした</p>
        )}

        {hasResults && (
          <ul className={styles.list}>
            {results.map((r) => (
              <li key={r.postId}>
                <Link href={`/spot/${r.spotId}`} className={styles.card}>
                  <div className={styles.thumb}>
                    {r.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.imageUrl} alt="" className={styles.img} />
                    ) : (
                      <span className={styles.noImg}>📍</span>
                    )}
                  </div>
                  <div className={styles.info}>
                    <p className={styles.oshiName}>{r.oshiName}</p>
                    {r.comment && (
                      <p className={styles.comment}>
                        {r.comment.length > 40 ? `${r.comment.slice(0, 40)}…` : r.comment}
                      </p>
                    )}
                    <span className={styles.badge}>
                      {CATEGORY_LABELS[r.category] ?? r.category}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
