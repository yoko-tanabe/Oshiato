# Requirements

## 作業概要

投稿画面（`/post/new`）の動作確認で発覚した複数のバグを修正する。

---

## 発生した問題

### 問題1：HEICファイルのEXIF解析失敗

- **症状**: HEICファイルをアップロードすると `Could not parse HEIF file Object` というコンソールエラーが出る
- **影響**: GPS情報が取得できず、投稿フォームの送信がブロックされる
- **対象ファイル**: `apps/web/lib/exif/extractExif.ts`

### 問題2：Supabase Storage へのアップロードがRLSで弾かれる

- **症状**: PNG等の通常画像をアップロードすると `new row violates row-level security policy` エラー
- **影響**: 画像のアップロードが一切できない
- **対象**: Supabase Dashboard の Storage RLS ポリシー設定

### 問題3：ChromeでHEICファイルの変換が失敗する

- **症状**: `Could not parse HEIF file Object`（`heic2any` 内部エラー）
- **影響**: ChromeではHEICファイルが変換できず、アップロード失敗
- **対象ファイル**: `apps/web/lib/image/processImage.ts`

---

## 修正の優先度

| 優先度 | 問題 |
|--------|------|
| 高 | Storage RLSエラー（全画像アップロード不可） |
| 高 | HEIC EXIF解析失敗（GPS取得できずフォームブロック） |
| 中 | Chrome でのHEIC変換失敗 |
