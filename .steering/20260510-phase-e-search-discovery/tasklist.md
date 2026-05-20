# Phase E タスクリスト

## Step 1: Supabase SQL（手動実行）

- [x] `supabase/20260510_get_recommended_spots.sql` 作成
  - `get_recommended_spots(target_user_id)` 関数
  - `find_nearby_spots_for_display(lat, lng, radius, limit)` 関数
- [x] Supabase SQL Editor で上記SQLを実行

## Step 2: クエリ関数

- [x] `apps/web/lib/supabase/search.ts` 作成
  - `searchSpots(keyword, oshiId, category)`
  - `findNearbySpotsForDisplay(lat, lng, radiusMeters)`
  - `getSpotsByOshi(oshiId)`
  - `getRecommendedSpots(userId)`

## Step 3: マップ統合型検索（E-1/E-2）※方針変更

- [x] `apps/web/app/search/page.tsx` 作成（タブなし・将来用）
- [x] `apps/web/components/search/SearchPage/SearchPage.tsx` 作成
- [x] `apps/web/components/search/SearchPage/SearchPage.module.css` 作成
- [x] `apps/web/components/search/SearchResultCard/SearchResultCard.tsx` 作成
- [x] `apps/web/components/search/SearchResultCard/SearchResultCard.module.css` 作成
- [x] `apps/web/components/search/NearbySpots/NearbySpots.tsx` 作成
- [x] `apps/web/components/search/NearbySpots/NearbySpots.module.css` 作成
- [x] `apps/web/components/search/MapSearchBar/MapSearchBar.tsx` 作成
- [x] `apps/web/components/search/MapSearchBar/MapSearchBar.module.css` 作成
- [x] `apps/web/components/map/SearchResultSheet/SearchResultSheet.tsx` 作成
- [x] `apps/web/components/map/SearchResultSheet/SearchResultSheet.module.css` 作成
- [x] `apps/web/components/map/MapView/MapView.tsx` に SearchBar・SearchResultSheet を追加
- [x] `MapFilter.module.css` / `OshiFilter.module.css` の top 位置を調整
- ~~Step 6: タブバーに「検索」追加~~ → タブ追加なし（マップ統合に変更）

## Step 7: 推し別スポット一覧（E-3）

- [x] `apps/web/app/oshi/[id]/spots/page.tsx` 作成
- [x] `apps/web/components/oshi/OshiSpotList/OshiSpotList.tsx` 作成
- [x] `apps/web/components/oshi/OshiSpotList/OshiSpotList.module.css` 作成
- [x] `apps/web/components/oshi/OshiCard/OshiCard.tsx` を修正（スポット一覧へのリンク追加）
- [x] `apps/web/app/oshi/page.tsx` を修正（oshiId prop を追加）

## Step 8: マップにレコメンドピン追加（E-5/E-6）← 次回

- [ ] `apps/web/components/map/MapView/MapView.tsx` を修正
  - `getRecommendedSpots` 呼び出し追加
  - レコメンドレイヤー（星ピン）追加
  - レコメンドポップアップ（理由テキスト）追加

## 追加対応（このセッション）

- [x] Mapbox `GeolocateControl` で現在地を青いドット表示
- [x] カスタム locate ボタンを `GeolocateControl` に置き換え
- [x] `search.ts` を FK ネスト結合 → 個別クエリ方式に修正（推し名検索も追加）
- [x] CLAUDE.md に「FK ネスト結合禁止」ルール追記
- [x] `MapSearchBar` から位置情報取得を削除（E-2 は案B で対応）

## 完了確認

- [x] `npx next build` が通る
- [ ] `npx next lint` が通る
- [ ] ブラウザでコンソールエラーなし
- [ ] 検索バーでキーワード検索ができる（コメント・推し名）
- [ ] 検索結果パネルが下から表示される
- [ ] 推し別スポット一覧に遷移できる
- [ ] 現在地が青いドットで地図上に表示される
- [ ] モバイルサイズ（375px）で表示が崩れない
