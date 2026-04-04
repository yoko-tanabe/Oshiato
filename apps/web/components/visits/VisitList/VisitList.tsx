'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useCurrentUser } from '@/lib/user/useCurrentUser';
import LoadingSpinner from '@/components/ui/LoadingSpinner/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import styles from './VisitList.module.css';

/* ---------- 型定義 ---------- */

interface VisitItem {
  id: string;
  spotId: string;
  address: string | null;
  oshiName: string | null;
  oshiColor: string;
  visitedAt: string;
  source: 'checkin' | 'exif' | 'manual';
}

interface MonthGroup {
  key: string;
  label: string;
  visits: VisitItem[];
}

/* ---------- ヘルパー ---------- */

const SOURCE_LABEL: Record<string, string> = {
  exif: '写真',
  checkin: 'チェックイン',
  manual: '手動',
};

function groupByMonth(visits: VisitItem[]): MonthGroup[] {
  const map = new Map<string, VisitItem[]>();

  for (const visit of visits) {
    const date = new Date(visit.visitedAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const group = map.get(key) ?? [];
    group.push(visit);
    map.set(key, group);
  }

  return Array.from(map.entries()).map(([key, groupVisits]) => {
    const [year, month] = key.split('-');
    return { key, label: `${year}年${Number(month)}月`, visits: groupVisits };
  });
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/* ---------- コンポーネント ---------- */

export default function VisitList() {
  const { userId, isLoading: isUserLoading } = useCurrentUser();
  const [monthGroups, setMonthGroups] = useState<MonthGroup[]>([]);
  const [totalVisits, setTotalVisits] = useState(0);
  const [uniqueSpots, setUniqueSpots] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading || !userId) return;

    async function fetchVisits() {
      // ① visit_logs を取得
      const { data: logs } = await supabase
        .from('visit_logs')
        .select('id, spot_id, oshi_id, visited_at, source')
        .eq('user_id', userId!)
        .order('visited_at', { ascending: false })
        .limit(200);

      if (!logs || logs.length === 0) {
        setIsLoading(false);
        return;
      }

      const spotIds = [...new Set(logs.map((l) => l.spot_id))];
      const oshiIds = [...new Set(logs.map((l) => l.oshi_id))];

      // ② spots, oshis, user_oshis を並行取得
      const [{ data: spots }, { data: oshis }, { data: userOshis }] = await Promise.all([
        supabase
          .from('spots')
          .select('id, address')
          .in('id', spotIds),
        supabase
          .from('oshis')
          .select('id, name')
          .in('id', oshiIds),
        supabase
          .from('user_oshis')
          .select('oshi_id, theme_color')
          .eq('user_id', userId!)
          .in('oshi_id', oshiIds),
      ]);

      // マップ作成
      const addressMap = new Map<string, string | null>();
      spots?.forEach((s) => addressMap.set(s.id, s.address));

      const nameMap = new Map<string, string>();
      oshis?.forEach((o) => nameMap.set(o.id, o.name));

      const colorMap = new Map<string, string>();
      userOshis?.forEach((u) => colorMap.set(u.oshi_id, u.theme_color));

      // ③ VisitItem に変換
      const visitItems: VisitItem[] = logs.map((log) => ({
        id: log.id,
        spotId: log.spot_id,
        address: addressMap.get(log.spot_id) ?? null,
        oshiName: nameMap.get(log.oshi_id) ?? null,
        oshiColor: colorMap.get(log.oshi_id) ?? '#c4b5fd',
        visitedAt: log.visited_at,
        source: log.source,
      }));

      // ④ サマリーとグループ化
      setTotalVisits(visitItems.length);
      setUniqueSpots(spotIds.length);
      setMonthGroups(groupByMonth(visitItems));
      setIsLoading(false);
    }

    fetchVisits();
  }, [userId, isUserLoading]);

  /* --- ローディング --- */
  if (isLoading || isUserLoading) {
    return <LoadingSpinner size="large" />;
  }

  /* --- 訪問なし --- */
  if (monthGroups.length === 0) {
    return (
      <EmptyState
        icon={<MapPin size={48} strokeWidth={1.5} />}
        message="まだ訪問記録がありません"
        description="写真を投稿すると、訪問が自動で記録されます"
      />
    );
  }

  /* --- 訪問ログ一覧 --- */
  return (
    <div className={styles.wrapper}>
      {/* サマリー */}
      <div className={styles.summary}>
        <span className={styles.summaryItem}>
          <strong>{uniqueSpots}</strong> スポット
        </span>
        <span className={styles.summaryDot} />
        <span className={styles.summaryItem}>
          <strong>{totalVisits}</strong> 回訪問
        </span>
      </div>

      {/* 月別リスト */}
      {monthGroups.map((group) => (
        <section key={group.key}>
          <h2 className={styles.monthHeader}>{group.label}</h2>
          <ul className={styles.list}>
            {group.visits.map((visit) => (
              <li key={visit.id}>
                <Link href={`/spot/${visit.spotId}`} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <span
                      className={styles.oshiDot}
                      style={{ background: visit.oshiColor }}
                    />
                    <span className={styles.oshiName}>
                      {visit.oshiName ?? '不明'}
                    </span>
                    <span className={`${styles.sourceBadge} ${styles[`source_${visit.source}`]}`}>
                      {SOURCE_LABEL[visit.source] ?? visit.source}
                    </span>
                  </div>
                  <p className={styles.address}>
                    {visit.address ?? '住所不明'}
                  </p>
                  <p className={styles.date}>
                    {formatDateTime(visit.visitedAt)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
