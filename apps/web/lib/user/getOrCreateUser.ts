import { supabase } from '@/lib/supabase/client';

const STORAGE_KEY = 'oshiato_user_id';

/**
 * localStorageからユーザーIDを取得する。
 * 存在しない場合はSupabaseにデバイスユーザーを新規作成して保存する。
 */
export async function getOrCreateUser(): Promise<string> {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return stored;

  const deviceId = crypto.randomUUID();

  const { data, error } = await supabase
    .from('users')
    .insert({ device_id: deviceId })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(`ユーザーの作成に失敗しました: ${error?.message}`);
  }

  localStorage.setItem(STORAGE_KEY, data.id);
  return data.id;
}
