# 設計: カテゴリ見直し・期間導入・マップフィルター・ナビ改善・レインボーピン

## D-1: カテゴリの見直し

### 変更対象

| ファイル | 変更内容 |
|---|---|
| `apps/web/lib/supabase/database.types.ts` | posts.category 型を `'ooh' \| 'popup' \| 'event' \| 'other'` に変更 |
| `apps/web/components/post/PostForm/PostForm.tsx` | `Category` 型と `CATEGORIES` 定数を4カテゴリに変更 |
| Supabase DB | `posts` テーブルの CHECK 制約を更新 |
| `docs/OSHIATO_Database_Schema_v5_1.md` | スキーマドキュメントのカテゴリ定義を更新 |

### DB移行SQL

```sql
-- 1. CHECK制約を削除
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_category_check;

-- 2. 既存データを移行
UPDATE posts SET category = 'popup' WHERE category = 'collab_cafe';
UPDATE posts SET category = 'other' WHERE category = 'shop';

-- 3. 新しいCHECK制約を追加
ALTER TABLE posts ADD CONSTRAINT posts_category_check
  CHECK (category IN ('ooh', 'popup', 'event', 'other'));
```

---

## D-2: 期間（有効期限）の導入

### 新規ファイル

| ファイル | 内容 |
|---|---|
| `apps/web/lib/date/periodHelper.ts` | 期間計算ヘルパー関数 |

### ヘルパー関数設計

```typescript
// getWeekMonday(date): 指定日の週の月曜日を返す
// getWeekSunday(date): 指定日の週の日曜日を返す
// calcDefaultPeriod(category, postDate): カテゴリに応じたデフォルト期間を返す
//   - ooh: { start: 週の月曜, end: 週の日曜 }
//   - popup/event/other: { start: postDate, end: 週の日曜 }
```

### PostForm UI変更

- カテゴリ選択の下に期間入力エリアを追加
- OOH選択時: 開始日は自動表示（readonly）、終了日はデフォルト値入り（延長のみ可、min属性でデフォルト値以降に制限）
- popup/event/other: 開始日・終了日の date input を表示（自由入力）
- 未入力で投稿時はデフォルト値を自動計算して保存

### 変更対象

| ファイル | 変更内容 |
|---|---|
| `apps/web/components/post/PostForm/PostForm.tsx` | 期間入力UI追加、送信時にstart_date/end_date計算 |
| `apps/web/components/post/PostForm/PostForm.module.css` | 期間入力フィールドのスタイル |

---

## D-3: マップの期間フィルター

### 新規ファイル

| ファイル | 内容 |
|---|---|
| `apps/web/components/map/MapFilter/MapFilter.tsx` | フィルターバーコンポーネント |
| `apps/web/components/map/MapFilter/MapFilter.module.css` | フィルターバーのスタイル |

### UI設計

- マップ上部に横スクロール可能なチップバー
- チップ: 「すべて」「今日」「明日」「今週」「カスタム」
- 「カスタム」選択時は日付ピッカーを表示
- 選択状態はアクティブカラーで強調

### フィルタリングロジック

- MapViewにフィルター状態（selectedDate）を追加
- スポット取得時にpostsのstart_date/end_dateで絞り込み
- `start_date <= selectedDate AND end_date >= selectedDate` の条件
- 「すべて」選択時はフィルターなし（全スポット表示）

### 変更対象

| ファイル | 変更内容 |
|---|---|
| `apps/web/components/map/MapView/MapView.tsx` | MapFilterコンポーネント統合、フィルター条件でスポット絞り込み |
| `apps/web/lib/supabase/spots.ts` | フィルター条件付きクエリ追加（または既存RPCにパラメータ追加） |

---

## D-4: 訪問ログへのアクセス改善

### 新規ファイル

| ファイル | 内容 |
|---|---|
| `apps/web/components/trajectory/TrajectoryTabs/TrajectoryTabs.tsx` | 軌跡/訪問ログ切り替えタブ |
| `apps/web/components/trajectory/TrajectoryTabs/TrajectoryTabs.module.css` | タブスタイル |

### UI設計

- `/trajectory` ページ上部に2つのタブ: 「軌跡マップ」「訪問ログ」
- タブ切り替えで TrajectoryMap と VisitList を表示切替（クライアントサイド）
- 既存の VisitList コンポーネントをそのまま再利用

### 変更対象

| ファイル | 変更内容 |
|---|---|
| `apps/web/app/trajectory/page.tsx` | TrajectoryTabs をインポート、既存の TrajectoryMap_dynamic を子として渡す |

---

## D-5: チェックイン時のレインボーカラーピン

### デザイン

- チェックイン済みスポットのピンにレインボーグラデーションのボーダーを適用
- 通常ピン: 推しのテーマカラー（単色）
- チェックイン済みピン: レインボーグラデーションのボーダー + テーマカラーの中心

### 実装方法

- MapView のスポット読み込み時に、ユーザーの check_ins を取得
- 各スポットに対してチェックイン済みフラグを判定
- チェックイン済みの場合、ピンのDOM要素にCSSクラス `.rainbow-pin` を追加
- CSSで `conic-gradient` を使ったレインボーボーダーを実装

### 変更対象

| ファイル | 変更内容 |
|---|---|
| `apps/web/components/map/MapView/MapView.tsx` | check_ins取得、ピン描画時にチェックイン済み判定 |
| `apps/web/components/map/MapView/MapView.module.css` | `.pinCheckedIn` スタイル定義（くすみカラー線形グラデーション） |

---

## D-6: UI改善（追加対応）

### カテゴリ選択のハイライト強化

| ファイル | 変更内容 |
|---|---|
| `apps/web/components/post/PostForm/PostForm.module.css` | `.categoryButtonActive` を紫背景+白文字+太字に変更 |

### カレンダーアイコンの白色化

| ファイル | 変更内容 |
|---|---|
| `apps/web/components/post/PostForm/PostForm.module.css` | `::-webkit-calendar-picker-indicator` に `filter: invert(1)` 追加 |

### EXIFメッセージのアイコン改善

| ファイル | 変更内容 |
|---|---|
| `apps/web/components/post/PostForm/PostForm.tsx` | 絵文字をlucide-react（MapPin, AlertTriangle）に置換、flex配置に変更 |
| `apps/web/components/post/PostForm/PostForm.module.css` | `.exifNote` `.exifWarn` に `display: flex; align-items: center; gap: 6px` 追加 |

### PC版HEICプレビュー対応

| ファイル | 変更内容 |
|---|---|
| `apps/web/lib/image/processImage.ts` | `createPreviewUrl()` 関数を新規追加。ブラウザで表示不可のHEICをheic-decodeでデコードしプレビュー用blob URLを生成 |
| `apps/web/components/post/ImagePicker/ImagePicker.tsx` | `createPreviewUrl` を使用したプレビュー生成。表示不可時はフォールバックUI（ImageIconアイコン+「プレビュー不可」） |
| `apps/web/components/post/ImagePicker/ImagePicker.module.css` | `.previewFallback` スタイル追加 |

---

## D-7: 推しカラー選択の拡張

### UI設計

- プリセット8色のグリッド（従来通り）
- 「もっと選ぶ」ボタンで展開するカラーピッカーエリア:
  - 選択中の色プレビュー（丸いスウォッチ + HEXコード）
  - 色相（Hue）バー: 虹色グラデーション、0〜360度
  - 明度（Lightness）バー: 選択中の色相で暗→明のグラデーション、20%〜90%
  - 「この色を選択」確定ボタン
- 使用済みカラー: プリセットはopacity 0.2でグレーアウト、ピッカーはボタンdisabled

### 実装方式

- HSL色空間で色を管理し、`hslToHex()` でHEXに変換
- バーのクリック/ドラッグは `mousedown` + `mousemove` / `touchstart` + `touchmove` で実装
- 親コンポーネント（oshi/page.tsx）から `usedColors` propsで使用済みカラーを受け取り

### 変更対象

| ファイル | 変更内容 |
|---|---|
| `apps/web/components/oshi/AddOshiForm/AddOshiForm.tsx` | カラーピッカーUI追加、hslToHex変換、ドラッグ操作、usedColors props追加 |
| `apps/web/components/oshi/AddOshiForm/AddOshiForm.module.css` | ピッカーエリア、Hue/Lightnessバー、つまみ、プレビュー、使用済みスタイル |
| `apps/web/app/oshi/page.tsx` | usedColors propsを追加（oshiListからtheme_colorを抽出して渡す） |
