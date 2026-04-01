'use client';

import { useCurrentUser } from '@/lib/user';
import TabBar from '@/components/ui/TabBar/TabBar';
import styles from './AppShell.module.css';

export default function AppShell({ children }: { children: React.ReactNode }) {
  // アプリ起動時に仮ユーザーIDを生成・保持する
  useCurrentUser();

  return (
    <div className={styles.shell}>
      <main className={styles.content}>{children}</main>
      <TabBar />
    </div>
  );
}
