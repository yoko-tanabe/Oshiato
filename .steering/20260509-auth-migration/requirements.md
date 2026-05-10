# Phase B 要件定義: 認証基盤

| 項目 | 内容 |
|------|------|
| 作業ディレクトリ | `.steering/20260509-auth-migration/` |
| 対応フェーズ | Phase B |
| 作成日 | 2026-05-09 |
| 前提条件 | Phase A 完了（commit: 4c7bc20） |

---

## 1. 背景と目的

現在のユーザー識別は `localStorage` に保存した `device_id`（`crypto.randomUUID()`）に依存している。
この仕組みには以下の問題がある：

| 問題 | 影響 |
|------|------|
| ブラウザのストレージをクリアするとユーザーが消える | データ消失 |
| 複数デバイス・ブラウザをまたいだ利用不可 | UX劣化 |
| 他ユーザーのデータへのアクセスを制御できない | セキュリティ欠陥 |
| Phase C 以降の「自分のデータ」系機能が作れない | 開発ブロッカー |

**目的**: Supabase Auth（JWT ベース）に移行し、上記をすべて解消する。

---

## 2. スコープ（作るもの）

### 2.1 認証フロー

| 機能 | 説明 |
|------|------|
| メール/パスワード登録 | 新規ユーザーがメールアドレスとパスワードで登録できる |
| メール/パスワードログイン | 既存ユーザーがログインできる |
| ログアウト | ログイン状態を破棄できる |
| セッション維持 | ブラウザリロード後もログイン状態が維持される |
| 認証コールバック | メール確認リンク・OAuth（将来）を処理するルート |

### 2.2 アクセス制御

| 機能 | 説明 |
|------|------|
| 保護ルート | 未認証ユーザーが `/` 等にアクセスすると `/auth/login` にリダイレクト |
| RLS（行レベルセキュリティ） | 他ユーザーのデータを編集・削除できないようDBで制御 |

### 2.3 プロフィール初期設定

| 機能 | 説明 |
|------|------|
| 初回ログイン後のプロフィール設定 | 匿名ネーム・アバター（任意）を設定する画面 |

### 2.4 データ移行

**開発中のデータは破棄する。** `device_id` ベースで作成した既存データ（投稿・推し・チェックイン）はすべて削除し、Supabase Auth 移行後に新しく作り直す。
移行スクリプトは不要。

---

## 3. スコープ外（このPhaseでは作らない）

| 項目 | 理由 |
|------|------|
| Google/Apple OAuth | **iOS版（Phase I）でスコープイン予定**。Web版では `/auth/callback` ルートの骨格のみ用意し、実装は行わない |
| パスワードリセット | Phase B では省略。後続フェーズで追加 |
| メール確認フロー | 開発中は確認をスキップする設定で進める |
| 2要素認証 | Phase J 以降 |

---

## 4. 完了基準

- [ ] メール/パスワードでサインアップ・ログイン・ログアウトができる
- [ ] 未認証状態で `/` にアクセスすると `/auth/login` にリダイレクトされる
- [ ] ブラウザリロードしてもログイン状態が維持される
- [ ] ログイン後、自分の投稿・推し・チェックイン履歴が表示される
- [ ] 他ユーザーのデータが編集・削除できないこと（RLS で制御）
- [ ] TypeScript 型エラーなし（`npx next build`）
- [ ] ESLint 警告なし（`npx next lint`）
- [ ] ブラウザコンソールエラーなし

---

## 5. 影響範囲（事前把握）

### 変更対象ファイル

| ファイル | 変更内容 |
|----------|---------|
| `apps/web/lib/supabase/client.ts` | `@supabase/ssr` の `createBrowserClient` に移行 |
| `apps/web/lib/supabase/server.ts` | `@supabase/ssr` の `createServerClient` に移行（Cookie 対応） |
| `apps/web/lib/user/useCurrentUser.ts` | Supabase Auth の `getUser()` を使う実装に全面改修 |
| `apps/web/lib/user/getOrCreateUser.ts` | **廃止** |
| `apps/web/middleware.ts` | **新規作成**。未認証リダイレクト |

### 新規作成ファイル

| ファイル | 内容 |
|----------|------|
| `apps/web/app/auth/login/page.tsx` | ログインページ |
| `apps/web/app/auth/register/page.tsx` | 新規登録ページ |
| `apps/web/app/auth/callback/route.ts` | Auth コールバックルート |
| `apps/web/app/setup-profile/page.tsx` | プロフィール初期設定ページ |
| `apps/web/components/auth/LoginForm/LoginForm.tsx` | ログインフォームコンポーネント |
| `apps/web/components/auth/RegisterForm/RegisterForm.tsx` | 登録フォームコンポーネント |
| `apps/web/components/auth/LoginForm/login-form.module.css` | スタイル |
| `apps/web/components/auth/RegisterForm/register-form.module.css` | スタイル |

### `useCurrentUser` の切り替えが必要なコンポーネント

| ファイル | 変更内容 |
|----------|---------|
| `components/map/MapView/MapView.tsx` | `useCurrentUser` の戻り値型変更に追従 |
| `components/post/PostForm/PostForm.tsx` | 同上 |
| `components/spot/CheckInButton/CheckInButton.tsx` | 同上 |
| `components/oshi/AddOshiForm/AddOshiForm.tsx` | 同上 |
| `lib/supabase/checkins.ts` | `userId` を `auth.uid()` 由来の値に統一 |
| `lib/supabase/spots.ts` | 同上 |

### DB 変更

| 変更 | 内容 |
|------|------|
| `users` テーブル移行 | `device_id` カラムを廃止し `auth.users.id` を外部キーとして参照 |
| 全テーブルへの RLS 適用 | `spots`, `post_images`, `checkins`, `user_oshis` に RLS ポリシーを設定 |
