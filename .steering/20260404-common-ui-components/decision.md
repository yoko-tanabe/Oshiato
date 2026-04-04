# 共通UIコンポーネント整備 - 決定事項

## D1: Toast の実装パターン

**決定**: React Context + Provider パターンを採用

**理由**: Toast はアプリ全体のどこからでも呼び出す必要がある。Context パターンなら `useToast()` フックで簡潔に呼び出せる。外部ライブラリ（react-hot-toast 等）は依存を増やすため不採用。

## D2: EmptyState のアイコン

**決定**: Lucide Icons の React コンポーネントを `icon` prop として受け取る

**理由**: アイコンの種類は使用箇所ごとに異なる（地図、カメラ、足跡等）。文字列キーではなくコンポーネントを渡すことで柔軟性と型安全性を確保。

## D3: LoadingSpinner のバリエーション

**決定**: サイズのみ 3段階（small / medium / large）

**理由**: 色はプロジェクト全体で Lavender 統一。サイズだけ使い分ければ十分。過剰なカスタマイズ性は不要。
