# 推しフィルター機能 - 設計

## コンポーネント構成

### 新規作成
- `apps/web/components/map/OshiFilter/OshiFilter.tsx` — 推しドロップダウンUI（複数選択可）
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
  selectedOshiIds: string[];  // 空配列 = すべて
  onSelect: (oshiIds: string[]) => void;
};
```

### UI構成
- ドロップダウン形式（トリガーボタン + メニュー）
- トリガーボタン: 「すべての推し」/「○人選択中」と ▼ アイコン
- メニュー先頭に「すべて」（全選択解除）
- 各推し行: カラードット + 推し名 + ✓（選択中のみ）
- 複数選択可（トグル式）
- ドロップダウン外クリックで閉じる

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
1. `selectedOshiIds` が空配列 → 全スポット表示
2. `selectedOshiIds` に1つ以上 → 該当推しの投稿があるスポットのみ表示
3. 期間フィルターと AND 条件で併用

### マーカー差別化（常時適用）
- 各スポットの投稿を「自分の投稿」と「他者の投稿」に分類
- 自分の投稿が1件以上 → `.pin`（塗りつぶし）
- 他者の投稿のみ → `.pinOtherOnly`（ボーダーのみ）
- フィルターの有無にかかわらず常に差別化する

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
├── selectedOshiIds (string[]) — 推しフィルター（空配列=すべて）
├── userOshiList (OshiOption[]) — 推しリスト（OshiFilterに渡す）
└── loadSpots(map, dateFilter, oshiFilter)
     ├── 全スポット・投稿取得
     ├── 期間フィルター適用
     ├── 推しフィルター適用
     ├── 自分/他者の投稿分類（常時）
     └── マーカー描画（自分=塗り / 他者のみ=ボーダー）
```
