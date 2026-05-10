import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// メール確認リンクや OAuth コールバックを処理するルート。
// Phase B では Email/Password 認証でも経由する。
// Phase I で Google/Apple OAuth を追加するときは、このファイルを拡張する。
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // code がない・エラーの場合はログインへ
  return NextResponse.redirect(`${origin}/auth/login`);
}
