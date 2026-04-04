# Decision

## 技術的判断の記録

---

## 決定1: HEICのEXIF抽出はバイナリスキャンで対応する

**背景**: `exifr` のHEIFパーサーがブラウザ環境で失敗し、`ArrayBuffer` に変換しても解決しなかった。

**選択肢**:
- A. `exifr` の別オプションを試す → 試したが効果なし
- B. HEICをJPEGに変換してからEXIFを読む → `heic2any` はEXIFを保持しない
- C. HEICバイナリを直接スキャンしてEXIFを切り出す → **採用**

**理由**: HEICファイルは内部に標準TIFF/EXIFデータを持つため、コンテナ解析を回避して直接EXIFを抽出できる。追加ライブラリ不要でシンプルに解決できる。

---

## 決定2: `heic2any` を `heic-decode` に置き換える

**背景**: `heic2any@0.0.4` が最新iPhoneのHEICファイルで `Could not parse HEIF file` エラーを出し、変換できない。

**選択肢**:
- A. `heic2any` を使い続ける → 最新HEICに対応できない
- B. Next.js APIルートでサーバーサイド変換（`sharp` 使用） → 大きなアーキテクチャ変更が必要
- C. `@jsquash/heic` を使う → npm に存在しなかった（パッケージ名が不正確）
- D. `heic-decode` を使う → **採用**

**理由**: `heic-decode` は `libheif-js@1.19系`（最新）を使用しており、ブラウザ対応済み。クライアントサイドのみで完結し、アーキテクチャ変更が最小限。

---

## 決定3: HEICはSafariネイティブを優先し、Chromeはフォールバックで対応する

**背景**: Safari/iOSはHEICをネイティブで扱えるため、余計なライブラリ処理を挟まない方が高速・安定。

**判断**: `createImageBitmap(file)` を先に試み、失敗した場合のみ `heic-decode` を使う2段階方式を採用。

---

## 決定4: Supabase StorageのRLSは `anon` ロールに付与する（Phase 1限定）

**背景**: Phase 1はSupabase Authを使わないため、アップロード時に認証セッションがない。

**判断**: Phase 1プロトタイプでは `anon` ロールへの書き込み許可を付与。Phase 3の本認証移行時にポリシーを `auth.uid()` ベースに変更する前提で進める。

**リスク**: 誰でも `post-images` バケットに書き込める状態になる。Phase 1プロトタイプの範囲では許容する。
