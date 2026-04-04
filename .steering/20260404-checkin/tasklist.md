# チェックイン機能 - タスクリスト

## タスク

- [x] 1. チェックインヘルパー作成（lib/supabase/checkins.ts）
- [x] 2. CheckInButton コンポーネント作成（CheckInButton.tsx + .module.css）
- [x] 3. MapView のポップアップにチェックインボタンを追加（HTML + イベント委譲）
- [x] 4. ビルド確認（TypeScript / ESLint エラーなし）

## 作成・修正したファイル

| 操作 | ファイル |
|------|---------|
| 新規 | `lib/supabase/checkins.ts` — 距離計算 + チェックイン実行ヘルパー |
| 新規 | `components/spot/CheckInButton/CheckInButton.tsx` — React版チェックインボタン（Step 7 で使用） |
| 新規 | `components/spot/CheckInButton/CheckInButton.module.css` — CheckInButton スタイル |
| 修正 | `components/map/MapView/MapView.tsx` — ポップアップにチェックインボタン追加 + イベント委譲 |
| 修正 | `app/globals.css` — ポップアップ内チェックインボタンのグローバルスタイル |
