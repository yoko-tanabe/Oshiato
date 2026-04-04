# 共通UIコンポーネント整備 - タスクリスト

## タスク

- [x] 1. EmptyState コンポーネント作成（EmptyState.tsx + .module.css）
- [x] 2. LoadingSpinner コンポーネント作成（LoadingSpinner.tsx + .module.css）
- [x] 3. Toast コンポーネント作成（Toast.tsx + .module.css + ToastProvider.tsx + ToastProvider.module.css）
- [x] 4. ToastProvider を layout.tsx に追加
- [x] 5. ビルド確認（TypeScript / ESLint エラーなし）

## 作成・修正したファイル

| 操作 | ファイル |
|------|---------|
| 新規 | `components/ui/EmptyState/EmptyState.tsx` — 空状態の統一表示 |
| 新規 | `components/ui/EmptyState/EmptyState.module.css` — EmptyState スタイル |
| 新規 | `components/ui/LoadingSpinner/LoadingSpinner.tsx` — ローディング表示 |
| 新規 | `components/ui/LoadingSpinner/LoadingSpinner.module.css` — LoadingSpinner スタイル |
| 新規 | `components/ui/Toast/Toast.tsx` — 個別Toast表示 |
| 新規 | `components/ui/Toast/Toast.module.css` — Toast スタイル |
| 新規 | `components/ui/Toast/ToastProvider.tsx` — Context + useToast フック |
| 新規 | `components/ui/Toast/ToastProvider.module.css` — Toast コンテナ位置 |
| 修正 | `app/layout.tsx` — ToastProvider でラップ |
