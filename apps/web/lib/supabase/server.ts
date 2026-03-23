import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// サーバー用クライアント
// Server Components・Route Handlers・Server Actions から使用する
// ※ リクエストごとに新しいインスタンスを生成する
export function createServerClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}
