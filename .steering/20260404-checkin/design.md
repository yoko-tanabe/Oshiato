# チェックイン機能 - 設計

## ファイル構成

```
apps/web/
├── lib/supabase/checkins.ts          — チェックインのクエリヘルパー
└── components/spot/CheckInButton/
    ├── CheckInButton.tsx
    └── CheckInButton.module.css
```

## lib/supabase/checkins.ts

### 関数

```typescript
/** 当日チェックイン済みか確認 */
async function isCheckedInToday(userId: string, spotId: string): Promise<boolean>

/** チェックイン実行（check_ins + visit_logs 挿入） */
async function performCheckIn(params: {
  userId: string;
  spotId: string;
  oshiId: string;
  lat: number;
  lng: number;
}): Promise<{ success: boolean; error?: string }>
```

### 距離計算

`navigator.geolocation` で取得した現在地とスポット座標の距離を Haversine 公式で計算。200m以内ならチェックイン可能。距離計算はクライアント側で行う（サーバーRPC不要）。

## CheckInButton コンポーネント

### Props

```typescript
interface CheckInButtonProps {
  spotId: string;
  oshiId: string;
  spotLat: number;
  spotLng: number;
}
```

### 状態遷移

1. **初期**: 「チェックイン」ボタン表示
2. **処理中**: LoadingSpinner 表示
3. **成功**: 「チェックイン済み」表示（非活性）
4. **エラー**: Toast で通知、ボタンは元に戻る

### マップポップアップへの配置

MapView のポップアップは HTML 文字列で組み立てるため、React コンポーネントを直接埋め込めない。代替策:
- ポップアップ内に `<button data-spot-id="..." data-oshi-id="..." data-lat="..." data-lng="...">` を HTML で配置
- MapView 側でイベントリスナーを使ってクリックをキャッチし、checkins.ts のヘルパーを呼ぶ
- CheckInButton コンポーネントは Step 7（スポット詳細ページ）で使用
