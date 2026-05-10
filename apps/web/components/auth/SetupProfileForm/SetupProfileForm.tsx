'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './setup-profile-form.module.css';

export default function SetupProfileForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = displayName.trim();
    if (!trimmed) {
      setError('ニックネームを入力してください');
      return;
    }
    if (trimmed.length > 20) {
      setError('ニックネームは20文字以内で入力してください');
      return;
    }

    setIsLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('ログイン情報が取得できませんでした。再度ログインしてください');
      setIsLoading(false);
      return;
    }

    // users テーブルに upsert（Phase B の DB 移行後に有効になる）
    const { error: dbError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        display_name: trimmed,
        profile_completed: true,
      });

    if (dbError) {
      setError('プロフィールの保存に失敗しました');
      setIsLoading(false);
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <h1 className={styles.title}>ニックネームを設定</h1>
        <p className={styles.description}>
          投稿や活動に使う匿名ネームを決めましょう。<br />
          後から変更できます。
        </p>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="display-name">
          ニックネーム（20文字以内）
        </label>
        <input
          id="display-name"
          type="text"
          className={styles.input}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="例：推し活たろう"
          required
          maxLength={20}
          autoComplete="off"
          autoFocus
        />
        <span className={styles.count}>{displayName.trim().length} / 20</span>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button type="submit" className={styles.button} disabled={isLoading}>
        {isLoading ? '保存中...' : 'はじめる'}
      </button>
    </form>
  );
}
