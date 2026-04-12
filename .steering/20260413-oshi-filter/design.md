# 推しフィルター機能 - 設計

## コンポーネント構成

### 新規作成
- `apps/web/components/map/OshiFilter/OshiFilter.tsx` — 推しチップUI
- `apps/web/components/map/OshiFilter/OshiFilter.module.css` — スタイル

### 変更
- `apps/web/components/map/MapView/MapView.tsx` — フィルターロジック追加
- `apps/web/components/map/MapView/MapView.module.css` — `.pinOtherOnly` 追加

## OshiFilter コンポーネント設計

### Props
```typescript
type OshiOption = {
  oshiId: string;
  name: string;
  themeColor: string;
};

type Props = {
  oshis: OshiOption[];
  selectedOshiId: string | null;  // null = すべて
  onSelect: (oshiId: string | null) => void;
};
```

### UI構成
- 横スクロール可能なチップリスト
- 先頭に「すべて」チップ（常に表示）
- 各推しチップ: 推し名 + 推しカラーの左マーク
- 選択中チップ: 背景に推しカラー（半透明）、テキスト色を推しカラー
- 非選択チップ: ダーク背景、グレーテキスト

### 配置
- MapFilter（期間フィルター）の下に配置
- 推しが0件の場合は非表示

## MapView 変更設計

### データ取得の変更
- 現在: 自分のuser_oshisのみ取得 → 推し色マップ作成
- 変更後: 自分のuser_oshisに加え、投稿に含まれるoshi_idも考慮
  - 自分が登録済みの推しは `user_oshis.theme_color` を使用
  - 未登録の推しはグレー表示（フィルター対象外）

### フィルターロジック
1. `selectedOshiId` が null → 現状通り全スポット表示
2. `selectedOshiId` が指定 → その推しのoshi_idを持つ投稿があるスポットのみ表示
3. 期間フィルターと AND 条件で併用

### マーカー差別化（推しフィルター適用時のみ）
- 各スポットの投稿を「自分の投稿」と「他者の投稿」に分類
- 自分の投稿が1件以上 → `.pin`（塗りつぶし）
- 他者の投稿のみ → `.pinOtherOnly`（ボーダーのみ）
- フィルター未適用時は現状通り（差別化なし）

## CSS設計

### `.pinOtherOnly` スタイル
```css
.pinOtherOnly {
  width: 14px;
  height: 14px;
  background: transparent;
  border: 2px solid var(--oshi-color, #aaaaaa);
  border-radius: 50%;
  opacity: 0.7;
  cursor: pointer;
}
```

## 状態管理フロー
```
MapView
├── filterRange (DateRange | null) — 期間フィルター
├── selectedOshiId (string | null) — 推しフィルター
├── userOshis (OshiOption[]) — 推しリスト（OshiFilterに渡す）
└── loadSpots(map, dateFilter, oshiFilter)
     ├── 全スポット・投稿取得
     ├── 期間フィルター適用
     ├── 推しフィルター適用
     ├── 自分/他者の投稿分類
     └── マーカー描画（差別化あり/なし）
```
