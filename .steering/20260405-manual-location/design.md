# 手動位置指定機能 - 設計

## UI構成

### 表示条件
- 画像選択後、EXIF GPS情報が**1枚もない**場合に「位置を指定」セクションを表示
- EXIF GPS情報がある場合は非表示（従来どおり）

### 位置指定セクション（PostForm内に追加）
```
┌─────────────────────────────┐
│ 📍 場所を指定               │
│                             │
│ [住所・場所名を入力...    ] │
│ ┌─ サジェスト候補 ────────┐ │
│ │ 渋谷駅                  │ │
│ │ 渋谷区渋谷1丁目         │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │                         │ │
│ │      [Mapbox地図]       │ │
│ │         📍              │ │
│ │                         │ │
│ └─────────────────────────┘ │
│ ピンをタップ or ドラッグで  │
│ 位置を調整できます          │
└─────────────────────────────┘
```

## コンポーネント構成

### 新規作成
- `components/post/LocationPicker/LocationPicker.tsx` + `.module.css`
  - Props: `onLocationSelect(lat: number, lng: number): void`
  - 住所検索入力欄 + サジェストリスト
  - Mapbox地図（タップ & ドラッグでピン移動）
  - 選択済み座標の表示

### 既存修正
- `components/post/PostForm/PostForm.tsx`
  - `manualLat`, `manualLng` ステートを追加
  - EXIF GPS なし時に `<LocationPicker>` を表示
  - `handleSubmit` で EXIF座標がなければ manualLat/Lng を使用

## Mapbox Geocoding API

### エンドポイント
`https://api.mapbox.com/geocoding/v5/mapbox.places/{query}.json`

### パラメータ
- `access_token`: 既存の MAPBOX_TOKEN を使用
- `language=ja`: 日本語で結果を返す
- `country=jp`: 日本国内に限定
- `limit=5`: 候補数を5件に制限
- `types=poi,address,place`: スポット・住所・地名に絞る

### デバウンス
- 入力から300ms後にAPIコール（タイピング中の無駄なリクエストを防止）

## データフロー

```
1. ユーザーが画像選択 → EXIF抽出
2. GPS情報なし → LocationPicker表示
3a. 住所入力 → Geocoding API → 候補表示 → 選択 → 地図にピン表示
3b. 地図タップ → ピン配置
4. ピンのドラッグで微調整
5. 投稿ボタン → manualLat/Lng を findOrCreateSpot に渡す
