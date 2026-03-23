# decision.md — 20260323-ui-design

## 決定事項

### 1. アイコンライブラリ: lucide-react を使用

**理由:**
- UI_Design_Guide.md §6.3 で Lucide Icons を指定済み
- 線画（Stroke）スタイルでデザインコンセプトに合致
- Next.js / React との相性が良い
- Tree-shakingに対応しており、不要なアイコンはバンドルに含まれない

**代替案（不採用）:**
- heroicons: 品質は高いがLucideほど種類が豊富でない
- react-icons: 複数ライブラリの混在でスタイルが不統一になりやすい

---

### 2. アクティブタブの判定: usePathname() を使用

**理由:**
- Next.js App Router の公式フック
- サーバーサイドではなくクライアント側でパスを取得するため、`'use client'` ディレクティブと組み合わせて使用
- URLと一致するタブを自動的にアクティブにでき、手動での状態管理が不要

---

### 3. CSS: CSS Modules を使用

**理由:**
- CLAUDE.md の技術スタック指定（スタイル: CSS Modules）
- クラス名の衝突を防ぐ
- グローバルのデザイントークン（CSS変数）をそのまま参照できる

---

### 4. AppShell の適用範囲: layout.tsx で全ページに適用

**理由:**
- 全ページにタブバーを表示するため、root layout での一括適用が最適
- 個別ページでの重複実装を避ける
- 将来的に認証後のみ表示するなどの変更も layout.tsx で一元管理できる
