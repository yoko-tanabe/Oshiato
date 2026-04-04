# スポット詳細ページ - 設計

## ファイル構成

```
apps/web/components/spot/SpotDetail/
├── SpotDetail.tsx
└── SpotDetail.module.css
```

修正: `app/spot/[id]/page.tsx` — SpotDetail をインポート

## SpotDetail コンポーネント

### Props

```typescript
interface SpotDetailProps {
  spotId: string;
}
```

### データ取得フロー

1. RPC `get_spots_with_coords` の結果から該当スポットの address / lat / lng を取得
   （個別スポット用RPCがないため全件取得してフィルタ、またはスポットテーブルから直接取得）
   → spots テーブルから直接 address を取得 + lat/lng はRPCで取得
2. `posts` を `spot_id` で取得 → `oshi_id` を抽出
3. `post_images` で写真URL取得
4. `oshis` + `user_oshis` で推し名・色を取得
5. `visit_logs` で訪問回数をカウント

### UI構成

```
┌─────────────────────────────┐
│ ← 戻る     スポット詳細     │  ← ヘッダー
├─────────────────────────────┤
│ 渋谷区道玄坂1-2-3          │  ← 住所
│ ● 推し名    3回訪問        │  ← 推しバッジ + 訪問回数
├─────────────────────────────┤
│ [チェックイン]              │  ← CheckInButton
├─────────────────────────────┤
│ 写真                        │  ← セクションタイトル
│ ┌───┐ ┌───┐ ┌───┐          │
│ │   │ │   │ │   │          │  ← 3列グリッド（タイムラインと同じパターン）
│ │   │ │   │ │   │          │
│ └───┘ └───┘ └───┘          │
└─────────────────────────────┘
```

### スポット座標の取得

スポットの lat/lng は CheckInButton に必要。spots テーブルの location は GEOGRAPHY(POINT) でWKB形式のため直接パースできない。既存の RPC `get_spots_with_coords` を利用して取得する。
