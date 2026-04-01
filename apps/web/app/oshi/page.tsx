'use client';

import { useEffect, useState } from 'react';
import { useCurrentUser } from '@/lib/user';
import { supabase } from '@/lib/supabase/client';
import OshiCard from '@/components/oshi/OshiCard/OshiCard';
import AddOshiForm from '@/components/oshi/AddOshiForm/AddOshiForm';
import styles from './page.module.css';

type OshiItem = {
  oshi_id: string;
  name: string;
  group_name: string | null;
  theme_color: string;
};

// Supabase JOIN クエリの戻り値の型
type UserOshiRow = {
  oshi_id: string;
  theme_color: string;
  oshis: { name: string; group_name: string | null } | null;
};

export default function OshiPage() {
  const { userId, isLoading } = useCurrentUser();
  const [oshiList, setOshiList] = useState<OshiItem[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    supabase
      .from('user_oshis')
      .select('oshi_id, theme_color, oshis(name, group_name)')
      .eq('user_id', userId)
      .order('display_order')
      .returns<UserOshiRow[]>()
      .then(({ data }) => {
        if (cancelled || !data) return;
        setOshiList(data.map((row) => ({
          oshi_id: row.oshi_id,
          name: row.oshis?.name ?? '',
          group_name: row.oshis?.group_name ?? null,
          theme_color: row.theme_color,
        })));
      });

    return () => { cancelled = true; };
  }, [userId, refreshKey]);

  if (isLoading) return null;

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>推し管理</h1>

      {oshiList.length === 0 ? (
        <p className={styles.empty}>まだ推しが登録されていません</p>
      ) : (
        <ul className={styles.list}>
          {oshiList.map((item) => (
            <li key={item.oshi_id}>
              <OshiCard
                name={item.name}
                groupName={item.group_name}
                themeColor={item.theme_color}
              />
            </li>
          ))}
        </ul>
      )}

      {userId && (
        <AddOshiForm
          userId={userId}
          onAdded={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </div>
  );
}
