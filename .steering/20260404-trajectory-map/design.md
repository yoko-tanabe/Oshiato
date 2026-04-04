# 軌跡マップ - 設計

## 1. PostForm への visit_logs 挿入

### 修正箇所
`components/post/PostForm/PostForm.tsx` の `post_images` insert 成功後（約170行目付近）

### 挿入コード概要
```typescript
await supabase.from('visit_logs').insert({
  user_id: userId,
  spot_id: spotId,
  oshi_id: selectedOshiId,
  location: `POINT(${firstExif.lng} ${firstExif.lat})`,
  visited_at: firstExif.takenAt ?? new Date().toISOString(),
  source: 'exif',
});
```
- visit_logs 挿入失敗は投稿自体の成功に影響させない（try-catch で警告のみ）

## 2. 軌跡マップコンポーネント

### ファイル構成
```
components/trajectory/TrajectoryMap/
├── TrajectoryMap.tsx          # クライアントコンポーネント（'use client'）
├── TrajectoryMap.module.css   # スタイル
└── TrajectoryMap_dynamic.tsx  # SSR無効の dynamic import
```

### データ取得
- Supabase RPC `get_visit_trajectory(input_user_id)` で visit_logs から lat/lng を数値で取得
- PostGIS の GEOGRAPHY 型を ST_X / ST_Y で変換
- 推し情報は `user_oshis` + `oshis` テーブルから取得（テーマカラー用）

### 地図描画（MapView パターンを踏襲）
- `mapboxgl.Map` を `useRef` + `useEffect` で初期化
- スタイル: `mapbox://styles/mapbox/dark-v11`
- 訪問ポイント: Mapbox `circle` レイヤー（GeoJSON Source）
- 軌跡線: Mapbox `line` レイヤー（推しごとに別レイヤー、テーマカラーで色分け）
- 個別 Marker ではなく GeoJSON + Layer を使用（パフォーマンス向上）

### 空状態
- 訪問データが0件の場合、地図の中央にメッセージを表示
- 「まだ軌跡がありません。写真を投稿して足跡を残しましょう！」

### ページ修正
`app/trajectory/page.tsx` で `TrajectoryMap_dynamic` をインポート

## 3. Supabase RPC

### SQL
```sql
CREATE OR REPLACE FUNCTION get_visit_trajectory(input_user_id UUID)
RETURNS TABLE(
  id UUID, spot_id UUID, oshi_id UUID,
  lat DOUBLE PRECISION, lng DOUBLE PRECISION,
  visited_at TIMESTAMPTZ, source TEXT
)
AS $$
  SELECT vl.id, vl.spot_id, vl.oshi_id,
         ST_Y(vl.location::geometry) AS lat,
         ST_X(vl.location::geometry) AS lng,
         vl.visited_at, vl.source
  FROM visit_logs vl
  WHERE vl.user_id = input_user_id
  ORDER BY vl.visited_at ASC;
$$ LANGUAGE sql STABLE;
```

SupabaseダッシュボードのSQL Editorで実行する（開発者が手動で実行）。
