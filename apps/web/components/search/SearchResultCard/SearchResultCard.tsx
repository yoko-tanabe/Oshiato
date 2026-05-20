import Link from 'next/link';
import type { SearchResult } from '@/lib/supabase/search';
import styles from './SearchResultCard.module.css';

const CATEGORY_LABELS: Record<string, string> = {
  ooh: '屋外広告',
  popup: 'ポップアップ',
  event: 'イベント',
  other: 'その他',
};

interface Props {
  result: SearchResult;
}

export default function SearchResultCard({ result }: Props) {
  return (
    <Link href={`/spot/${result.spotId}`} className={styles.card}>
      <div className={styles.thumbnail}>
        {result.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={result.imageUrl} alt="" className={styles.image} />
        ) : (
          <div className={styles.noImage}>📍</div>
        )}
      </div>
      <div className={styles.info}>
        <p className={styles.oshiName}>{result.oshiName}</p>
        {result.comment && (
          <p className={styles.comment}>
            {result.comment.length > 50 ? `${result.comment.slice(0, 50)}…` : result.comment}
          </p>
        )}
        <span className={styles.categoryBadge}>
          {CATEGORY_LABELS[result.category] ?? result.category}
        </span>
      </div>
    </Link>
  );
}
