# tasklist.md — Phase C: マイページ・投稿管理

> 上から順に進める。各タスク完了後にチェックを入れること。
> ファイルは1つずつ作成・確認を取ってから次へ進む。

---

## 事前確認

- [x] **PRE-1** Supabase ダッシュボードで `users` テーブルに `bio` カラムがあるか確認する → **なし。display_name のみ対象とする**
- [x] **PRE-2** `npx next build` が現時点で通ることを確認する（Phase B の引き継ぎ確認）

---

## STEP 1: useCurrentUser の拡張

- [x] **C-0a** `lib/user/useCurrentUser.ts` を修正：`users` テーブルから `display_name` も取得して返すよう拡張する
- [x] **C-0b** 既存の呼び出し元（MapView, PostForm など）が壊れていないことを確認する

---

## STEP 2: TabBar の修正

- [x] **C-0c** `components/ui/TabBar/TabBar.tsx` の「マイページ」タブのhrefを `/oshi` → `/mypage` に変更する
- [x] **C-0d** ブラウザで「マイページ」タブが `/mypage` に遷移することを確認する

---

## STEP 3: マイページ（C-1）

- [x] **C-1a** `app/mypage/page.tsx` を作成する（`MyPageClient` を呼ぶだけの Server Component）
- [x] **C-1b** `components/mypage/MyPageClient/MyPageClient.tsx` を作成する（統計ダッシュボード UI）
- [x] **C-1c** `components/mypage/MyPageClient/my-page-client.module.css` を作成する
- [x] **C-1d** ブラウザで `/mypage` が表示され、投稿数・訪問数・推し別集計が出ることを確認する

---

## STEP 4: プロフィール編集（C-2）

- [x] **C-2a** `app/mypage/profile/page.tsx` を作成する（`ProfileEditForm` を呼ぶだけの Server Component）
- [x] **C-2b** `components/mypage/ProfileEditForm/ProfileEditForm.tsx` を作成する
- [x] **C-2c** `components/mypage/ProfileEditForm/profile-edit-form.module.css` を作成する
- [x] **C-2d** ブラウザで表示名の編集・保存ができることを確認する

---

## STEP 5: 投稿編集・削除のバックエンド（C-3, C-4 共通）

- [x] **C-3a** `lib/supabase/spots.ts` に `updatePost()` 関数を追加する
- [x] **C-4a** `lib/supabase/spots.ts` に `deletePost()` 関数を追加する（Storage 削除 → DB 削除の順）

---

## STEP 6: 投稿編集フォーム（C-3）

- [x] **C-3b** `components/spot/SpotEditForm/SpotEditForm.tsx` を作成する
- [x] **C-3c** `components/spot/SpotEditForm/spot-edit-form.module.css` を作成する
- [x] **C-3d** `components/spot/SpotDetail/SpotDetail.tsx` に「編集」ボタンと SpotEditForm を組み込む
  - 投稿取得時に `user_id`, `comment`, `category` も取得するよう変更
  - `post.user_id === userId` の場合のみボタン表示
- [x] **C-3e** ブラウザで自分の投稿に「編集」ボタンが表示され、カテゴリ・コメントを変更できることを確認する
- [x] **C-3f** 他人の投稿に「編集」ボタンが表示されないことを確認する

---

## STEP 7: 投稿削除（C-4）

- [x] **C-4b** `components/spot/SpotDetail/SpotDetail.tsx` に「削除」ボタンを組み込む
  - 確認ダイアログ（`window.confirm`）を表示してから `deletePost()` を呼ぶ
  - 削除後は一覧から除去（state 更新）＋ Toast 通知
- [x] **C-4c** ブラウザで自分の投稿を削除でき、Storage から画像も消えることを確認する
- [x] **C-4d** 他人の投稿に「削除」ボタンが表示されないことを確認する

---

## STEP 8: 最終確認

- [x] **FIN-1** `npx next build` がエラーなく通ること
- [ ] **FIN-2** `npx next lint` で警告がないこと（`<img>` 警告 2 件は既存コード起因。Phase G で対処予定）
- [x] **FIN-3** ブラウザのコンソールにエラーがないこと
- [ ] **FIN-4** モバイルサイズ（375px幅）で各画面の表示が崩れないこと

---

## Phase C 完了基準チェック

- [x] `/mypage` でログインユーザーの投稿数・訪問数・推し別集計が見られる
- [x] プロフィール（表示名）が編集・保存できる
- [x] 自分の投稿を編集できる（カテゴリ・コメント）※ posts テーブルに title カラムなし
- [x] 自分の投稿を削除でき、Storage 画像も消える
- [x] 他ユーザーの投稿に編集・削除ボタンが表示されない

## 実装上の補足メモ

- `bio` カラムは users テーブルに存在しないため、プロフィール編集は `display_name` のみ対象
- `posts` テーブルに `title` カラムはなく、編集対象は `category` と `comment`
- 投稿削除時に `spots` レコードは残す（DEC-08参照。Phase I のグルーピング設計後に再検討）
- React 19 で `FormEvent` が非推奨 → フォームハンドラは `onSubmit={(e) => { e.preventDefault(); handleSave(); }}` パターンで統一
