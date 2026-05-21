# ゲストユーザー機能 タスクリスト

## Step 0: 前提作業（手動・Supabase ダッシュボード）

- [ ] Authentication → Sign In / Providers → **Anonymous sign-ins を ON**
- [ ] （後で確認）`users`/`check_ins`/`visit_logs`/`post_images` の RLS が匿名（authenticated）で通るか

## Step 1: ステアリングドキュメント

- [x] `.steering/20260521-guest-user/requirements.md`
- [x] `.steering/20260521-guest-user/design.md`
- [x] `.steering/20260521-guest-user/decision.md`
- [x] `.steering/20260521-guest-user/tasklist.md`

## Step 2: ゲストモード用ヘルパー

- [ ] `apps/web/lib/supabase/guest-mode.ts` 作成（`signInAsGuest`）

## Step 3: middleware に組み込み（GUEST-MODE マーカー）

- [ ] `apps/web/lib/supabase/middleware.ts` 変更
  - 未ログイン → `signInAsGuest` で通す（失敗時のみ /auth/login）
  - `/auth/*` ガードに `!user.is_anonymous`
  - profile_completed ガードに `!user.is_anonymous`

## Step 4: useCurrentUser

- [ ] `apps/web/lib/user/useCurrentUser.ts` に `isAnonymous` 追加

## Step 5: マイページ UI 出し分け

- [ ] `apps/web/components/mypage/MyPageClient/MyPageClient.tsx`
  - ゲスト時: LogoutButton 非表示 + 会員登録/ログイン CTA

## Step 6: 検証

- [ ] `cd apps/web && npm run lint`
- [ ] `cd apps/web && npm run type-check`
- [ ] `cd apps/web && npm run build`
- [ ] ゲスト閲覧（Cookie 削除 → / が見える、login に飛ばない）
- [ ] ゲスト書き込み（投稿・チェックイン・推し登録・マイページ統計）
- [ ] /setup-profile に強制遷移しない
- [ ] ゲストから /auth/login に行ける／ログインで切り替わる
- [ ] 正規ログイン済みは /auth/login → / に弾かれる（従来維持）
- [ ] ゲスト時のみ会員登録 CTA が出る

## Step 7: 条件付き（RLS で弾かれた場合のみ）

- [ ] `supabase/20260521_guest_user_rls.sql` 作成・SQL Editor で実行
