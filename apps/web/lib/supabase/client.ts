import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ブラウザ用クライアント（シングルトン）
// 'use client' コンポーネントやカスタムフックから使用する
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
