// GUEST-MODE: ゲストユーザー機能（匿名認証）専用ヘルパー。
// この機能は「後でコードごと撤去する前提」。撤去時はこのファイルを丸ごと削除し、
// `grep -rn "GUEST-MODE" apps/web` で他の変更箇所も元に戻すこと。

import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Database } from './database.types';

/**
 * 匿名（ゲスト）ユーザーとしてサインインする。
 *
 * - Supabase の匿名認証で一時アカウントを発行し、本物の `auth.uid()` を割り当てる。
 *   これにより `user_id` を必須とする既存機能（投稿・チェックイン等）が無改修で動く。
 * - 表示名の表示と `/setup-profile` 強制回避のため、`users` テーブルへゲスト行を作る。
 *   この upsert が失敗してもログインフロー自体は止めない（エラーは握り潰す）。
 *
 * @returns 発行された匿名ユーザー。失敗時（匿名認証が無効など）は null。
 */
export async function signInAsGuest(
  supabase: SupabaseClient<Database>,
): Promise<User | null> {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) {
    return null;
  }

  await supabase.from('users').upsert({
    id: data.user.id,
    display_name: 'ゲスト',
    profile_completed: true,
  });

  return data.user;
}
