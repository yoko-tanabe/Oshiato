'use client';

// GUEST-MODE: ゲスト（匿名）ユーザー向けの会員登録／ログイン案内バナー。
// この機能は「後でコードごと撤去する前提」。撤去時はこのフォルダ
// （GuestUpgradeBanner/）ごと削除し、呼び出し元の行も消すこと。

import Link from 'next/link';
import { useCurrentUser } from '@/lib/user/useCurrentUser';
import styles from './guest-upgrade-banner.module.css';

export default function GuestUpgradeBanner() {
  const { isAnonymous, isLoading } = useCurrentUser();

  // ゲスト以外（正規ユーザー・読込中）には何も表示しない
  if (isLoading || !isAnonymous) return null;

  return (
    <div className={styles.banner}>
      <p className={styles.text}>
        ゲストモードで利用中です。会員登録すると、機種変更や別の端末でもデータを引き継げます。
      </p>
      <div className={styles.actions}>
        <Link href="/auth/register" className={styles.register}>
          会員登録する
        </Link>
        <Link href="/auth/login" className={styles.login}>
          ログイン
        </Link>
      </div>
    </div>
  );
}
