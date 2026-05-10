import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ブラウザ用クライアント
// 'use client' コンポーネントやカスタムフックから使用する
// ※ シングルトンではなく関数呼び出しにする（SSR時のモジュール評価タイミング問題を回避）
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
