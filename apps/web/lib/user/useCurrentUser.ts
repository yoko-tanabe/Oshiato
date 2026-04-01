'use client';

import { useEffect, useState } from 'react';
import { getOrCreateUser } from './getOrCreateUser';

/**
 * 現在のユーザーIDを取得するカスタムフック。
 * Phase 3で本認証に移行する際はこのフックを書き替えるだけで対応できる。
 */
export function useCurrentUser(): { userId: string | null; isLoading: boolean } {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getOrCreateUser()
      .then((id) => setUserId(id))
      .finally(() => setIsLoading(false));
  }, []);

  return { userId, isLoading };
}
