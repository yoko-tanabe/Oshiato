'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface CurrentUser {
  userId: string | null;
  displayName: string | null;
  isLoading: boolean;
}

export function useCurrentUser(): CurrentUser {
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function loadUser(uid: string | null) {
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
      setDisplayName(profile?.display_name ?? null);
      setIsLoading(false);
    }

    supabase.auth.getUser().then(({ data }) => {
      loadUser(data.user?.id ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUser(session?.user.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { userId, displayName, isLoading };
}
