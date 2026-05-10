# design.md — Phase A 残件修正

## 変更対象ファイル

`apps/web/components/map/MapView/MapView.tsx` のみ

---

## A-4: 位置情報デフォルト改善

### 設計方針

地図初期化時（`useEffect` 内）に以下のロジックで初期位置を決める。

```
1. localStorage に保存済みの位置がある → そちらを使う（既存挙動。変更なし）
2. localStorage が空（初回訪問）→ navigator.geolocation.getCurrentPosition() を呼ぶ
   - 成功 → 取得した現在地に flyTo
   - 失敗（拒否・タイムアウト） → そのまま東京表示（フォールバック）
```

### 実装詳細

現在のコード（地図初期化部分）:
```ts
const saved = loadMapState();
const map = new mapboxgl.Map({
  center: saved?.center ?? DEFAULT_CENTER,  // ← 保存なければ東京固定
  zoom: saved?.zoom ?? DEFAULT_ZOOM,
});
```

変更後:
```ts
const saved = loadMapState();
const map = new mapboxgl.Map({
  center: saved?.center ?? DEFAULT_CENTER,  // 初期は東京（saved があれば復元）
  zoom: saved?.zoom ?? DEFAULT_ZOOM,
});

// 初回訪問（保存状態なし）かつ Geolocation が使える場合、現在地に flyTo
if (!saved && navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      map.flyTo({
        center: [pos.coords.longitude, pos.coords.latitude],
        zoom: DEFAULT_ZOOM,
        duration: 800,
      });
    },
    () => { /* 拒否・失敗時は東京のまま。何もしない */ },
    { timeout: 5000 },
  );
}
```

### ポイント
- `map.on('load', ...)` の外で呼ぶことで、マップ初期化直後から位置取得を開始できる
- `flyTo` はマップ読み込み完了前でも `load` イベント後に自動的に実行される
- タイムアウトを 5000ms に設定し、応答がない場合はフォールバック

---

## A-5: RPC 失敗 Toast 通知

### 設計方針

`loadSpots` 内の RPC 失敗箇所に `showToast` を追加する。

現在のコード（MapView.tsx 117行目付近）:
```ts
if (spotsError || !spots || spots.length === 0) {
  return;  // ← サイレント失敗
}
```

変更後:
```ts
if (spotsError) {
  showToast('error', 'スポットの読み込みに失敗しました');
  return;
}
if (!spots || spots.length === 0) {
  return;  // スポット0件はエラーではないので通知しない
}
```

### ポイント
- `spotsError` と「スポットが0件」は別ケースとして分岐する
  - エラー: Toast 通知
  - 0件: 通知不要（新規ユーザーや投稿なしユーザーの正常状態）
- `showToast` は `loadSpots` の外から渡す必要があるため、引数に追加する

### loadSpots の引数変更

`loadSpots` は現在 `useCallback` でメモ化されている。`showToast` を引数で受け取るよう変更する。

```ts
const loadSpots = useCallback(async (
  map: mapboxgl.Map,
  dateFilter?: DateRange | null,
  oshiFilter?: string[],
  toast?: (type: 'success' | 'error', message: string) => void,  // ← 追加
) => { ... }, []);
```

呼び出し側（`map.on('load', ...)` 内）:
```ts
loadSpots(map, undefined, undefined, showToast);
```

フィルター変更時の呼び出しにも `showToast` を渡す。
