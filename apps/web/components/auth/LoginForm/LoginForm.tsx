'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './login-form.module.css';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError('メールアドレスまたはパスワードが正しくありません');
      setIsLoading(false);
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h1 className={styles.title}>ログイン</h1>

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
        <label className={styles.label} htmlFor="password">パスワード</label>
        <input
          id="password"
          type="password"
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="パスワード"
          required
          autoComplete="current-password"
          minLength={6}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button type="submit" className={styles.button} disabled={isLoading}>
        {isLoading ? 'ログイン中...' : 'ログイン'}
      </button>

      <p className={styles.link}>
        アカウントをお持ちでない方は{' '}
        <a href="/auth/register" className={styles.anchor}>新規登録</a>
      </p>
    </form>
  );
}
