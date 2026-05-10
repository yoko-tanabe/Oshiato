'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import styles from './logout-button.module.css';

export default function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  }

  return (
    <button
      className={styles.button}
      onClick={handleLogout}
      disabled={isLoading}
    >
      <LogOut size={16} strokeWidth={1.5} />
      {isLoading ? 'ログアウト中...' : 'ログアウト'}
    </button>
  );
}
