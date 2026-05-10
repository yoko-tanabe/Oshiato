'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import LoadingSpinner from '@/components/ui/LoadingSpinner/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import styles from './UserProfile.module.css';

interface Props {
  userId: string;
}

type PublicPost = {
  id: string;
  spot_id: string;
  oshi_name: string | null;
  oshi_color: string;
  taken_at: string | null;
  thumbnail: string | null;
};

export default function UserProfile({ userId }: Props) {
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [posts, setPosts] = useState<PublicPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const supabase = createClient();

      // ユーザー基本情報を取得
      const { data: user } = await supabase
        .from('users')
        .select('display_name, avatar_url')
        .eq('id', userId)
        .single();

      if (!user) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setDisplayName(user.display_name);
      setAvatarUrl(user.avatar_url);

      // 公開投稿を取得（RLS により is_public=true のみ返る）
      const { data: rawPosts } = await supabase
        .from('posts')
        .select('id, spot_id, oshi_id, taken_at')
        .eq('user_id', userId)
        .eq('is_public', true)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!rawPosts || rawPosts.length === 0) {
        setIsLoading(false);
        return;
      }

      // 推し情報を取得
      const oshiIds = [...new Set(rawPosts.map((p) => p.oshi_id))];
      const { data: oshiRows } = await supabase
        .from('oshis')
        .select('id, name')
        .in('id', oshiIds);

      // 推しの色は user_oshis から取得（本人のみ閲覧可のため取得できない場合はデフォルト色）
      const oshiNameMap = new Map<string, string>();
      oshiRows?.forEach((o) => oshiNameMap.set(o.id, o.name));

      // サムネイルを取得
      const postIds = rawPosts.map((p) => p.id);
      const { data: images } = await supabase
        .from('post_images')
        .select('post_id, image_url')
        .in('post_id', postIds)
        .eq('display_order', 0);

      const thumbMap = new Map<string, string>();
      images?.forEach((img) => thumbMap.set(img.post_id, img.image_url));

      const publicPosts: PublicPost[] = rawPosts.map((p) => ({
        id: p.id,
        spot_id: p.spot_id,
        oshi_name: oshiNameMap.get(p.oshi_id) ?? null,
        oshi_color: '#aaaaaa',
        taken_at: p.taken_at,
        thumbnail: thumbMap.get(p.id) ?? null,
      }));

      setPosts(publicPosts);
      setIsLoading(false);
    }

    fetchProfile();
  }, [userId]);

  if (isLoading) {
    return <LoadingSpinner size="large" />;
  }

  if (notFound) {
    return (
      <div className={styles.page}>
        <EmptyState icon={<User size={32} />} message="ユーザーが見つかりません" />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* プロフィールヘッダー */}
      <div className={styles.header}>
        <div className={styles.avatarWrapper}>
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="アバター" className={styles.avatarImg} />
          ) : (
            <div className={styles.avatarFallback}>
              <User size={28} strokeWidth={1.5} color="var(--color-accent-primary)" />
            </div>
          )}
        </div>
        <p className={styles.displayName}>{displayName ?? 'ユーザー'}</p>
      </div>

      {/* 公開スポット一覧 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>公開スポット（{posts.length}件）</h2>
        {posts.length === 0 ? (
          <EmptyState icon={<MapPin size={32} />} message="公開されているスポットはありません" />
        ) : (
          <div className={styles.grid}>
            {posts.map((post) => (
              <Link key={post.id} href={`/spot/${post.spot_id}`} className={styles.card}>
                {post.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.thumbnail} alt="スポット写真" className={styles.thumb} />
                ) : (
                  <div className={styles.thumbEmpty} />
                )}
                {post.oshi_name && (
                  <span className={styles.oshiBadge}>{post.oshi_name}</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
