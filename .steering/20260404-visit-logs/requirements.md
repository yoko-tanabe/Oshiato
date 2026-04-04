# 訪問ログページ - 要件

## 目的

`/visits` のプレースホルダーを実際の訪問ログ一覧ページに置き換える。ユーザーが自分の訪問履歴を確認できるようにする。

## 機能

- `visit_logs` テーブルから自分の訪問記録を取得
- 月別にグループ化して表示（TimelineGrid のパターン再利用）
- 各カード: 日時 / スポット住所 / 推し名 / ソース種別（exif / checkin / manual）
- タップで `/spot/[id]` へ遷移
- サマリー表示（総訪問数 / ユニークスポット数）
- EmptyState / LoadingSpinner 使用

## データソース

`visit_logs` テーブル:
- `id`, `user_id`, `spot_id`, `oshi_id`, `location`(GEOGRAPHY), `visited_at`, `source`

関連テーブル:
- `spots` — `address` を取得
- `oshis` — `name` を取得（推し名表示用）
- `user_oshis` — `theme_color` を取得（推し色表示用）
