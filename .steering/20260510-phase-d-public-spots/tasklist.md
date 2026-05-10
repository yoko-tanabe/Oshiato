# Phase D タスクリスト

## D-1：投稿時の公開/非公開設定

- [ ] DBマイグレーションSQL作成 (`supabase/migrations/`)
- [ ] `database.types.ts` に `is_public: boolean` 追加
- [ ] `PostForm.tsx` に公開/非公開トグル追加
- [ ] `PostForm.module.css` にトグルのスタイル追加

## D-2：他ユーザープロフィール

- [ ] `apps/web/app/user/[id]/page.tsx` 作成
- [ ] `apps/web/components/user/UserProfile/UserProfile.tsx` 作成
- [ ] `apps/web/components/user/UserProfile/UserProfile.module.css` 作成

## D-3：マップに全公開スポットを表示

- [ ] `MapView.tsx` に公開スポット取得ロジック追加

## D-4：視覚的区別の確認・調整

- [ ] `MapView.tsx` のピン表示を `is_public` 対応に確認・調整

## RLS ポリシー

- [ ] `posts` テーブルの公開スポット SELECT ポリシー適用
- [ ] `user_oshis` テーブルの全員閲覧ポリシー確認

## 完了確認

- [ ] `npx next build` が通る
- [ ] `npx next lint` が通る
- [ ] ブラウザでコンソールエラーなし
- [ ] モバイルサイズ（375px）で表示が崩れない
