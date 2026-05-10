'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './register-form.module.css';

export default function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError('パスワードが一致しません');
      return;
    }

    setIsLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({ email, password });

    if (authError) {
      setError('登録に失敗しました。しばらく経ってからもう一度お試しください');
      setIsLoading(false);
      return;
    }

    router.push('/setup-profile');
    router.refresh();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h1 className={styles.title}>新規登録</h1>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="email">メールアドレス</label>
        <input
          id="email"
          type="email"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@mail.com"
          required
          autoComplete="email"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="password">パスワード（6文字以上）</label>
        <input
          id="password"
          type="password"
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="パスワード"
          required
          autoComplete="new-password"
          minLength={6}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="password-confirm">パスワード（確認）</label>
        <input
          id="password-confirm"
          type="password"
          className={styles.input}
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          placeholder="パスワードを再入力"
          required
          autoComplete="new-password"
          minLength={6}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button type="submit" className={styles.button} disabled={isLoading}>
        {isLoading ? '登録中...' : 'アカウントを作成'}
      </button>

      <p className={styles.link}>
        すでにアカウントをお持ちの方は{' '}
        <a href="/auth/login" className={styles.anchor}>ログイン</a>
      </p>
    </form>
  );
}
