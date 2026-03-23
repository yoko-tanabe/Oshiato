# design.md — 20260323-map-display

## ファイル構成

```
apps/web/
└── components/
    └── map/
        └── MapView/
            ├── MapView.tsx
            └── MapView.module.css
app/
└── page.tsx  ← MapViewを組み込む
```

## MapView コンポーネント

### 責務
- Mapbox GL JSの初期化・表示
- Supabaseからspotsを取得してピンを描画
- 現在地ボタンの表示・動作

### 技術上の注意
- Mapbox GL JSはSSR非対応 → `dynamic()` で `ssr: false` のまま読み込む
- `'use client'` が必要（useEffect, useRef を使用）
- mapbox-glのCSSを別途インポートが必要

### 地図スタイル
Mapboxが提供するダークテーマを使用:
```
mapbox://styles/mapbox/dark-v11
```

### 初期表示
| 項目 | 値 |
|------|---|
| 中心座標 | 東京（139.6917, 35.6895） |
| ズームレベル | 13 |

### スポットピンのスタイル（UI_Design_Guide §5.6より）
```
通常ピン:
  width: 42px / height: 42px
  background: #333333
  border-radius: 50%
  border: 3px solid #0D0D0D

アクティブピン:
  background: #C4B5FD（Lavender）
  box-shadow: 0 4px 16px rgba(196, 181, 253, 0.35)
```

### 現在地ボタン
- 地図の右下に配置
- アイコン: Lucide の `LocateFixed`
- 背景: #232323、アクティブ時: #C4B5FD

## page.tsx の構成

```tsx
// Dynamic importでSSRを無効化
const MapView = dynamic(() => import('@/components/map/MapView/MapView'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

export default function MapPage() {
  return <MapView />;
}
```
