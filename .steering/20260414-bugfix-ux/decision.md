# バグ修正 + UX改善 - 決定事項

## 1-1: メモリリーク
- useEffectのクリーンアップパターンを使用（Reactの標準的な方法）

## 1-2: タイムゾーン
- 外部ライブラリ（date-fns等）は使わず、素のJSで実装
- `getFullYear/getMonth/getDate`でローカル日付を取得

## 1-3: 地図状態保持
- sessionStorageではなくlocalStorageを使用（ブラウザ再起動後も保持）
- 保存タイミング: mapのmoveendイベント（パフォーマンスのためmove中は保存しない）
