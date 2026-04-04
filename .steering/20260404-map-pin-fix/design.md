# Design

## 技術的アプローチ

---

## 1. PostGIS GEOGRAPHY型の座標取得問題

### 問題の原因

Supabaseで `GEOGRAPHY(POINT, 4326)` カラムを `.select('location')` で取得すると、WKB（Well-Known Binary）の16進数文字列が返される:

```
0101000020E6100000...（長い16進数）
```

`parsePoint` 関数は以下の2形式にしか対応していなかった:
- WKT形式: `POINT(139.69 35.68)`
- GeoJSON形式: `{"type":"Point","coordinates":[139.69,35.68]}`

WKBはどちらにもマッチしないため、すべてのスポットで `null` が返りピンが描画されなかった。

### 解決アプローチ

**RPC関数で座標を数値として取得する方式**を採用:

```sql
CREATE OR REPLACE FUNCTION get_spots_with_coords()
RETURNS TABLE (
  id UUID,
  lng DOUBLE PRECISION,
  lat DOUBLE PRECISION,
  address TEXT
)
LANGUAGE sql STABLE
AS $$
  SELECT id, ST_X(location::geometry) AS lng, ST_Y(location::geometry) AS lat, address
  FROM spots;
$$;
```

- `ST_X()` / `ST_Y()` で GEOGRAPHY 型から数値の経度・緯度を抽出
- `location::geometry` キャストが必要（`ST_X`/`ST_Y` は GEOMETRY 型を受け取るため）
- クライアント側の `parsePoint` 関数は不要になったため削除

### フロントエンド側の変更

```typescript
// Before: WKBが返り parsePoint でパース失敗
const { data: spots } = await supabase
  .from('spots')
  .select('id, location, address');

// After: RPC で lng/lat を数値として直接取得
const { data: spots } = await supabase
  .rpc('get_spots_with_coords');
```

---

## 2. ピンのサイズ・スタイル調整

| 項目 | Before | After |
|------|--------|-------|
| サイズ | 42px × 42px | 14px × 14px |
| 枠線 | `border: 3px solid #0d0d0d` | `border: none` |
| フォールバック色 | `#333333`（ダークグレー） | `#aaaaaa`（ライトグレー） |
