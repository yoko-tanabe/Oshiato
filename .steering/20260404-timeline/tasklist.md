# Tasklist

## 2026-04-04 タイムライン機能実装

---

## 完了タ��ク

### Phase 1: 調査・設計

- [x] 既存コードベースの調査（ページ・コンポーネント・データ取得パターン）
- [x] 要件ドキュメント・サイトマップ・UIデザインガイドの確認
- [x] 実装計画の策定・承認

### Phase 2: 実装

- [x] `TimelineGrid.module.css` 作成 — グリッドレイアウト・タイル・月ヘッダー・状態表示のス���イル
- [x] `TimelineGrid.tsx` 作成 — データ取得・月別グループ化・グリッド描画
- [x] `page.tsx` 修正 — スタブを `TimelineGrid` コンポーネントのimportに置き換��

### Phase 3: 検証

- [x] Next.js ビルド成功確認（TypeScriptエラーなし）

---

## 変更ファイル一覧

| ファイル | 変更内容 |
|---------|---------|
| `apps/web/components/timeline/TimelineGrid/TimelineGrid.module.css` | **新規作成** — 3カラムグリッド、タイル、月ヘッダー、日���オーバーレイ、ローディング・空状態のスタイ�� |
| `apps/web/components/timeline/TimelineGrid/TimelineGrid.tsx` | **新規作成** — Supabaseからのデータ取得、月別グループ化、写真グリッド表示 |
| `apps/web/app/timeline/page.tsx` | スタブ → `TimelineGrid` をimportするServer Componentに修正 |
