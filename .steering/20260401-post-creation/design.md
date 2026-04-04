# 設計書 - 投稿作成機能（Step 5）

**作成日時**: 2026-04-01（開発セッション開始時）

---

## ファイル構成

```
apps/web/
├── app/post/new/
│   └── page.tsx                        # ページ（stubを実装、use client不可）
├── components/post/
│   ├── PostForm/
│   │   ├── PostForm.tsx                # 投稿フォームUI（use client含む）
│   │   └── PostForm.module.css         # スタイル
│   └── ImagePicker/
│       ├── ImagePicker.tsx             # 画像選択・プレビューUI
│       └── ImagePicker.module.css      # スタイル
└── lib/
    ├── exif/
    │   └── extractExif.ts              # EXIF抽出ロジック（exifrを使用）
    ├── image/
    │   └── processImage.ts             # リサイズ・WebP変換・EXIF削除（Canvas API）
    └── supabase/
        └── spots.ts                    # スポット近傍検索・新規作成
```

---

## 使用ライブラリ

| ライブラリ | 用途 | 理由 |
|-----------|------|------|
| `exifr` | EXIF抽出 | ブラウザ対応・軽量・メンテナンス活発 |
| Canvas API | 画像リサイズ・WebP変換 | ブラウザ標準API、追加ライブラリ不要 |

---

## データフロー

```
ユーザーが写真を選択
    ↓
exifr でEXIF抽出（GPS座標・撮影日時）
    ↓
Canvas API で画像処理（リサイズ・WebP変換・EXIF削除）
    ↓
Supabase Storage にアップロード（本画像・サムネイル）
    ↓
PostGIS でスポット近傍検索（50m以内）
    ├─ 既存スポット発見 → spot_id を使用
    └─ なし → spots テーブルに新規作成
    ↓
posts テーブルに投稿を保存
    ↓
post_images テーブルに画像URL・表示順を保存
    ↓
マップ画面（/）にリダイレクト
```

---

## DBテーブル操作（既存スキーマを使用）

### spots（スポット）
```sql
-- 近傍検索
SELECT id FROM spots
WHERE ST_DWithin(location, ST_MakePoint($lng, $lat)::geography, 50)
ORDER BY ST_Distance(location, ST_MakePoint($lng, $lat)::geography)
LIMIT 1;

-- 新規作成（EXIF座標がある場合）
INSERT INTO spots (location) VALUES (ST_MakePoint($lng, $lat)::geography);
```

### posts（投稿）
```typescript
{
  spot_id: string,
  oshi_id: string,
  user_id: string,
  category: 'sacred_place' | 'sighting' | 'collab' | 'other',
  comment: string | null,
  taken_at: string | null,       // EXIF撮影日時
  taken_location: string | null, // EXIF座標（WKT形式）
  status: 'published'
}
```

### post_images（投稿画像）
```typescript
{
  post_id: string,
  image_url: string,      // 本画像URL
  display_order: number   // 0始まり
}
```

---

## コンポーネント設計

### PostForm.tsx（use client）
```
props: なし
state:
  - images: File[] （選択した画像）
  - oshiId: string | null （選択した推し）
  - category: string
  - comment: string
  - isSubmitting: boolean
  - exifData: { lat, lng, takenAt }[]

イベント:
  - onImagesChange → ImagePickerから受け取る
  - onSubmit → 全処理を実行してリダイレクト
```

### ImagePicker.tsx（use client）
```
props:
  - onChange: (files: File[]) => void
  - maxImages: number（デフォルト4）
state:
  - previews: string[] （ObjectURL）

機能:
  - input[type=file] でファイル選択（accept="image/*"）
  - プレビュー画像グリッド表示
  - ×ボタンで個別削除
```

---

## 画像処理の詳細

```
processImage(file: File): Promise<{ webp: Blob, thumbnail: Blob }>
  1. FileReader で画像読み込み
  2. Canvas に描画
  3. 長辺が1920pxを超える場合はアスペクト比を保ちリサイズ
  4. canvas.toBlob('image/webp', 0.8) で本画像
  5. 400px にリサイズして canvas.toBlob('image/webp', 0.7) でサムネイル
  ※ Canvas.toBlob はEXIFを含まないため、自然にEXIF削除される
```

---

## Supabase Storage バケット

- バケット名: `post-images`（事前に作成が必要）
- パス構成: `{userId}/{postId}/{index}.webp`
- サムネイルパス: `{userId}/{postId}/thumb_{index}.webp`

**注意**: Supabase Storageのバケットが存在しない場合は先に作成する必要がある。
