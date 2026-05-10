'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useCurrentUser } from '@/lib/user/useCurrentUser';
import { useToast } from '@/components/ui/Toast/ToastProvider';
import LoadingSpinner from '@/components/ui/LoadingSpinner/LoadingSpinner';
import styles from './profile-edit-form.module.css';

const MAX_LENGTH = 20;

export default function ProfileEditForm() {
  const { userId, displayName: currentDisplayName, isLoading } = useCurrentUser();

  if (isLoading) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <ProfileEditFormInner
      userId={userId!}
      initialDisplayName={currentDisplayName ?? ''}
    />
  );
}

interface FormProps {
  userId: string;
  initialDisplayName: string;
}

function ProfileEditFormInner({ userId, initialDisplayName }: FormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setError(null);

    const trimmed = displayName.trim();
    if (!trimmed) {
      setError('ニックネームを入力してください');
      return;
    }
    if (trimmed.length > MAX_LENGTH) {
      setError(`ニックネームは${MAX_LENGTH}文字以内で入力してください`);
      return;
    }

    setIsSaving(true);

    const supabase = createClient();
    const { error: dbError } = await supabase
      .from('users')
      .update({ display_name: trimmed })
      .eq('id', userId);

    if (dbError) {
      setError('保存に失敗しました。もう一度お試しください');
      setIsSaving(false);
      return;
    }

    showToast('success', '保存しました');
    router.push('/mypage');
    router.refresh();
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>
        <h1 className={styles.title}>プロフィール編集</h1>
      </header>

      <form className={styles.form} onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="display-name">
            ニックネーム
          </label>
          <input
            id="display-name"
            type="text"
            className={styles.input}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="例：推し活たろう"
            maxLength={MAX_LENGTH}
            autoComplete="off"
          />
          <span className={styles.count}>
            {displayName.trim().length} / {MAX_LENGTH}
          </span>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button
          type="submit"
          className={styles.saveButton}
          disabled={isSaving || !displayName.trim()}
        >
          {isSaving ? '保存中...' : '保存する'}
        </button>
      </form>
    </div>
  );
}
