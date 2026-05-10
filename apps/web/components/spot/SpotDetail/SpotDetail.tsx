'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useCurrentUser } from '@/lib/user/useCurrentUser';
import LoadingSpinner from '@/components/ui/LoadingSpinner/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import CheckInButton from '@/components/spot/CheckInButton/CheckInButton';
import styles from './SpotDetail.module.css';

/* ---------- 型定義 ---------- */

interface SpotInfo {
  address: string | null;
  lat: number;
  lng: number;
}

interface PhotoItem {
  postId: string;
  imageUrl: string;
  takenAt: string | null;
  createdAt: string;
}

interface OshiInfo {
  id: string;
  name: string;
  color: string;
}

/* ---------- ヘルパー ---------- */

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/* ---------- コンポーネント ---------- */

interface SpotDetailProps {
  spotId: string;
}

export default function SpotDetail({ spotId }: SpotDetailProps) {
  const router = useRouter();
  const { userId, isLoading: isUserLoading } = useCurrentUser();
  const [spot, setSpot] = useState<SpotInfo | null>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [oshi, setOshi] = useState<OshiInfo | null>(null);
  const [visitCount, setVisitCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading || !userId) return;

    async function fetchSpotDetail() {
      const supabase = createClient();
      // ① スポットの座標・住所を取得（RPC経由）
      type SpotRow = { id: string; lng: number; lat: number; address: string | null };
      const { data: allSpots } = await supabase
        .rpc('get_spots_with_coords') as unknown as { data: SpotRow[] | null };

      const spotRow = allSpots?.find((s) => s.id === spotId);
      if (!spotRow) {
        setIsLoading(false);
        return;
      }

      setSpot({
        address: spotRow.address,
        lat: spotRow.lat,
        lng: spotRow.lng,
      });

      // ② このスポットの投稿を取得
      const { data: posts } = await supabase
        .from('posts')
        .select('id, oshi_id, taken_at, created_at')
        .eq('spot_id', spotId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (!posts || posts.length === 0) {
        setIsLoading(false);
        return;
      }

      const postIds = posts.map((p) => p.id);
      const firstOshiId = posts[0].oshi_id;

      // ③ 画像、推し情報、訪問回数を並行取得
      const [{ data: images }, { data: oshiRow }, { data: userOshi }, { count }] =
        await Promise.all([
          supabase
            .from('post_images')
            .select('post_id, image_url')
            .in('post_id', postIds)
            .eq('display_order', 0),
          supabase
            .from('oshis')
            .select('id, name')
            .eq('id', firstOshiId)
            .single(),
          supabase
            .from('user_oshis')
            .select('theme_color')
            .eq('user_id', userId!)
            .eq('oshi_id', firstOshiId)
            .single(),
          supabase
            .from('visit_logs')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId!)
            .eq('spot_id', spotId),
        ]);

      // 画像マップ
      const imageMap = new Map<string, string>();
      images?.forEach((img) => imageMap.set(img.post_id, img.image_url));

      // 写真リスト
      setPhotos(
        posts
          .filter((p) => imageMap.has(p.id))
          .map((p) => ({
            postId: p.id,
            imageUrl: imageMap.get(p.id)!,
            takenAt: p.taken_at,
            createdAt: p.created_at,
          })),
      );

      // 推し情報
      if (oshiRow) {
        setOshi({
          id: oshiRow.id,
          name: oshiRow.name,
          color: userOshi?.theme_color ?? '#c4b5fd',
        });
      }

      // 訪問回数
      setVisitCount(count ?? 0);
      setIsLoading(false);
    }

    fetchSpotDetail();
  }, [spotId, userId, isUserLoading]);

  /* --- ローディング --- */
  if (isLoading || isUserLoading) {
    return <LoadingSpinner size="large" />;
  }

  /* --- スポットが見つからない --- */
  if (!spot) {
    return (
      <EmptyState
        icon={<Camera size={48} strokeWidth={1.5} />}
        message="スポットが見つかりませんでした"
        actionLabel="マップに戻る"
        onAction={() => router.push('/')}
      />
    );
  }

  return (
    <div className={styles.wrapper}>
      {/* ヘッダー */}
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>
        <h1 className={styles.title}>スポット詳細</h1>
      </header>

      {/* スポット情報 */}
      <section className={styles.info}>
        <p className={styles.address}>{spot.address ?? '住所不明'}</p>
        <div className={styles.meta}>
          {oshi && (
            <span className={styles.oshiBadge} style={{ background: `${oshi.color}33`, color: oshi.color }}>
              {oshi.name}
            </span>
          )}
          {visitCount > 0 && (
            <span className={styles.visitCount}>{visitCount}回訪問</span>
          )}
        </div>
      </section>

      {/* チェックイン */}
      {oshi && (
        <section className={styles.checkinSection}>
          <CheckInButton
            spotId={spotId}
            oshiId={oshi.id}
            spotLat={spot.lat}
            spotLng={spot.lng}
          />
        </section>
      )}

      {/* 写真ギャラリー */}
      {photos.length > 0 && (
        <section>
          <h2 className={styles.sectionTitle}>写真</h2>
          <div className={styles.grid}>
            {photos.map((photo) => (
              <div key={photo.postId} className={styles.tile}>
                <img
                  className={styles.tileImage}
                  src={photo.imageUrl}
                  alt="投稿写真"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className={styles.dateOverlay}>
                  {formatDate(photo.takenAt ?? photo.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
