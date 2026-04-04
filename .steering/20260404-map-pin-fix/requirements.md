# Requirements

## 作業概要

マップ画面（`/`）でスポットのピンが表示されないバグを修正する。

---

## 発生した問題

### 問題1：マップにピンが一切表示されない

- **症状**: Supabaseに投稿済みのスポットがあるにもかかわらず、マップ上にピンが表示されない
- **原因**: PostGIS の `GEOGRAPHY(POINT, 4326)` 型は `.select()` で取得すると WKB（Well-Known Binary）の16進数文字列で返される。`parsePoint` 関数は WKT（`POINT(lng lat)`）と GeoJSON のみ対応しており、WKB をパースできなかった
- **対象ファイル**: `apps/web/components/map/MapView/MapView.tsx`

### 問題2：ピンのサイズが大きすぎる

- **症状**: ピンが 42px × 42px で地図上で目立ちすぎる
- **対応**: 14px × 14px（1/3）に縮小、枠線を削除
- **対象ファイル**: `apps/web/components/map/MapView/MapView.module.css`

### 問題3：フォールバック色が地図に同化する

- **症状**: 推し色が未設定の場合のフォールバック色 `#333333` がダークテーマの地図背景に溶け込んでしまう
- **対応**: `#aaaaaa`（明るめのグレー）に変更
- **対象ファイル**: `MapView.tsx`, `MapView.module.css`
