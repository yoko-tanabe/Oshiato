'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface CurrentUser {
  userId: string | null;
  displayName: string | null;
  isLoading: boolean;
  isAnonymous: boolean; // GUEST-MODE: 匿名（ゲスト）ユーザーかどうか
}

export function useCurrentUser(): CurrentUser {
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false); // GUEST-MODE

  useEffect(() => {
    const supabase = createClient();

    // GUEST-MODE: isAnon 引数を追加（撤去時は引数と setIsAnonymous を削除）
    async function loadUser(uid: string | null, isAnon: boolean) {
      setIsAnonymous(isAnon); // GUEST-MODE
      if (!uid) {
        setUserId(null);
        setDisplayName(null);
        setIsLoading(false);
        return;
      }
      const { data: profile } = await supabase
        .from('users')
        .select('display_name')
        .eq('id', uid)
        .single();
      setUserId(uid);
      // GUEST-MODE: display_name 未取得のゲストは「ゲスト」と表示
      setDisplayName(profile?.display_name ?? (isAnon ? 'ゲスト' : null));
      setIsLoading(false);
    }

    supabase.auth.getUser().then(({ data }) => {
      loadUser(data.user?.id ?? null, data.user?.is_anonymous ?? false); // GUEST-MODE
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUser(session?.user.id ?? null, session?.user?.is_anonymous ?? false); // GUEST-MODE
    });

    return () => subscription.unsubscribe();
  }, []);

  return { userId, displayName, isLoading, isAnonymous }; // GUEST-MODE: isAnonymous
}
