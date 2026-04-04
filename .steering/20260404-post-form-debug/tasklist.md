# Tasklist

## 2026-04-04 投稿フォームデバッグ作業

---

## 完了タスク

### Phase 1: 原因調査

- [x] ブラウザコンソールエラーの内容を確認
- [x] 関連ファイルの読み込み・構造把握
  - `apps/web/app/post/new/page.tsx`
  - `apps/web/components/post/PostForm/PostForm.tsx`
  - `apps/web/components/post/ImagePicker/ImagePicker.tsx`
  - `apps/web/lib/exif/extractExif.ts`
  - `apps/web/lib/image/processImage.ts`
  - `apps/web/lib/supabase/spots.ts`
  - `apps/web/lib/user/useCurrentUser.ts`

### Phase 2: Storage RLSエラーの修正

- [x] RLSエラーの原因特定（Phase 1はSupabase Auth未使用のため `anon` ロールでアクセス）
- [x] Supabase SQL Editor でポリシーを追加
  ```sql
  CREATE POLICY "Allow anon uploads"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'post-images');
  ```
- [x] PNG画像でアップロード動作を確認

### Phase 3: HEICのEXIF抽出修正

- [x] `exifr.parse(file)` → `exifr.parse(ArrayBuffer)` に変更（効果なし）
- [x] HEICバイナリスキャン方式（`Exif\0\0` マーカー検索）を実装
- [x] SafariでHEICのGPS情報取得を確認（「GPS情報を取得しました」表示）

### Phase 4: ChromeでのHEIC変換修正

- [x] `heic2any` の限界を確認（libheif-js が古く最新HEICに非対応）
- [x] `@jsquash/heic` のインストール試行 → npm に存在しないことが判明
- [x] `heic-decode` パッケージを確認・インストール
  ```bash
  cd apps/web && npm install heic-decode
  ```
- [x] `processImage.ts` を `heic-decode` に移行
- [x] インポート方式のバグ修正（`{ decode }` → `.default`）
- [x] `ArrayBuffer` → `Uint8Array` 変換バグ修正（スプレッド演算子エラー）
- [x] ChromeでHEICアップロード動作を確認

### Phase 5: ドキュメント更新

- [x] `docs/OSHIATO_Technical_Architecture_v5_1.md` 更新
  - `browser-image-compression` → `heic-decode` に変更
- [x] `docs/OSHIATO_Setup_Guide.md` 更新
  - Storage RLSポリシー設定手順を追加（4.1.4節）
- [x] `.steering/20260404-post-form-debug/` 作成

---

## 変更ファイル一覧

| ファイル | 変更内容 |
|---------|---------|
| `apps/web/lib/exif/extractExif.ts` | HEICバイナリスキャンによるEXIFフォールバック追加 |
| `apps/web/lib/image/processImage.ts` | `heic2any` → `heic-decode` に置き換え、Safari優先処理を追加 |
| `apps/web/package.json` | `heic-decode@2.1.0` 追加、`heic2any` 削除 |
| `docs/OSHIATO_Technical_Architecture_v5_1.md` | ライブラリ一覧を実態に合わせて更新 |
| `docs/OSHIATO_Setup_Guide.md` | Storage RLSポリシー手順を追加 |
| Supabase Dashboard（SQL） | `post-images` バケットの匿名アップロードポリシー追加 |
