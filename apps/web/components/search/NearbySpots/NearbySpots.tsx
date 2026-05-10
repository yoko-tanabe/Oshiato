'use client';

import { useEffect, useState } from 'react';
import { findNearbySpotsForDisplay, type NearbySpot } from '@/lib/supabase/search';
import SearchResultCard from '@/components/search/SearchResultCard/SearchResultCard';
import styles from './NearbySpots.module.css';

type LocationState = 'idle' | 'loading' | 'denied' | 'ready';

export default function NearbySpots() {
  const [locationState, setLocationState] = useState<LocationState>('idle');
  const [spots, setSpots] = useState<NearbySpot[]>([]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    setLocationState('loading');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const data = await findNearbySpotsForDisplay(
          pos.coords.latitude,
          pos.coords.longitude
        );
        setSpots(data);
        setLocationState('ready');
      },
      () => {
        setLocationState('denied');
      },
      { timeout: 10000 }
    );
  }, []);

  if (locationState === 'idle' || locationState === 'loading') {
    return null;
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>近くのスポット</h2>

      {locationState === 'denied' && (
        <p className={styles.message}>
          位置情報を許可すると、このエリアのスポットが表示されます
        </p>
      )}

      {locationState === 'ready' && spots.length === 0 && (
        <p className={styles.message}>500m以内にスポットはありません</p>
      )}

      {locationState === 'ready' && spots.length > 0 && (
        <div className={styles.list}>
          {spots.map((spot) => (
            <SearchResultCard
              key={spot.postId}
              result={{
                postId: spot.postId,
                spotId: spot.spotId,
                oshiId: spot.oshiId,
                oshiName: spot.oshiName,
                groupName: null,
                comment: spot.comment,
                // NearbySpot の category は string なので Category 型にキャスト
                category: spot.category as 'ooh' | 'popup' | 'event' | 'other',
                imageUrl: spot.imageUrl,
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
