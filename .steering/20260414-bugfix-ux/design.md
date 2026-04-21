# バグ修正 + UX改善 - 設計

## 1-1: メモリリーク修正

**方針**: ImagePickerのuseEffectクリーンアップでBlob URLをrevokeする

**変更箇所:**
- `ImagePicker.tsx`: プレビューURL生成後、クリーンアップ関数でrevokeObjectURLを呼ぶ
- ファイル削除時（handleRemove）にも該当URLをrevokeする

## 1-2: タイムゾーン修正

**方針**: ローカル日付を返すヘルパー関数を作成

**変更箇所:**
- `checkins.ts`: L34, L80の`toISOString().split('T')[0]`をローカル日付取得に置き換え

**ヘルパー関数:**
```typescript
function getLocalDateString(): string {
  const d = new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}
```

## 1-3: 地図状態保持

**方針**: localStorageでcenter/zoomを永続化

**変更箇所:**
- `MapView.tsx`: map moveend/zoomendイベントでlocalStorageに保存、初期化時に読み込み

**ストレージキー:** `oshiato_map_state`
**保存形式:** `{ center: [lng, lat], zoom: number }`
