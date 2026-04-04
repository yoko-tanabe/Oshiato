# 軌跡マップ - 決定ログ

## D1: 軌跡描画方式
- **決定**: GeoJSON Source + Line/Circle Layer（Mapbox GL JS）
- **理由**: 個別 Marker 方式より描画パフォーマンスが良く、線の描画が自然にできる
- **参考**: MapView は Marker 方式だが、軌跡は点数が多くなるため Layer 方式が適切

## D2: visit_logs 挿入失敗の扱い
- **決定**: 投稿自体は成功とし、visit_logs 失敗は console.warn のみ
- **理由**: visit_logs は補助データであり、投稿の成功を妨げるべきではない

## D3: 推しフィルター
- **決定**: Phase 1 では全推しを一括表示、フィルターはPhase 3以降
- **理由**: まず動く状態を優先。フィルターUIの設計は後回し

## D4: RPC vs クライアント側変換
- **決定**: Supabase RPC で PostGIS の GEOGRAPHY → lat/lng 変換
- **理由**: MapView の `get_spots_with_coords` と同じパターン。クライアントでWKBをパースするのは複雑

## D5: RPC の型エラー回避
- **決定**: `(supabase as any).rpc(...)` でキャスト + `eslint-disable` コメント
- **理由**: `get_visit_trajectory` は手動で作成した RPC のため、Supabase の自動生成型 (`database.types.ts`) に含まれない。引数の型が `undefined` と推論されビルドエラーになるため、`as any` で回避した
- **今後**: `supabase gen types` で型を再生成すれば `as any` を除去できる
