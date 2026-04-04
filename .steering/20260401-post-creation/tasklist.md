# タスクリスト - 投稿作成機能（Step 5）

**作成日時**: 2026-04-01（開発セッション開始時）
**最終更新**: 2026-04-04
**担当**: Claude Code + 開発者

---

## 進捗

| # | タスク | 状態 |
|---|--------|------|
| 1 | ステアリングドキュメント作成 | ✅ 完了 |
| 2 | `exifr` パッケージのインストール | ✅ 完了 |
| 3 | `heic2any` パッケージのインストール（HEIC対応追加） | ✅ 完了 |
| 4 | Supabase Storageバケット作成（`post-images`、Public） | ✅ 完了（開発者が実施） |
| 5 | Supabase SQL Editor で `find_nearby_spot` RPC関数を作成 | ✅ 完了（開発者が実施） |
| 6 | `lib/exif/extractExif.ts` の作成 | ✅ 完了 |
| 7 | `lib/image/processImage.ts` の作成（HEIC対応含む） | ✅ 完了 |
| 8 | `lib/supabase/spots.ts` の作成 | ✅ 完了 |
| 9 | `components/post/ImagePicker/ImagePicker.tsx` の作成 | ✅ 完了 |
| 10 | `components/post/ImagePicker/ImagePicker.module.css` の作成 | ✅ 完了 |
| 11 | `components/post/PostForm/PostForm.tsx` の作成 | ✅ 完了 |
| 12 | `components/post/PostForm/PostForm.module.css` の作成 | ✅ 完了 |
| 13 | `app/post/new/page.tsx` の実装 | ✅ 完了 |
| 14 | TypeScriptエラー修正（RPC型・リレーション型） | ✅ 完了 |
| 15 | ESLintチェック | ✅ 完了（エラー0件） |
| 16 | 動作確認（EXIF付き写真で投稿テスト） | 🔄 確認中 |

---

## 実装中に発生した問題と対処

| 問題 | 原因 | 対処 |
|------|------|------|
| `.HEIC` 写真で「The source image could not be decoded」エラー | ブラウザが HEIC 形式に未対応 | `heic2any` ライブラリを追加し、HEIC→JPEG変換を実装 |
| TypeScript エラー（RPC引数型） | 手動作成の Database 型に `Functions` が未定義 | `supabase as any` でキャスト |
| TypeScript エラー（リレーション型） | `user_oshis` の `oshis` リレーションが型定義に未定義 | `unknown as UserOshiRow[]` でキャスト |
| `tsc --noEmit` で全ファイル "not found" エラー | `.next` フォルダが未生成のため | `npm run dev` 起動後に解消される（既知の Next.js 挙動） |
| ブラウザ白画面 | dev サーバーが既に起動中のまま2回目の `npm run dev` を実行 | 既存プロセスをkillして再起動で解消 |

---

## 確認ポイント（開発者向け）

### 完了済み（開発者が実施）
- ✅ Supabase Storage に `post-images` バケット作成（Public設定）
- ✅ Supabase SQL Editor で `find_nearby_spot` RPC関数を実行

### 未確認
- [ ] PostGIS拡張が有効か（Supabaseダッシュボード > SQL Editor で `SELECT PostGIS_Version();` を実行）
- [ ] RLS（Row Level Security）ポリシーがStorageに設定されているか

---

## 完了条件

1. `/post/new` を開くと投稿フォームが表示される
2. HEIC・JPG・PNG 写真を選択できる
3. EXIF付き写真を選択すると「GPS情報を取得しました」が表示される
4. 投稿ボタンを押すと `posts` テーブルにデータが保存される
5. マップ画面に戻ると新しいスポットピンが表示される
