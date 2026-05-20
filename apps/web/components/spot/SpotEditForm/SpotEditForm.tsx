'use client';

import { useState } from 'react';
import { updatePost } from '@/lib/supabase/spots';
import { useToast } from '@/components/ui/Toast/ToastProvider';
import styles from './spot-edit-form.module.css';

type Category = 'ooh' | 'popup' | 'event' | 'other';

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'ooh', label: '広告（OOH）' },
  { value: 'popup', label: 'ポップアップ' },
  { value: 'event', label: 'イベント' },
  { value: 'other', label: 'その他' },
];

interface SpotEditFormProps {
  postId: string;
  initialCategory: Category;
  initialComment: string;
  onSave: (updated: { category: Category; comment: string }) => void;
  onCancel: () => void;
}

export default function SpotEditForm({
  postId,
  initialCategory,
  initialComment,
  onSave,
  onCancel,
}: SpotEditFormProps) {
  const { showToast } = useToast();
  const [category, setCategory] = useState<Category>(initialCategory);
  const [comment, setComment] = useState(initialComment);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    const ok = await updatePost(postId, {
      category,
      comment: comment.trim() || null,
    });

    if (!ok) {
      showToast('error', '更新に失敗しました');
      setIsSaving(false);
      return;
    }

    showToast('success', '更新しました');
    onSave({ category, comment: comment.trim() });
  }

  return (
    <div className={styles.form}>
      {/* カテゴリ */}
      <div className={styles.field}>
        <label className={styles.label}>カテゴリ</label>
        <div className={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              className={`${styles.categoryButton} ${category === cat.value ? styles.categoryButtonActive : ''}`}
              onClick={() => setCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* コメント */}
      <div className={styles.field}>
        <label className={styles.label}>コメント（任意）</label>
        <textarea
          className={styles.textarea}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="推しの足跡についてひとこと..."
          maxLength={300}
          rows={3}
        />
        <span className={styles.count}>{comment.length} / 300</span>
      </div>

      {/* ボタン */}
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={onCancel}
          disabled={isSaving}
        >
          キャンセル
        </button>
        <button
          type="button"
          className={styles.saveButton}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? '保存中...' : '保存する'}
        </button>
      </div>
    </div>
  );
}
