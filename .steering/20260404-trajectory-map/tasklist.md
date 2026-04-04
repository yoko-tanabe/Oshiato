# 軌跡マップ - タスクリスト

## タスク

- [x] 1. PostForm に visit_logs 挿入を追加（PostForm.tsx 修正）
- [x] 2. Supabase RPC `get_visit_trajectory` を作成（開発者がSQL実行）
- [x] 3. TrajectoryMap コンポーネント作成（TrajectoryMap.tsx + .module.css）
- [x] 4. TrajectoryMap の dynamic import ラッパー作成（TrajectoryMap_dynamic.tsx）
- [x] 5. trajectory/page.tsx を修正してコンポーネント表示
- [x] 6. ビルド確認（TypeScript / ESLint エラーなし）
- [ ] 7. ブラウザ動作確認（開発者による手動確認待ち）

## 作成・修正したファイル

| 操作 | ファイル |
|------|---------|
| 修正 | `components/post/PostForm/PostForm.tsx` — visit_logs 挿入追加（L173-184） |
| 新規 | `components/trajectory/TrajectoryMap/TrajectoryMap.tsx` — 軌跡マップ本体 |
| 新規 | `components/trajectory/TrajectoryMap/TrajectoryMap.module.css` — スタイル |
| 新規 | `components/trajectory/TrajectoryMap/TrajectoryMap_dynamic.tsx` — SSR無効ラッパー |
| 修正 | `app/trajectory/page.tsx` — プレースホルダー → TrajectoryMap_dynamic |
| SQL  | Supabase RPC `get_visit_trajectory` — visit_logs から lat/lng を返す関数 |

## 備考
- ビルド時に RPC の型エラーが発生 → `as any` キャストで解決（D5 参照）
