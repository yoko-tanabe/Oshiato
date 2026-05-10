import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // セッションを更新する（トークンの自動リフレッシュ）
  // getUser() を呼ぶことでセッションの有効性を検証する
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthPage = pathname.startsWith('/auth');
  const isSetupProfilePage = pathname === '/setup-profile';

  // 未認証ユーザーを /auth/login にリダイレクト
  if (!user && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // 認証済みユーザーが /auth/* にアクセスした場合はホームへ転送
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // プロフィール未設定ユーザーを /setup-profile に転送
  // （/setup-profile 自身へのアクセスは除外）
  if (user && !isSetupProfilePage && !isAuthPage) {
    const { data: profile } = await supabase
      .from('users')
      .select('profile_completed')
      .eq('id', user.id)
      .single();

    if (profile && !profile.profile_completed) {
      const url = request.nextUrl.clone();
      url.pathname = '/setup-profile';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
