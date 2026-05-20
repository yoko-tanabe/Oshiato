# Phase D：公開スポット閲覧 — 設計

## D-1：投稿時の公開/非公開設定

### DBマイグレーション

```sql
ALTER TABLE posts ADD COLUMN is_public boolean NOT NULL DEFAULT true;
```

既存投稿はすべて `is_public = true` になる。

### 更新ファイル

| ファイル | 変更内容 |
|----------|---------|
| `supabase/migrations/YYYYMMDD_add_is_public_to_posts.sql` | マイグレーションSQL |
| `apps/web/lib/supabase/database.types.ts` | `posts` 型に `is_public: boolean` 追加 |
| `apps/web/components/post/PostForm/PostForm.tsx` | フォームに公開/非公開トグル追加 |
| `apps/web/components/post/PostForm/PostForm.module.css` | トグルのスタイル |

### UI設計（トグル）

```
[ 公開する / 自分だけ ]  ← チェックボックス or セグメント風トグル
「公開すると、地図上で他のユーザーにも見えます」← 説明テキスト
```

## D-2：他ユーザープロフィール（`/user/[id]`）

### 新規ファイル

| ファイル | 内容 |
|----------|------|
| `apps/web/app/user/[id]/page.tsx` | ページルート（SSR） |
| `apps/web/components/user/UserProfile/UserProfile.tsx` | プロフィール本体コンポーネント |
| `apps/web/components/user/UserProfile/UserProfile.module.css` | スタイル |

### 表示内容

- 匿名ネーム・アバター
- 推し一覧（`user_oshis` テーブルから）
- 公開スポット一覧（`posts.is_public = true` かつ `posts.user_id = [id]`）

### RLS考慮

- `user_oshis` は `SELECT` を全員に許可（匿名ネームと推し情報は公開情報とする）
- `posts` は `is_public = true` のもののみ他ユーザーが見られるよう RLS で制御

## D-3：マップに全公開スポットを表示

### 更新ファイル

| ファイル | 変更内容 |
|----------|---------|
| `apps/web/components/map/MapView/MapView.tsx` | 公開スポット取得ロジックを追加 |

### データ取得方針

現在 `MapView.tsx` は自分のスポットのみ取得。
→ 追加で `is_public = true` の全ユーザー投稿を取得し、マージして表示。

自分の投稿か他人の投稿かは `post.user_id === currentUser.id` で判定。

## D-4：視覚的区別

すでに `MapView.tsx` に「他ユーザーの投稿は別色ピン」が一部実装済み。
`is_public` の導入後に整合性を確認・調整する（新規ファイルなし）。

## RLS ポリシー（追加分）

```sql
-- posts: is_public = true なら全員が SELECT 可能
CREATE POLICY "公開投稿は全員閲覧可能" ON posts
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

-- user_oshis: 読み取りは全員OK（公開情報）
CREATE POLICY "推し一覧は全員閲覧可能" ON user_oshis
  FOR SELECT USING (true);
```

## 実装順序

D-1 → D-3 → D-4 → D-2

（is_public カラムを先に追加してから、マップ・プロフィールを実装）
