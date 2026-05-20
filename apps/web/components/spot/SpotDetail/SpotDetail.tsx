'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Pencil, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useCurrentUser } from '@/lib/user/useCurrentUser';
import { deletePost } from '@/lib/supabase/spots';
import { useToast } from '@/components/ui/Toast/ToastProvider';
import LoadingSpinner from '@/components/ui/LoadingSpinner/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import CheckInButton from '@/components/spot/CheckInButton/CheckInButton';
import SpotEditForm from '@/components/spot/SpotEditForm/SpotEditForm';
import styles from './SpotDetail.module.css';

/* ---------- 型定義 ---------- */

type Category = 'ooh' | 'popup' | 'event' | 'other';

interface SpotInfo {
  address: string | null;
  lat: number;
  lng: number;
}

interface PhotoItem {
  postId: string;
  postUserId: string | null;
  imageUrl: string;
  takenAt: string | null;
  createdAt: string;
  category: Category;
  comment: string | null;
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
  const { showToast } = useToast();
  const [spot, setSpot] = useState<SpotInfo | null>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [oshi, setOshi] = useState<OshiInfo | null>(null);
  const [visitCount, setVisitCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  useEffect(() => {
    if (isUserLoading || !userId) return;

    async function fetchSpotDetail() {
      const supabase = createClient();

      type SpotRow = { id: string; lng: number; lat: number; address: string | null };
      const { data: allSpots } = await supabase
        .rpc('get_spots_with_coords') as unknown as { data: SpotRow[] | null };

      const spotRow = allSpots?.find((s) => s.id === spotId);
      if (!spotRow) {
        setIsLoading(false);
        return;
      }

      setSpot({ address: spotRow.address, lat: spotRow.lat, lng: spotRow.lng });

      const { data: posts } = await supabase
        .from('posts')
        .select('id, user_id, oshi_id, category, comment, taken_at, created_at')
        .eq('spot_id', spotId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (!posts || posts.length === 0) {
        setIsLoading(false);
        return;
      }

      const postIds = posts.map((p) => p.id);
      const firstOshiId = posts[0].oshi_id;

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

      const imageMap = new Map<string, string>();
      images?.forEach((img) => imageMap.set(img.post_id, img.image_url));

      setPhotos(
        posts
          .filter((p) => imageMap.has(p.id))
          .map((p) => ({
            postId: p.id,
            postUserId: p.user_id,
            imageUrl: imageMap.get(p.id)!,
            takenAt: p.taken_at,
            createdAt: p.created_at,
            category: p.category as Category,
            comment: p.comment,
          })),
      );

      if (oshiRow) {
        setOshi({ id: oshiRow.id, name: oshiRow.name, color: userOshi?.theme_color ?? '#c4b5fd' });
      }

      setVisitCount(count ?? 0);
      setIsLoading(false);
    }

    fetchSpotDetail();
  }, [spotId, userId, isUserLoading]);

  async function handleDelete(photo: PhotoItem) {
    if (!window.confirm('この投稿を削除しますか？\n写真も合わせて削除されます。')) return;

    const ok = await deletePost(photo.postId, [photo.imageUrl]);
    if (!ok) {
      showToast('error', '削除に失敗しました');
      return;
    }

    setPhotos((prev) => prev.filter((p) => p.postId !== photo.postId));
    showToast('success', '削除しました');
  }

  if (isLoading || isUserLoading) return <LoadingSpinner size="large" />;

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
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>
        <h1 className={styles.title}>スポット詳細</h1>
      </header>

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

      {oshi && (
        <section className={styles.checkinSection}>
          <CheckInButton spotId={spotId} oshiId={oshi.id} spotLat={spot.lat} spotLng={spot.lng} />
        </section>
      )}

      {photos.length > 0 && (
        <section>
          <h2 className={styles.sectionTitle}>写真</h2>
          <div className={styles.grid}>
            {photos.map((photo) => {
              const isOwn = photo.postUserId === userId;
              return (
                <div key={photo.postId}>
                  <div className={styles.tile}>
                    <img
                      className={styles.tileImage}
                      src={photo.imageUrl}
                      alt="投稿写真"
                      loading="lazy"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <div className={styles.dateOverlay}>
                      {formatDate(photo.takenAt ?? photo.createdAt)}
                    </div>
                    {isOwn && (
                      <div className={styles.tileActions}>
                        <button
                          className={styles.tileActionButton}
                          onClick={() => setEditingPostId(
                            editingPostId === photo.postId ? null : photo.postId
                          )}
                          aria-label="編集"
                        >
                          <Pencil size={13} strokeWidth={2} />
                        </button>
                        <button
                          className={`${styles.tileActionButton} ${styles.tileActionDelete}`}
                          onClick={() => handleDelete(photo)}
                          aria-label="削除"
                        >
                          <Trash2 size={13} strokeWidth={2} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 編集フォームをタイル直下にインライン展開 */}
                  {isOwn && editingPostId === photo.postId && (
                    <SpotEditForm
                      postId={photo.postId}
                      initialCategory={photo.category}
                      initialComment={photo.comment ?? ''}
                      onSave={(updated) => {
                        setPhotos((prev) =>
                          prev.map((p) =>
                            p.postId === photo.postId
                              ? { ...p, category: updated.category, comment: updated.comment }
                              : p
                          )
                        );
                        setEditingPostId(null);
                      }}
                      onCancel={() => setEditingPostId(null)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
