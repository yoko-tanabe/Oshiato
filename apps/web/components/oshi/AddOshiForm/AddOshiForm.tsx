'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import styles from './AddOshiForm.module.css';

// よく使う推しカラーの候補
const PRESET_COLORS = [
  '#c4b5fd', // Lavender
  '#f9a8d4', // Pink
  '#86efac', // Mint
  '#7dd3fc', // Sky
  '#fcd34d', // Yellow
  '#fb923c', // Orange
  '#f87171', // Red
  '#a3e635', // Lime
];

type Props = {
  userId: string;
  onAdded: () => void; // 追加完了後に親へ通知（一覧を再取得するため）
};

export default function AddOshiForm({ userId, onAdded }: Props) {
  const [name, setName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [themeColor, setThemeColor] = useState(PRESET_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    // 1. oshisテーブルに推しを登録
    const { data: oshi, error: oshiError } = await supabase
      .from('oshis')
      .insert({ name: name.trim(), group_name: groupName.trim() || null })
      .select('id')
      .single();

    if (oshiError || !oshi) {
      setError('推しの登録に失敗しました');
      setIsSubmitting(false);
      return;
    }

    // 2. user_oshisテーブルでユーザーと紐付け
    const { error: linkError } = await supabase
      .from('user_oshis')
      .insert({ user_id: userId, oshi_id: oshi.id, theme_color: themeColor });

    if (linkError) {
      setError('推しの紐付けに失敗しました');
      setIsSubmitting(false);
      return;
    }

    // フォームをリセットして親に通知
    setName('');
    setGroupName('');
    setThemeColor(PRESET_COLORS[0]);
    setIsSubmitting(false);
    onAdded();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>推しを追加</h2>

      <label className={styles.label}>
        推しの名前 <span className={styles.required}>*</span>
        <input
          className={styles.input}
          type="text"
          placeholder="例：田中花子"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
        />
      </label>

      <label className={styles.label}>
        グループ名（任意）
        <input
          className={styles.input}
          type="text"
          placeholder="例：○○○48"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          maxLength={50}
        />
      </label>

      <div className={styles.label}>
        テーマカラー
        <div className={styles.colorGrid}>
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`${styles.colorButton} ${themeColor === color ? styles.selected : ''}`}
              style={{ background: color }}
              onClick={() => setThemeColor(color)}
              aria-label={color}
            />
          ))}
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button
        className={styles.submit}
        type="submit"
        disabled={!name.trim() || isSubmitting}
      >
        {isSubmitting ? '追加中...' : '追加する'}
      </button>
    </form>
  );
}
