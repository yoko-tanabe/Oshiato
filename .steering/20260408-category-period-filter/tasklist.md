# タスクリスト: カテゴリ見直し・期間導入・マップフィルター・ナビ改善・レインボーピン・UI改善

## 0-1: カテゴリの見直し

- [x] `database.types.ts` の posts.category 型を更新
- [x] `PostForm.tsx` の Category 型と CATEGORIES 定数を変更
- [x] Supabase DB の CHECK 制約更新（SQL実行）
- [x] `docs/OSHIATO_Database_Schema_v5_1.md` のカテゴリ定義を更新
- [x] TypeScript / ESLint エラーチェック

## 0-2: 期間（有効期限）の導入

- [x] `lib/date/periodHelper.ts` を新規作成
- [x] `PostForm.tsx` に期間入力UIを追加
- [x] `PostForm.module.css` に期間フィールドのスタイルを追加
- [x] 投稿送信時のstart_date/end_date計算ロジックを実装
- [x] TypeScript / ESLint エラーチェック

## 0-3: マップの期間フィルター

- [x] `MapFilter/MapFilter.tsx` を新規作成
- [x] `MapFilter/MapFilter.module.css` を新規作成
- [x] `MapView.tsx` にMapFilterを統合、フィルタリングロジック追加
- [x] `spots.ts` — クライアントサイドフィルタリングのため変更不要
- [x] TypeScript / ESLint エラーチェック

## 0-4: 訪問ログへのアクセス改善

- [x] `TrajectoryTabs/TrajectoryTabs.tsx` を新規作成
- [x] `TrajectoryTabs/TrajectoryTabs.module.css` を新規作成
- [x] `trajectory/page.tsx` にTrajectoryTabsを統合
- [x] TypeScript / ESLint エラーチェック

## 0-5: チェックイン時のレインボーカラーピン

- [x] `MapView.module.css` にレインボーピンスタイルを追加（くすみカラー、線形グラデーション）
- [x] `MapView.tsx` にcheck_ins取得とチェックイン済み判定を追加
- [x] ピン描画時にレインボークラスを適用
- [x] TypeScript / ESLint エラーチェック

## 0-7: 推しカラー選択の拡張

- [x] `AddOshiForm.tsx` にHSLカラーピッカー（色相バー+明度バー）を追加
- [x] `AddOshiForm.module.css` にピッカーエリア・バー・つまみ・使用済みスタイルを追加
- [x] `oshi/page.tsx` から `usedColors` propsを追加
- [x] 使用済みカラーのグレーアウト・選択不可を実装
- [x] TypeScript / ESLint エラーチェック

## 0-6: UI改善（追加対応）

- [x] カテゴリ選択ボタンのハイライト強化（紫背景+白文字+太字）
- [x] カレンダーアイコンの白色化（`::-webkit-calendar-picker-indicator` に `filter: invert(1)`）
- [x] EXIFメッセージの絵文字をlucide-reactアイコンに変更（MapPin, AlertTriangle）
- [x] PC版HEICプレビュー対応（`createPreviewUrl()` を `processImage.ts` に追加）
- [x] ImagePickerのフォールバックUI追加（プレビュー不可時のアイコン表示）
- [x] TypeScript / ESLint エラーチェック

## 最終確認

- [x] `npx next build` で全体のビルド成功
- [ ] ブラウザでの動作確認（モバイル375px）
- [x] steering / docs ドキュメントの更新完了
