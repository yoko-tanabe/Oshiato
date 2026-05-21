import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from './database.types';
import { signInAsGuest } from './guest-mode'; // GUEST-MODE

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

  // GUEST-MODE: 未ログインなら匿名（ゲスト）サインインしてそのまま通す。
  // 成功すれば匿名セッションの Cookie を載せた supabaseResponse を返す（再帰リダイレクト回避）。
  // 失敗時（匿名認証が無効など）のみ従来どおり /auth/login へフォールバック。
  // 撤去時はこのブロックを元のコードに戻す:
  //   if (!user && !isAuthPage) { redirect('/auth/login') }
  if (!user) {
    const guestUser = await signInAsGuest(supabase);
    if (!guestUser && !isAuthPage) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // 認証済みユーザーが /auth/* にアクセスした場合はホームへ転送
  // GUEST-MODE: 匿名ユーザーは /auth/* に行ける（後から会員登録/ログイン可能）。
  //             撤去時は `!user.is_anonymous &&` を削除する。
  if (user && !user.is_anonymous && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // プロフィール未設定ユーザーを /setup-profile に転送
  // （/setup-profile 自身へのアクセスは除外）
  // GUEST-MODE: 匿名ユーザーは対象外。撤去時は `!user.is_anonymous &&` を削除する。
  if (user && !user.is_anonymous && !isSetupProfilePage && !isAuthPage) {
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
