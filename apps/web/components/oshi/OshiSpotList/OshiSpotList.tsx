'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getSpotsByOshi, type SearchResult } from '@/lib/supabase/search';
import SearchResultCard from '@/components/search/SearchResultCard/SearchResultCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner/LoadingSpinner';
import styles from './OshiSpotList.module.css';

interface OshiInfo {
  name: string;
  groupName: string | null;
  themeColor: string;
}

interface Props {
  oshiId: string;
}

export default function OshiSpotList({ oshiId }: Props) {
  const router = useRouter();
  const [oshi, setOshi] = useState<OshiInfo | null>(null);
  const [spots, setSpots] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    Promise.all([
      supabase.from('oshis').select('name, group_name').eq('id', oshiId).single(),
      getSpotsByOshi(oshiId),
    ]).then(([{ data: oshiData }, spotData]) => {
      if (oshiData) {
        setOshi({ name: oshiData.name, groupName: oshiData.group_name, themeColor: '#c4b5fd' });
      }
      setSpots(spotData);
      setLoading(false);
    });
  }, [oshiId]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()} aria-label="戻る">
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>
        <div className={styles.oshiInfo}>
          {oshi ? (
            <>
              <span className={styles.oshiName}>{oshi.name}</span>
              {oshi.groupName && (
                <span className={styles.groupName}>{oshi.groupName}</span>
              )}
            </>
          ) : (
            <span className={styles.oshiName}>スポット一覧</span>
          )}
        </div>
      </header>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.center}>
            <LoadingSpinner size="medium" />
          </div>
        ) : spots.length === 0 ? (
          <p className={styles.empty}>まだスポットがありません</p>
        ) : (
          <>
            <p className={styles.count}>{spots.length}件のスポット</p>
            <div className={styles.list}>
              {spots.map((spot) => (
                <SearchResultCard key={spot.postId} result={spot} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
