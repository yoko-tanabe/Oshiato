# Phase D タスクリスト

## D-1：投稿時の公開/非公開設定

- [x] DBマイグレーションSQL作成 (`supabase/20260510_add_is_public_to_posts.sql`)
- [x] `database.types.ts` に `is_public: boolean` 追加
- [x] `PostForm.tsx` に公開/非公開トグル追加
- [x] `PostForm.module.css` にトグルのスタイル追加

## D-2：他ユーザープロフィール

- [x] `apps/web/app/user/[id]/page.tsx` 作成
- [x] `apps/web/components/user/UserProfile/UserProfile.tsx` 作成
- [x] `apps/web/components/user/UserProfile/UserProfile.module.css` 作成

## D-3：マップに全公開スポットを表示

- [x] `MapView.tsx` の投稿ゼロスポット非表示ロジックを修正（RLS が自動フィルタリング）

## D-4：視覚的区別の確認・調整

- [x] `MapView.tsx` のピン表示を確認（既存実装で対応済み）

## RLS ポリシー

- [x] `posts` テーブルの RLS 有効化（`ALTER TABLE posts ENABLE ROW LEVEL SECURITY`）
- [x] `posts` テーブルの SELECT/INSERT/UPDATE/DELETE ポリシー設定
- [x] `user_oshis` テーブルのポリシー：本人のみ閲覧可に変更（プライバシー保護）
- [ ] `posts_select_all` ポリシーの削除（Supabase Dashboard で手動実行が必要）
  - SQL: `DROP POLICY IF EXISTS "posts_select_all" ON posts;`

## UI改善（追加対応）

- [x] PostForm のカラー変数を正しい名前に修正（`--color-border-default` 等）
- [x] トグルの視認性改善（黒背景への同化を解消）
- [x] カテゴリ選択の選択状態を明確化

## 完了確認

- [ ] `DROP POLICY "posts_select_all"` 実行後に非公開投稿が他ユーザーに見えないこと
- [ ] `npx next build` が通る
- [ ] `npx next lint` が通る
- [ ] ブラウザでコンソールエラーなし
- [ ] モバイルサイズ（375px）で表示が崩れない
