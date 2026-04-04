# スポット詳細ページ - 要件

## 目的

`/spot/[id]` のプレースホルダーを実際のスポット詳細ページに置き換える。訪問ログやマップからの遷移先として機能させる。

## 機能

- スポット住所ヘッダー + 戻るボタン
- 関連投稿の写真ギャラリーグリッド
- 推し名バッジ + 日付オーバーレイ
- CheckInButton の配置
- 訪問回数の表示

## データソース

- `spots` テーブル — address（RPC `get_spots_with_coords` でlat/lngも取得）
- `posts` テーブル — spot_id で絞り込み、oshi_id を取得
- `post_images` テーブル — 写真URL
- `oshis` + `user_oshis` — 推し名・テーマカラー
- `visit_logs` — 訪問回数カウント
