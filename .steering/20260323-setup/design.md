# design.md — 20260323-setup

## 実装アプローチ

### 1. Next.jsプロジェクト初期化

`npx create-next-app@latest` を使用。オプション:
- `--typescript`: TypeScript対応
- `--eslint`: ESLint設定
- `--no-tailwind`: CSS Modules使用のため不要
- `--app`: App Router（Next.js 15の標準）
- `--no-src-dir`: Repository_Structure.md 通り src/ なし
- `--import-alias "@/*"`: `@/components/...` でインポート可能

### 2. フォント設定

UI_Design_Guide.md で指定されたフォント:
- **Nunito**: ディスプレイ（タイトル・ボタン用） → CSS変数: `--font-display`
- **Zen Maru Gothic**: ボディ（本文用） → CSS変数: `--font-body`
- `next/font/google` で自動最適化（外部通信なし、セルフホスト）

### 3. デザイントークン

`app/globals.css` に CSS カスタムプロパティとして定義:
- カラー、スペーシング（4pxグリッド）、ボーダーラジウス、シャドウ、トランジション、z-index
- テーマはダーク固定（`--color-bg-primary: #1a1a1a`）

### 4. ルート構造

App Router の規約に従いディレクトリ＝ルート:
```
app/
├── page.tsx          → /
├── spot/[id]/page.tsx → /spot/:id
├── post/new/page.tsx  → /post/new
├── timeline/page.tsx  → /timeline
├── oshi/page.tsx      → /oshi
├── visits/page.tsx    → /visits
└── trajectory/page.tsx→ /trajectory
```

## 変更コンポーネント

| ファイル | 変更内容 |
|----------|----------|
| apps/web/app/layout.tsx | フォント・メタデータ・lang属性を更新 |
| apps/web/app/globals.css | デザイントークン・リセットCSSに全面置換 |
| apps/web/app/page.tsx | デモページをプレースホルダーに置換 |
| apps/web/package.json | type-checkスクリプト追加 |
| package.json（ルート） | lintスクリプト追加 |
