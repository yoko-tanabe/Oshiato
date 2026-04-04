# Design

## 各問題の技術的アプローチ

---

## 1. HEICファイルのEXIF解析（`extractExif.ts`）

### 問題の原因

`exifr` ライブラリはHEIFコンテナ構造の解析をブラウザ環境で失敗する。
ただし、iPhoneのHEICファイル内部には標準的なTIFF/EXIF形式のデータが埋め込まれている。

### 解決アプローチ

**2段階フォールバック方式**を採用:

1. `exifr.parse(ArrayBuffer)` で通常解析を試みる
2. 失敗した場合、HEICファイルのバイナリを直接スキャンして `Exif\0\0` マーカーを探す
3. マーカー以降のTIFFデータを切り出して `exifr` に渡す

```
HEICファイルのバイナリ構造（概念図）:
[ ISOBMFFボックス群 | Exif\0\0(6byte) | TIFFデータ(GPS・日時) | ... ]
                         ↑ここを探してTIFFデータだけ切り出す
```

### 実装の要点

- `isHeic()` でHEIC/HEIFファイルを判定（MIMEタイプとファイル名拡張子の両方で確認）
- バイトスキャンは `0x45 0x78 0x69 0x66 0x00 0x00`（"Exif\0\0"）を探す
- 複数マーカーが存在する場合はGPS情報が取れるまで順に試みる

---

## 2. Supabase Storage RLSポリシー

### 問題の原因

アプリはPhase 1ではSupabase Auth（公式認証）を使用せず、`device_id` による独自ユーザー管理を採用している。
そのため Supabase Storage にアップロードする際、認証セッションがなく `anon` ロールとして扱われる。
デフォルトではStorageへの書き込みは認証済みユーザーのみ許可されているため弾かれる。

### 解決アプローチ

Supabase SQL Editor で `anon` ロールに `post-images` バケットへのINSERT権限を付与:

```sql
CREATE POLICY "Allow anon uploads"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'post-images');
```

### 将来の対応

Phase 3で本認証（Supabase Auth）に移行する際は、このポリシーを削除し
`auth.uid()` ベースのポリシーに置き換える。

---

## 3. ChromeでのHEIC変換（`processImage.ts`）

### 問題の原因

`heic2any@0.0.4` が内部で使用している `libheif-js` が古く（2019年で更新停止）、
最新iPhoneが生成するHEVCエンコードのHEICファイルに対応できていない。

### 解決アプローチ

**ブラウザネイティブ対応を優先し、失敗時のみライブラリ変換**:

```
HEICファイル
  ↓
createImageBitmap(file) を直接試みる
  ├─ 成功（Safari / iOS）→ そのままWebP変換へ
  └─ 失敗（Chrome等）   → heic-decode でデコード → WebP変換へ
```

**`heic2any` → `heic-decode` への移行理由**:

| | heic2any | heic-decode |
|--|----------|-------------|
| 最終更新 | 2019年（更新停止） | 現在も更新中 |
| libheif-js バージョン | 〜1.11系 | 1.19系（最新） |
| iPhone HEIC対応 | 不安定 | ✅ 対応 |

### 実装の要点

- `heic-decode` は `module.exports = function` 形式のため `.default` でインポート
- 受け取った `ArrayBuffer` は `new Uint8Array()` に変換して渡す必要がある
  （内部で `String.fromCharCode(...array.slice())` を使用しており、`ArrayBuffer` は非イテラブルのため）
- 戻り値 `{ width, height, data: Uint8ClampedArray }` を `ImageData` に変換後、`createImageBitmap` に渡す
