# Tasklist

## 2026-04-04 マップピン表示バグ修正

---

## 完了タスク

### Phase 1: 原因調査

- [x] `MapView.tsx` の読み込み・構造把握
- [x] `parsePoint` 関数が WKB 形式に対応していないことを特定
- [x] データベーススキーマ（`GEOGRAPHY(POINT, 4326)`）の確認

### Phase 2: ピン非表示の修正

- [x] Supabase に `get_spots_with_coords` RPC関数を作成（SQL Editor で実行）
  ```sql
  CREATE OR REPLACE FUNCTION get_spots_with_coords()
  RETURNS TABLE (id UUID, lng DOUBLE PRECISION, lat DOUBLE PRECISION, address TEXT)
  LANGUAGE sql STABLE
  AS $$ SELECT id, ST_X(location::geometry), ST_Y(location::geometry), address FROM spots; $$;
  ```
- [x] `MapView.tsx` のスポット取得を `.from('spots').select()` → `.rpc('get_spots_with_coords')` に変更
- [x] `parsePoint` 関数を削除（不要になったため）
- [x] マップ上にピンが表示されることを確認

### Phase 3: ピンのスタイル調整

- [x] ピンサイズを 42px → 14px に変更（1/3）
- [x] 枠線を削除（`border: none`）
- [x] フォールバック色を `#333333` → `#aaaaaa` に変更（CSS + TSX 両方）

### Phase 4: Vercel デプロイ時の型エラー修正

- [x] RPC戻り値が `never` 型になる問題を修正（`database.types.ts` に未登録のため）
  - `as unknown as { data: SpotRow[] | null; error: Error | null }` で型アサーション追加
- [x] `heic-decode` の型定義ファイル作成（`apps/web/types/heic-decode.d.ts`）
  - ライブラリに `@types/heic-decode` が存在しないため `.d.ts` で対応
- [x] `Uint8ClampedArray` → `Uint8ClampedArray<ArrayBuffer>` に修正
  - `ImageData` コンストラクタが `SharedArrayBuffer` を受け付けないため明示的に `ArrayBuffer` を指定

### Phase 5: ドキュメント更新

- [x] `.steering/20260404-map-pin-fix/` 作成（4ファイル）
- [x] `docs/OSHIATO_Database_Schema_v5_1.md` に `get_spots_with_coords` 関数を追記

---

## 変更ファイル一覧

| ファイル | 変更内容 |
|---------|---------|
| `apps/web/components/map/MapView/MapView.tsx` | スポット取得をRPC方式に変更、`parsePoint` 削除、フォールバック色変更、RPC戻り値の型アサーション追加 |
| `apps/web/components/map/MapView/MapView.module.css` | ピンサイズ縮小、枠線削除、フォールバック色変更 |
| `apps/web/types/heic-decode.d.ts` | **新規作成** — `heic-decode` の型定義 |
| Supabase Dashboard（SQL） | `get_spots_with_coords` RPC関数を作成 |
| `docs/OSHIATO_Database_Schema_v5_1.md` | RPC関数の仕様を追記 |
