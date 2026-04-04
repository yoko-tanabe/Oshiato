'use client';

import { useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useCurrentUser } from '@/lib/user/useCurrentUser';
import LoadingSpinner from '@/components/ui/LoadingSpinner/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import styles from './TimelineGrid.module.css';

/* ---------- 型定義 ---------- */

interface TimelinePost {
  id: string;
  imageUrl: string;
  takenAt: string | null;
  createdAt: string;
  oshiName: string | null;
}

interface MonthGroup {
  key: string;      // "2026-04"
  label: string;    // "2026年4月"
  posts: TimelinePost[];
}

/* ---------- ヘルパー ---------- */

/** 投稿を月ごとにグループ化する */
function groupByMonth(posts: TimelinePost[]): MonthGroup[] {
  const map = new Map<string, TimelinePost[]>();

  for (const post of posts) {
    const date = new Date(post.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const group = map.get(key) ?? [];
    group.push(post);
    map.set(key, group);
  }

  return Array.from(map.entries()).map(([key, groupPosts]) => {
    const [year, month] = key.split('-');
    return { key, label: `${year}年${Number(month)}月`, posts: groupPosts };
  });
}

/** 日付を "M/D" 形式にフォーマット */
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/* ---------- コンポーネント ---------- */

export default function TimelineGrid() {
  const router = useRouter();
  const { userId, isLoading: isUserLoading } = useCurrentUser();
  const [monthGroups, setMonthGroups] = useState<MonthGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading || !userId) return;

    async function fetchTimeline() {
      // ① 自分の投稿を新しい順に取得
      const { data: posts } = await supabase
        .from('posts')
        .select('id, oshi_id, taken_at, created_at')
        .eq('user_id', userId!)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!posts || posts.length === 0) {
        setIsLoading(false);
        return;
      }

      const postIds = posts.map((p) => p.id);
      const oshiIds = [...new Set(posts.map((p) => p.oshi_id))];

      // ② サムネイル画像と推し名を並行取得
      const [{ data: images }, { data: oshis }] = await Promise.all([
        supabase
          .from('post_images')
          .select('post_id, image_url')
          .in('post_id', postIds)
          .eq('display_order', 0),
        supabase
          .from('oshis')
          .select('id, name')
          .in('id', oshiIds),
      ]);

      // post_id → image_url のマップ
      const imageMap = new Map<string, string>();
      images?.forEach((img) => imageMap.set(img.post_id, img.image_url));

      // oshi_id → name のマップ
      const oshiMap = new Map<string, string>();
      oshis?.forEach((o) => oshiMap.set(o.id, o.name));

      // ③ TimelinePost に変換
      const timelinePosts: TimelinePost[] = posts
        .filter((p) => imageMap.has(p.id))  // 画像がない投稿はスキップ
        .map((p) => ({
          id: p.id,
          imageUrl: imageMap.get(p.id)!,
          takenAt: p.taken_at,
          createdAt: p.created_at,
          oshiName: oshiMap.get(p.oshi_id) ?? null,
        }));

      // ④ 月ごとにグループ化
      setMonthGroups(groupByMonth(timelinePosts));
      setIsLoading(false);
    }

    fetchTimeline();
  }, [userId, isUserLoading]);

  /* --- ローディング --- */
  if (isLoading || isUserLoading) {
    return <LoadingSpinner size="large" />;
  }

  /* --- 投稿なし --- */
  if (monthGroups.length === 0) {
    return (
      <EmptyState
        icon={<Camera size={48} strokeWidth={1.5} />}
        message="まだ投稿がありません"
        description="写真を投稿すると、ここに表示されます"
        actionLabel="投稿する"
        onAction={() => router.push('/post/new')}
      />
    );
  }

  /* --- タイムライングリッド --- */
  return (
    <div className={styles.wrapper}>
      {monthGroups.map((group) => (
        <section key={group.key}>
          <h2 className={styles.monthHeader}>{group.label}</h2>
          <div className={styles.grid}>
            {group.posts.map((post) => (
              <div key={post.id} className={styles.tile}>
                <img
                  className={styles.tileImage}
                  src={post.imageUrl}
                  alt={post.oshiName ?? '投稿写真'}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className={styles.dateOverlay}>
                  {formatDate(post.takenAt ?? post.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
