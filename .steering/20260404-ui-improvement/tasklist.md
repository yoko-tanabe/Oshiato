# 既存ページUI改善 - タスクリスト

## タスク

- [x] 1. TabBar の改善（TabBar.tsx + .module.css）
- [x] 2. MapView の改善（MapView.tsx + .module.css）
- [x] 3. TimelineGrid の改善（TimelineGrid.tsx + .module.css）
- [x] 4. PostForm の改善（PostForm.tsx — Toast追加）
- [x] 5. 推し管理ページの改善（oshi/page.tsx — LoadingSpinner + EmptyState + Toast）
- [x] 6. ビルド確認（TypeScript / ESLint エラーなし）

## 作成・修正したファイル

| 操作 | ファイル |
|------|---------|
| 修正 | `components/ui/TabBar/TabBar.tsx` — アイコン非アクティブ色 #808080 |
| 修正 | `components/ui/TabBar/TabBar.module.css` — ラベル11px、色#808080、アクティブ下線追加 |
| 修正 | `components/map/MapView/MapView.tsx` — LoadingSpinner、Toast追加、console.log削除 |
| 修正 | `components/map/MapView/MapView.module.css` — loadingOverlay スタイル追加 |
| 修正 | `components/timeline/TimelineGrid/TimelineGrid.tsx` — LoadingSpinner、EmptyState、画像フォールバック |
| 修正 | `components/timeline/TimelineGrid/TimelineGrid.module.css` — gap 4px、月ヘッダー区切り、不要CSS削除 |
| 修正 | `components/post/PostForm/PostForm.tsx` — 投稿成功Toast追加 |
| 修正 | `app/oshi/page.tsx` — LoadingSpinner、EmptyState、推し追加Toast |
| 修正 | `app/oshi/page.module.css` — 不要な.empty削除 |
