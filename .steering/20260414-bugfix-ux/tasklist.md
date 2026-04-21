# バグ修正 + UX改善 - タスクリスト

## 1-1: メモリリーク修正（ImagePicker）
- [x] `ImagePicker.tsx` のuseEffectにBlob URLクリーンアップを追加
- [x] TypeScript / ESLint エラーチェック

## 1-2: チェックインのタイムゾーン修正
- [x] `checkins.ts` のローカル日付取得ヘルパー関数を追加
- [x] L34, L80のtoISOString()をヘルパー関数に置き換え
- [x] TypeScript / ESLint エラーチェック

## 1-3: 地図の状態保持
- [x] `MapView.tsx` にlocalStorage保存/読み込みロジックを追加
- [x] TypeScript / ESLint エラーチェック

## 最終確認
- [x] TypeScript型チェック（`npx tsc --noEmit`）— エラーなし
- [x] ESLint — エラーなし
- [ ] ブラウザでの動作確認
