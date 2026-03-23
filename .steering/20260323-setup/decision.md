# decision.md — 20260323-setup

## 重要な決定事項

### 決定1: create-next-app@latest → Next.js 16.2.1 が導入された

**状況**: `create-next-app@latest` を実行したところ、Next.js 15 ではなく 16.2.1 がインストールされた。

**対応**: そのまま使用する。
- Next.js 16.x は 15.x の継続であり、App Router・CSS Modules・TypeScript対応は変わらない
- CLAUDE.md の「Next.js 15.x」は参考表記であり、最新安定版を使うことが意図と判断

### 決定2: ダークテーマ固定（light/darkの切り替えなし）

**理由**: UI_Design_Guide.md がダークテーマを基本として定義しているため。`prefers-color-scheme` の分岐は実装しない（将来対応可能）。

### 決定3: apps/web/app/page.tsx のインラインスタイル

**理由**: Step 4で地図コンポーネントに全面置換予定のため、CSS Moduleを作らずインラインstyleを一時的に使用。

### 決定4: ルートページ（/oshi）の扱い

**状況**: Sitemap によると /oshi は Phase 3 の機能（推し管理）。
**対応**: プレースホルダーは作成するが「Phase 3 で実装予定」と明記。
