# Phase B タスクリスト: 認証基盤

> 上から順に進める。各タスク完了後にチェックを入れること。
> DB 変更（STEP 7）は必ずローカル Supabase で確認してから本番適用すること。

---

## STEP 1: パッケージ追加

- [x] **B-1a** `@supabase/ssr` をインストールする
- [x] **B-1b** `package.json` に `@supabase/ssr` が追加されていることを確認する

---

## STEP 2: Supabase クライアント更新

- [x] **B-1c** `lib/supabase/client.ts` を `createBrowserClient` に書き換える
- [x] **B-1d** `lib/supabase/server.ts` を `createServerClient` + Cookie 対応に書き換える
- [x] **B-1e** `lib/supabase/middleware.ts` を新規作成する（セッション更新ロジック）

---

## STEP 3: 認証フック統一

- [x] **B-4a** `lib/user/useCurrentUser.ts` を `supabase.auth.getUser()` + `onAuthStateChange` ベースに全面改修する
- [x] **B-4b** `lib/user/getOrCreateUser.ts` を削除する
- [x] **B-4c** `lib/user/index.ts`（または barrel ファイル）の export を確認・更新する

---

## STEP 4: ミドルウェア（保護ルート）

- [x] **B-5a** `apps/web/middleware.ts` を新規作成する
- [x] **B-5b** `matcher` 設定を確認する（`/auth/*` と静的ファイルは除外）
- [x] **B-5c** ブラウザで未認証状態の `/` アクセスが `/auth/login` にリダイレクトされることを確認する

---

## STEP 5: 認証ページ

- [x] **B-2a** `components/auth/LoginForm/LoginForm.tsx` を作成する
- [x] **B-2b** `components/auth/LoginForm/login-form.module.css` を作成する
- [x] **B-2c** `app/auth/login/page.tsx` を作成する（LoginForm を呼び出すだけ）
- [x] **B-2d** ブラウザでログインフォームが表示されることを確認する
- [x] **B-2e** メール/パスワードでログインが成功することを確認する
- [x] **B-2f** `components/auth/RegisterForm/RegisterForm.tsx` を作成する
- [x] **B-2g** `components/auth/RegisterForm/register-form.module.css` を作成する
- [x] **B-2h** `app/auth/register/page.tsx` を作成する
- [x] **B-2i** 新規登録が成功することを確認する（開発中は Supabase ダッシュボードから手動作成で代替）
- [x] **B-3a** `app/auth/callback/route.ts` を作成する（`code` → セッション交換の骨格）
- [x] **B-8a** `app/setup-profile/page.tsx` を作成する（匿名ネーム入力 → `users` テーブル更新）

---

## STEP 6: `getOrCreateUser` 呼び出し元を修正

- [x] **B-4d** `components/map/MapView/MapView.tsx` の `getOrCreateUser()` 3 か所を `useCurrentUser()` に切り替える
- [x] **B-4e** `components/trajectory/TrajectoryMap/TrajectoryMap.tsx` の `getOrCreateUser()` 1 か所を `useCurrentUser()` に切り替える

---

## STEP 7: DB 変更（Supabase ダッシュボード）

- [x] **B-6a** 既存データを削除する（TRUNCATE CASCADE）
- [x] **B-6b** `users` テーブルから `device_id` カラムを削除し、`id` を `auth.users(id)` 参照に変更する
- [x] **B-6c** `users` テーブルに `display_name`, `avatar_url`, `profile_completed` カラムを追加する
- [x] **B-7a** `users` テーブルに RLS を有効化しポリシーを設定する
- [x] **B-7b** `spots` テーブルに RLS を有効化しポリシーを設定する
- [x] **B-7c** `check_ins` テーブルに RLS を有効化しポリシーを設定する
- [x] **B-7d** `post_images` テーブルに RLS を有効化しポリシーを設定する
- [x] **B-7e** `user_oshis` テーブルに RLS を有効化しポリシーを設定する
- [x] **B-7f** RLS 適用後に自分のデータが正しく取得・作成できることを確認する
- [x] **B-7g**（追加）`posts` / `visit_logs` テーブルに RLS を有効化しポリシーを設定する（当初リスト漏れ）
- [x] **B-7h**（追加）Supabase Storage `post-images` バケットにポリシーを設定する

---

## STEP 8: 最終確認

- [ ] `npx next build` がエラーなく通ること
- [x] `npx next lint` で警告がないこと
- [x] ブラウザコンソールにエラーがないこと
- [ ] モバイルサイズ（375px 幅）でログイン・登録画面が崩れないこと

---

## Phase B 完了基準チェック

- [x] メール/パスワードでサインアップができる
- [x] メール/パスワードでログインができる
- [x] ログアウトができる（/oshi ページの LogoutButton）
- [x] 未認証状態で `/` にアクセスすると `/auth/login` にリダイレクトされる
- [x] ブラウザリロードしてもログイン状態が維持される
- [x] ログイン後、自分の投稿・推し・チェックイン履歴が表示される
- [x] 他ユーザーのデータが編集・削除できないこと（RLS で制御）
