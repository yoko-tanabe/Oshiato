'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User } from 'lucide-react';
import { useCurrentUser } from '@/lib/user/useCurrentUser';
import { createClient } from '@/lib/supabase/client';
import LoadingSpinner from '@/components/ui/LoadingSpinner/LoadingSpinner';
import LogoutButton from '@/components/ui/LogoutButton/LogoutButton';
import styles from './my-page-client.module.css';

type OshiStat = {
  oshiId: string;
  name: string;
  color: string;
  postCount: number;
};

type UserOshiRow = {
  oshi_id: string;
  theme_color: string;
  oshis: { name: string } | null;
};

export default function MyPageClient() {
  const { userId, displayName, isLoading: isUserLoading } = useCurrentUser();
  const [postCount, setPostCount] = useState(0);
  const [visitCount, setVisitCount] = useState(0);
  const [oshiStats, setOshiStats] = useState<OshiStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading || !userId) return;

    async function fetchStats() {
      const supabase = createClient();

      const [
        { count: postTotal },
        { count: visitTotal },
        { data: postsByOshi },
      ] = await Promise.all([
        supabase
          .from('posts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId!)
          .eq('status', 'active'),
        supabase
          .from('visit_logs')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId!),
        supabase
          .from('posts')
          .select('oshi_id')
          .eq('user_id', userId!)
          .eq('status', 'active'),
      ]);

      setPostCount(postTotal ?? 0);
      setVisitCount(visitTotal ?? 0);

      if (postsByOshi && postsByOshi.length > 0) {
        // oshi_id ごとにカウント（JS側で集計）
        const countMap = new Map<string, number>();
        for (const { oshi_id } of postsByOshi) {
          countMap.set(oshi_id, (countMap.get(oshi_id) ?? 0) + 1);
        }

        const oshiIds = [...countMap.keys()];
        const { data: userOshis } = await supabase
          .from('user_oshis')
          .select('oshi_id, theme_color, oshis(name)')
          .eq('user_id', userId!)
          .in('oshi_id', oshiIds)
          .returns<UserOshiRow[]>();

        const stats: OshiStat[] = (userOshis ?? [])
          .map((row) => ({
            oshiId: row.oshi_id,
            name: row.oshis?.name ?? '不明',
            color: row.theme_color,
            postCount: countMap.get(row.oshi_id) ?? 0,
          }))
          .sort((a, b) => b.postCount - a.postCount);

        setOshiStats(stats);
      }

      setIsLoading(false);
    }

    fetchStats();
  }, [userId, isUserLoading]);

  if (isUserLoading || isLoading) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <div className={styles.page}>
      {/* プロフィールヘッダー */}
      <div className={styles.header}>
        <div className={styles.profileRow}>
          <div className={styles.avatar}>
            <User size={28} strokeWidth={1.5} color="var(--color-accent-primary)" />
          </div>
          <div className={styles.profileInfo}>
            <p className={styles.displayName}>{displayName ?? 'ユーザー'}</p>
            <Link href="/mypage/profile" className={styles.editLink}>
              プロフィールを編集
            </Link>
          </div>
        </div>
        <LogoutButton />
      </div>

      {/* 統計カード */}
      <section className={styles.statsSection}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{postCount}</span>
          <span className={styles.statLabel}>投稿</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{visitCount}</span>
          <span className={styles.statLabel}>訪問</span>
        </div>
      </section>

      {/* 推し別スポット数 */}
      {oshiStats.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>推し別スポット</h2>
          <ul className={styles.oshiList}>
            {oshiStats.map((stat) => (
              <li key={stat.oshiId} className={styles.oshiItem}>
                <span className={styles.oshiDot} style={{ background: stat.color }} />
                <span className={styles.oshiName}>{stat.name}</span>
                <span className={styles.oshiCount}>{stat.postCount}件</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 推し管理へ */}
      <Link href="/oshi" className={styles.navButton}>
        推し管理
      </Link>
    </div>
  );
}
