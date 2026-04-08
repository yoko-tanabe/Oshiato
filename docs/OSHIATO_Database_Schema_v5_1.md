# OSHIATO データベース定義書

**地図であなたのOSHIの足跡を残す**

---

| 項目 | 内容 |
|------|------|
| バージョン | v5.1 |
| 作成日 | 2026年3月 |
| 対応要件定義書 | v5.1 |
| データベース | PostgreSQL 15+ (Supabase) |

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|------------|------|----------|
| v1.0 | 2026/03 | 初版作成 |
| v5.0 | 2026/03 | Phase別テーブル構成に整理、最小構成を明確化 |
| v5.1 | 2026/03 | Phase 1-2にusers, user_oshis, check_ins, visit_logsを追加、EXIF関連カラム追加 |
| v5.2 | 2026/03 | check_insにchecked_dateカラムを追加（TIMESTAMPTZ式インデックスの非IMMUTABLE問題に対応） |

---

## 1. Phase別テーブル構成

### 1.1 概要

```
┌─────────────────────────────────────────────────────────────────┐
│                    Phase別テーブル構成                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Phase 1-2: プロトタイプ構成（9テーブル）                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  users, user_oshis, oshis, areas,                      │   │
│  │  spots, posts, post_images, check_ins, visit_logs      │   │
│  │  ※ usersは簡易版（認証なし、端末識別のみ）             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            ↓                                   │
│  Phase 3: MVP構成（+6テーブル = 15テーブル）                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  + replies, dm_requests, dm_rooms, dm_messages,        │   │
│  │    blocks, notifications                               │   │
│  │  ※ usersを本格版に拡張（Supabase Auth連携）            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            ↓                                   │
│  Phase 4: フル構成（+5テーブル = 20テーブル）                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  + cards, card_images, area_completions, encounters,   │   │
│  │    reports                                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 テーブル一覧

| Phase | テーブル名 | 説明 |
|-------|-----------|------|
| **1-2** | spots | スポット情報 |
| **1-2** | posts | 投稿 |
| **1-2** | post_images | 投稿画像 |
| **1-2** | oshis | 推しマスタ |
| **1-2** | areas | エリアマスタ |
| **1-2** | users | ユーザー（簡易版） |
| **1-2** | user_oshis | ユーザー×推し |
| **1-2** | check_ins | チェックイン |
| **1-2** | visit_logs | 訪問ログ |
| **3** | replies | 返信 |
| **3** | dm_requests | DMリクエスト |
| **3** | dm_rooms | DMルーム |
| **3** | dm_messages | DMメッセージ |
| **3** | blocks | ブロック |
| **3** | notifications | 通知 |
| **4** | cards | カード |
| **4** | card_images | カード画像 |
| **4** | area_completions | エリアコンプリート |
| **4** | encounters | すれ違い |
| **4** | reports | 通報 |

---

## 2. ER図

### 2.1 Phase 1-2: プロトタイプ構成

```
┌─────────────────────────────────────────────────────────────────┐
│                Phase 1-2 ER図（プロトタイプ構成）                │
└─────────────────────────────────────────────────────────────────┘

                              ┌─────────────┐
                              │   users     │
                              │─────────────│
                              │ id (PK)     │
                              │ device_id   │ ← Phase 1-2は端末識別
                              │ display_name│
                              └──────┬──────┘
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           │                         │                         │
           ▼                         ▼                         ▼
    ┌─────────────┐           ┌─────────────┐           ┌─────────────┐
    │ user_oshis  │           │   posts     │           │  check_ins  │
    │─────────────│           │─────────────│           │─────────────│
    │ user_id(FK) │           │ user_id(FK) │           │ user_id(FK) │
    │ oshi_id(FK) │           │ spot_id(FK) │           │ spot_id(FK) │
    │ theme_color │           │ oshi_id(FK) │           │ checked_at  │
    └──────┬──────┘           │ taken_at    │           └─────────────┘
           │                  │ taken_loc   │
           │                  └──────┬──────┘
           │                         │
           ▼                         │ 1:N
    ┌─────────────┐                  ▼
    │    oshis    │           ┌─────────────┐
    │─────────────│           │ post_images │
    │ id (PK)     │           │─────────────│
    │ name        │           │ post_id(FK) │
    │ group_name  │           │ image_url   │
    └─────────────┘           └─────────────┘

    ┌─────────────┐           ┌─────────────┐
    │   spots     │◄──────────│ visit_logs  │
    │─────────────│    N:1    │─────────────│
    │ id (PK)     │           │ user_id(FK) │
    │ location    │           │ spot_id(FK) │
    │ area_id(FK) │           │ oshi_id(FK) │
    └──────┬──────┘           │ visited_at  │ ← EXIFから
           │                  │ location    │ ← EXIFから
           │ N:1              │ source      │
           ▼                  └─────────────┘
    ┌─────────────┐
    │   areas     │
    │─────────────│
    │ id (PK)     │
    │ name        │
    │ prefecture  │
    └─────────────┘
```

### 2.2 Phase 3: MVP構成

```
┌─────────────────────────────────────────────────────────────────┐
│                    Phase 3 ER図（MVP構成）                       │
└─────────────────────────────────────────────────────────────────┘

                              ┌─────────────┐
                              │   users     │
                              │─────────────│
                              │ id (PK)     │
                              │ anon_name   │
                              │ email       │
                              └──────┬──────┘
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           │                         │                         │
           ▼                         ▼                         ▼
    ┌─────────────┐           ┌─────────────┐           ┌─────────────┐
    │ user_oshis  │           │   posts     │           │  check_ins  │
    │─────────────│           │─────────────│           │─────────────│
    │ user_id(FK) │           │ user_id(FK) │           │ user_id(FK) │
    │ oshi_id(FK) │           │ spot_id(FK) │           │ spot_id(FK) │
    │ theme_color │           │ oshi_id(FK) │           │ checked_at  │
    └─────────────┘           └──────┬──────┘           └─────────────┘
                                     │
                                     │ 1:N
                                     ▼
                              ┌─────────────┐
                              │  replies    │
                              │─────────────│
                              │ post_id(FK) │
                              │ user_id(FK) │
                              │ content     │
                              └─────────────┘

    ┌─────────────┐           ┌─────────────┐           ┌─────────────┐
    │ dm_requests │──────────►│  dm_rooms   │──────────►│dm_messages  │
    │─────────────│    1:1    │─────────────│    1:N    │─────────────│
    │ from_user   │           │ user1_id    │           │ room_id(FK) │
    │ to_user     │           │ user2_id    │           │ sender_id   │
    │ status      │           │             │           │ content     │
    └─────────────┘           └─────────────┘           └─────────────┘
```

---

## 3. テーブル定義詳細

### 3.1 Phase 1-2 テーブル（プロトタイプ）

#### users（ユーザー - 簡易版）

Phase 1-2では認証なしで、端末識別のみ行います。

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|----------|----------|------|------------|------|
| id | UUID | NO | gen_random_uuid() | PK |
| device_id | TEXT | NO | | 端末識別子 |
| display_name | TEXT | YES | | 表示名 |
| created_at | TIMESTAMPTZ | NO | NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | NO | NOW() | 更新日時 |

```sql
-- ユニーク制約
ALTER TABLE users ADD CONSTRAINT uq_users_device_id UNIQUE (device_id);
```

**Phase 3での拡張:**
- `auth_id` を追加（Supabase Auth連携）
- `anonymous_name`, `avatar_url`, `bio` 等を追加
- RLSポリシーを追加

#### user_oshis（ユーザー×推し）

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|----------|----------|------|------------|------|
| id | UUID | NO | gen_random_uuid() | PK |
| user_id | UUID | NO | | ユーザーID (FK) |
| oshi_id | UUID | NO | | 推しID (FK) |
| theme_color | TEXT | NO | '#FF6B9D' | テーマカラー |
| is_primary | BOOLEAN | NO | false | メイン推し |
| display_order | INT | NO | 1 | 表示順 |
| created_at | TIMESTAMPTZ | NO | NOW() | 作成日時 |

```sql
-- ユニーク制約
ALTER TABLE user_oshis ADD CONSTRAINT uq_user_oshi UNIQUE (user_id, oshi_id);
```

#### check_ins（チェックイン）

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|----------|----------|------|------------|------|
| id | UUID | NO | gen_random_uuid() | PK |
| user_id | UUID | NO | | ユーザーID (FK) |
| spot_id | UUID | NO | | スポットID (FK) |
| checked_at | TIMESTAMPTZ | NO | NOW() | チェックイン日時 |
| checked_date | DATE | NO | CURRENT_DATE | チェックイン日付（日次重複防止用） |

```sql
-- ユニーク制約（同日に同じスポットへの重複チェックイン防止）
-- ※ TIMESTAMPTZ式はIMMUTABLEでないため、DATE型カラムを別途用意して制約をかける
CONSTRAINT uq_daily_checkin UNIQUE (user_id, spot_id, checked_date)
```

#### spots（スポット）

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|----------|----------|------|------------|------|
| id | UUID | NO | gen_random_uuid() | PK |
| location | GEOGRAPHY(POINT) | NO | | 位置情報 |
| address | TEXT | YES | | 住所 |
| area_id | UUID | YES | | エリアID (FK) |
| created_at | TIMESTAMPTZ | NO | NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | NO | NOW() | 更新日時 |

```sql
-- インデックス
CREATE INDEX idx_spots_location ON spots USING GIST(location);
CREATE INDEX idx_spots_area_id ON spots(area_id);
```

#### posts（投稿）

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|----------|----------|------|------------|------|
| id | UUID | NO | gen_random_uuid() | PK |
| spot_id | UUID | NO | | スポットID (FK) |
| oshi_id | UUID | NO | | 推しID (FK) |
| user_id | UUID | YES | | ユーザーID (FK) ※Phase 3で追加 |
| category | TEXT | NO | | カテゴリ |
| comment | TEXT | YES | | コメント(140字) |
| start_date | DATE | NO | | 掲載開始日 |
| end_date | DATE | NO | | 掲載終了日 |
| taken_at | TIMESTAMPTZ | YES | | 撮影日時（EXIFから抽出） |
| taken_location | GEOGRAPHY(POINT) | YES | | 撮影場所（EXIFから抽出） |
| status | TEXT | NO | 'active' | ステータス |
| reply_count | INT | NO | 0 | 返信数 |
| created_at | TIMESTAMPTZ | NO | NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | NO | NOW() | 更新日時 |

```sql
-- チェック制約
ALTER TABLE posts ADD CONSTRAINT chk_posts_category 
  CHECK (category IN ('ooh', 'popup', 'event', 'other'));
ALTER TABLE posts ADD CONSTRAINT chk_posts_status 
  CHECK (status IN ('active', 'expired', 'deleted'));
ALTER TABLE posts ADD CONSTRAINT chk_posts_comment_length 
  CHECK (LENGTH(comment) <= 140);

-- インデックス
CREATE INDEX idx_posts_spot_id ON posts(spot_id);
CREATE INDEX idx_posts_oshi_id ON posts(oshi_id);
CREATE INDEX idx_posts_status_created ON posts(status, created_at DESC);
CREATE INDEX idx_posts_taken_location ON posts USING GIST(taken_location);
```

#### post_images（投稿画像）

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|----------|----------|------|------------|------|
| id | UUID | NO | gen_random_uuid() | PK |
| post_id | UUID | NO | | 投稿ID (FK) |
| image_url | TEXT | NO | | 画像URL |
| display_order | INT | NO | 1 | 表示順 |
| created_at | TIMESTAMPTZ | NO | NOW() | 作成日時 |

```sql
-- インデックス
CREATE INDEX idx_post_images_post_id ON post_images(post_id);
```

#### oshis（推しマスタ）

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|----------|----------|------|------------|------|
| id | UUID | NO | gen_random_uuid() | PK |
| name | TEXT | NO | | 推し名 |
| group_name | TEXT | YES | | グループ名 |
| category | TEXT | NO | 'idol' | カテゴリ |
| created_at | TIMESTAMPTZ | NO | NOW() | 作成日時 |

```sql
-- チェック制約
ALTER TABLE oshis ADD CONSTRAINT chk_oshis_category 
  CHECK (category IN ('idol', 'kpop', 'anime', 'voice_actor', 'other'));

-- ユニークインデックス（同名＋同グループの重複防止）
CREATE UNIQUE INDEX IF NOT EXISTS idx_oshis_name_group
  ON oshis (name, COALESCE(group_name, ''));
```

#### areas（エリアマスタ）

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|----------|----------|------|------------|------|
| id | UUID | NO | gen_random_uuid() | PK |
| name | TEXT | NO | | エリア名 |
| prefecture | TEXT | NO | | 都道府県 |
| bounds | GEOGRAPHY(POLYGON) | YES | | 境界 |
| total_spots | INT | NO | 0 | スポット総数 |
| created_at | TIMESTAMPTZ | NO | NOW() | 作成日時 |

---

### 3.2 Phase 3 追加テーブル

#### users 拡張（本格版）

Phase 3でSupabase Auth連携に拡張します。

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|----------|----------|------|------------|------|
| id | UUID | NO | | PK (Supabase Auth連携) |
| device_id | TEXT | YES | | 端末識別子（移行用） |
| anonymous_name | TEXT | NO | | 匿名ネーム |
| avatar_url | TEXT | YES | | アバター画像 |
| bio | TEXT | YES | | 自己紹介 |
| notification_distance | INT | NO | 500 | 通知距離(m) |
| privacy_mode | BOOLEAN | NO | false | プライバシーモード |
| total_visits | INT | NO | 0 | 総訪問数 |
| total_posts | INT | NO | 0 | 総投稿数 |
| created_at | TIMESTAMPTZ | NO | NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | NO | NOW() | 更新日時 |

```sql
-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
ON users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
ON users FOR UPDATE USING (auth.uid() = id);
```

#### replies（返信）

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|----------|----------|------|------------|------|
| id | UUID | NO | gen_random_uuid() | PK |
| post_id | UUID | NO | | 投稿ID (FK) |
| user_id | UUID | NO | | ユーザーID (FK) |
| content | TEXT | NO | | 返信内容(140字) |
| created_at | TIMESTAMPTZ | NO | NOW() | 作成日時 |

```sql
-- チェック制約
ALTER TABLE replies ADD CONSTRAINT chk_replies_content_length 
  CHECK (LENGTH(content) <= 140);
```

#### dm_requests（DMリクエスト）

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|----------|----------|------|------------|------|
| id | UUID | NO | gen_random_uuid() | PK |
| from_user_id | UUID | NO | | 送信者ID (FK) |
| to_user_id | UUID | NO | | 受信者ID (FK) |
| message | TEXT | YES | | リクエストメッセージ |
| status | TEXT | NO | 'pending' | ステータス |
| created_at | TIMESTAMPTZ | NO | NOW() | 作成日時 |
| responded_at | TIMESTAMPTZ | YES | | 応答日時 |

```sql
-- チェック制約
ALTER TABLE dm_requests ADD CONSTRAINT chk_dm_requests_status 
  CHECK (status IN ('pending', 'accepted', 'rejected'));
```

#### dm_rooms（DMルーム）

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|----------|----------|------|------------|------|
| id | UUID | NO | gen_random_uuid() | PK |
| user1_id | UUID | NO | | ユーザー1 ID (FK) |
| user2_id | UUID | NO | | ユーザー2 ID (FK) |
| last_message_at | TIMESTAMPTZ | YES | | 最終メッセージ日時 |
| created_at | TIMESTAMPTZ | NO | NOW() | 作成日時 |

```sql
-- ユニーク制約
ALTER TABLE dm_rooms ADD CONSTRAINT uq_dm_room_users 
  UNIQUE (LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id));
```

#### dm_messages（DMメッセージ）

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|----------|----------|------|------------|------|
| id | UUID | NO | gen_random_uuid() | PK |
| room_id | UUID | NO | | ルームID (FK) |
| sender_id | UUID | NO | | 送信者ID (FK) |
| content | TEXT | NO | | メッセージ内容 |
| is_read | BOOLEAN | NO | false | 既読フラグ |
| created_at | TIMESTAMPTZ | NO | NOW() | 作成日時 |

```sql
-- RLS
ALTER TABLE dm_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own DM messages"
ON dm_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM dm_rooms
    WHERE dm_rooms.id = dm_messages.room_id
    AND (dm_rooms.user1_id = auth.uid() OR dm_rooms.user2_id = auth.uid())
  )
);
```

---

## 4. EXIF情報の取り扱い

### 4.1 EXIF活用方針

写真のEXIF情報から位置と日時を抽出し、推し活の記録に活用します。

```
┌─────────────────────────────────────────────────────────────────┐
│                    EXIF処理フロー                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  写真選択 → EXIF抽出 → DB保存 + 画像処理                        │
│                                                                 │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │
│  │ 元の写真    │────►│ EXIF抽出    │────►│ DB保存      │       │
│  │ (EXIF付き)  │     │ GPS座標     │     │ taken_at    │       │
│  │             │     │ 撮影日時    │     │ taken_loc   │       │
│  └─────────────┘     └──────┬──────┘     │ visited_at  │       │
│                             │            └─────────────┘       │
│                             ▼                                  │
│                      ┌─────────────┐     ┌─────────────┐       │
│                      │ 画像処理    │────►│ Storage     │       │
│                      │ EXIF削除    │     │ (公開用)    │       │
│                      │ リサイズ    │     │ EXIF無し    │       │
│                      │ WebP変換    │     │             │       │
│                      └─────────────┘     └─────────────┘       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 プライバシー保護（RLS）

```sql
-- 撮影位置は本人のみ閲覧可能
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 公開用ビュー（撮影位置を除外）
CREATE VIEW v_public_posts AS
SELECT 
  id, spot_id, oshi_id, user_id,
  category, comment, start_date, end_date,
  taken_at,  -- 撮影日時は公開OK
  -- taken_location は除外（プライバシー保護）
  status, reply_count, created_at
FROM posts
WHERE status = 'active';

-- 本人は全情報を閲覧可能
CREATE POLICY "Users can view own posts with location"
ON posts FOR SELECT
USING (auth.uid() = user_id);

-- 他人の投稿は公開情報のみ（taken_locationはNULLで返す）
CREATE POLICY "Public can view posts without location"
ON posts FOR SELECT
USING (status = 'active');
```

#### blocks（ブロック）

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|----------|----------|------|------------|------|
| id | UUID | NO | gen_random_uuid() | PK |
| blocker_id | UUID | NO | | ブロックした人 (FK) |
| blocked_id | UUID | NO | | ブロックされた人 (FK) |
| created_at | TIMESTAMPTZ | NO | NOW() | 作成日時 |

```sql
-- ユニーク制約
ALTER TABLE blocks ADD CONSTRAINT uq_block UNIQUE (blocker_id, blocked_id);
```

#### notifications（通知）

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|----------|----------|------|------------|------|
| id | UUID | NO | gen_random_uuid() | PK |
| user_id | UUID | NO | | ユーザーID (FK) |
| type | TEXT | NO | | 通知タイプ |
| title | TEXT | NO | | タイトル |
| body | TEXT | NO | | 本文 |
| data | JSONB | YES | | 追加データ |
| is_read | BOOLEAN | NO | false | 既読フラグ |
| created_at | TIMESTAMPTZ | NO | NOW() | 作成日時 |

```sql
-- チェック制約
ALTER TABLE notifications ADD CONSTRAINT chk_notifications_type 
  CHECK (type IN ('nearby_spot', 'reply', 'dm', 'card_earned', 'area_complete'));

-- インデックス
CREATE INDEX idx_notifications_user_unread 
ON notifications(user_id, is_read, created_at DESC) WHERE is_read = false;
```

---

### 3.3 Phase 4 追加テーブル

#### cards（カード）

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|----------|----------|------|------------|------|
| id | UUID | NO | gen_random_uuid() | PK |
| user_id | UUID | NO | | ユーザーID (FK) |
| card_type | TEXT | NO | | カードタイプ |
| oshi_id | UUID | YES | | 推しID (FK) |
| area_id | UUID | YES | | エリアID (FK) |
| card_image_url | TEXT | YES | | カード画像URL |
| physical_status | TEXT | NO | 'not_requested' | 物理カード状態 |
| created_at | TIMESTAMPTZ | NO | NOW() | 作成日時 |

```sql
-- チェック制約
ALTER TABLE cards ADD CONSTRAINT chk_cards_type 
  CHECK (card_type IN ('normal', 'hologram', 'trajectory'));
ALTER TABLE cards ADD CONSTRAINT chk_cards_physical_status 
  CHECK (physical_status IN ('not_requested', 'requested', 'shipped', 'delivered'));
```

---

## 5. 初期マイグレーション

### 5.1 Phase 1-2 マイグレーション

```sql
-- 拡張機能
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- users テーブル（簡易版）
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL UNIQUE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- areas テーブル
CREATE TABLE areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  prefecture TEXT NOT NULL,
  bounds GEOGRAPHY(POLYGON),
  total_spots INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- oshis テーブル
CREATE TABLE oshis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  group_name TEXT,
  category TEXT NOT NULL DEFAULT 'idol',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_oshis_category CHECK (category IN ('idol', 'kpop', 'anime', 'voice_actor', 'other'))
);

-- oshis ユニークインデックス（同名＋同グループの重複防止）
CREATE UNIQUE INDEX IF NOT EXISTS idx_oshis_name_group
  ON oshis (name, COALESCE(group_name, ''));

-- user_oshis テーブル
CREATE TABLE user_oshis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  oshi_id UUID NOT NULL REFERENCES oshis(id),
  theme_color TEXT NOT NULL DEFAULT '#FF6B9D',
  is_primary BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_oshi UNIQUE (user_id, oshi_id)
);

-- spots テーブル
CREATE TABLE spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  address TEXT,
  area_id UUID REFERENCES areas(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_spots_location ON spots USING GIST(location);

-- posts テーブル
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id UUID NOT NULL REFERENCES spots(id),
  oshi_id UUID NOT NULL REFERENCES oshis(id),
  user_id UUID REFERENCES users(id),
  category TEXT NOT NULL,
  comment TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  taken_at TIMESTAMPTZ,  -- 撮影日時（EXIFから抽出）
  taken_location GEOGRAPHY(POINT, 4326),  -- 撮影場所（EXIFから抽出）
  status TEXT NOT NULL DEFAULT 'active',
  reply_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_posts_category CHECK (category IN ('ooh', 'popup', 'event', 'other')),
  CONSTRAINT chk_posts_status CHECK (status IN ('active', 'expired', 'deleted')),
  CONSTRAINT chk_posts_comment_length CHECK (LENGTH(comment) <= 140)
);
CREATE INDEX idx_posts_status_created ON posts(status, created_at DESC);
CREATE INDEX idx_posts_taken_location ON posts USING GIST(taken_location);

-- post_images テーブル
CREATE TABLE post_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_post_images_post_id ON post_images(post_id);

-- check_ins テーブル
-- ※ TIMESTAMPTZ式はIMMUTABLEでないため、checked_date DATE カラムで日次重複を管理する
CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  spot_id UUID NOT NULL REFERENCES spots(id),
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  checked_date DATE NOT NULL DEFAULT CURRENT_DATE,
  CONSTRAINT uq_daily_checkin UNIQUE (user_id, spot_id, checked_date)
);
CREATE INDEX idx_check_ins_user ON check_ins(user_id, checked_at DESC);

-- visit_logs テーブル
CREATE TABLE visit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  spot_id UUID NOT NULL REFERENCES spots(id),
  oshi_id UUID NOT NULL REFERENCES oshis(id),
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT NOT NULL DEFAULT 'checkin',
  CONSTRAINT chk_visit_logs_source CHECK (source IN ('checkin', 'exif', 'manual'))
);
CREATE INDEX idx_visit_logs_user_visited ON visit_logs(user_id, visited_at DESC);
CREATE INDEX idx_visit_logs_location ON visit_logs USING GIST(location);
```

### 5.2 サンプルデータ

```sql
-- エリア
INSERT INTO areas (name, prefecture) VALUES
  ('渋谷', '東京都'),
  ('新宿', '東京都'),
  ('池袋', '東京都'),
  ('原宿', '東京都'),
  ('秋葉原', '東京都');

-- 推し（マスタデータ）
-- ハロプロ・STARTOのグループ＋メンバーをシードデータとして投入
-- 詳細は supabase/seed-oshis-hello-project.sql, supabase/seed-oshis-starto.sql を参照
INSERT INTO oshis (name, group_name, category) VALUES
  ('モーニング娘。', NULL, 'idol'),        -- 箱推し用
  ('譜久村聖', 'モーニング娘。', 'idol'),    -- メンバー個人
  ...
ON CONFLICT (name, COALESCE(group_name, '')) DO NOTHING;

-- スポット（サンプル）
INSERT INTO spots (location, address, area_id) VALUES
  (ST_GeogFromText('POINT(139.7016 35.6580)'), '東京都渋谷区渋谷1-1-1', (SELECT id FROM areas WHERE name = '渋谷')),
  (ST_GeogFromText('POINT(139.7005 35.6895)'), '東京都新宿区新宿3-1-1', (SELECT id FROM areas WHERE name = '新宿'));
```

---

## 6. 便利なビュー

### 6.1 アクティブ投稿ビュー

```sql
CREATE VIEW v_active_posts AS
SELECT 
  p.*,
  ST_X(s.location::geometry) as longitude,
  ST_Y(s.location::geometry) as latitude,
  o.name as oshi_name,
  o.group_name,
  a.name as area_name
FROM posts p
JOIN spots s ON p.spot_id = s.id
JOIN oshis o ON p.oshi_id = o.id
LEFT JOIN areas a ON s.area_id = a.id
WHERE p.status = 'active'
  AND p.start_date <= CURRENT_DATE
  AND p.end_date >= CURRENT_DATE;
```

### 6.2 軌跡マップビュー

```sql
CREATE VIEW v_user_trajectory AS
SELECT 
  vl.id as visit_log_id,
  vl.user_id,
  ST_X(vl.location::geometry) as longitude,
  ST_Y(vl.location::geometry) as latitude,
  vl.visited_at,
  uo.oshi_id,
  uo.theme_color,
  o.name as oshi_name
FROM visit_logs vl
JOIN user_oshis uo ON vl.user_id = uo.user_id AND vl.oshi_id = uo.oshi_id
JOIN oshis o ON uo.oshi_id = o.id
ORDER BY vl.visited_at ASC;
```

---

## 7. 近接検索ファンクション

```sql
CREATE OR REPLACE FUNCTION find_nearby_spots(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_meters INT DEFAULT 500
)
RETURNS TABLE (
  spot_id UUID,
  distance_meters DOUBLE PRECISION,
  post_id UUID,
  oshi_name TEXT,
  category TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as spot_id,
    ST_Distance(
      s.location,
      ST_GeogFromText('POINT(' || user_lng || ' ' || user_lat || ')')
    ) as distance_meters,
    p.id as post_id,
    o.name as oshi_name,
    p.category
  FROM spots s
  JOIN posts p ON s.id = p.spot_id
  JOIN oshis o ON p.oshi_id = o.id
  WHERE p.status = 'active'
    AND p.start_date <= CURRENT_DATE
    AND p.end_date >= CURRENT_DATE
    AND ST_DWithin(
      s.location,
      ST_GeogFromText('POINT(' || user_lng || ' ' || user_lat || ')'),
      radius_meters
    )
  ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql;
```

### 7.2 スポット座標取得ファンクション

マップ表示用。`GEOGRAPHY` 型は `.select()` で WKB（バイナリ）が返るため、`ST_X()` / `ST_Y()` で数値として取得する。

```sql
CREATE OR REPLACE FUNCTION get_spots_with_coords()
RETURNS TABLE (
  id UUID,
  lng DOUBLE PRECISION,
  lat DOUBLE PRECISION,
  address TEXT
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    id,
    ST_X(location::geometry) AS lng,
    ST_Y(location::geometry) AS lat,
    address
  FROM spots;
$$;
```

**使用箇所**: `MapView.tsx` — `supabase.rpc('get_spots_with_coords')` で呼び出し

---

## 8. データ型選定理由

### 8.1 UUID vs SERIAL

| 項目 | UUID | SERIAL |
|------|------|--------|
| **採用** | ✅ 採用 | ❌ 不採用 |
| **理由** | 分散生成可能、URLに含めても推測困難 | 連番は推測されやすい |

**具体的なメリット:**
- クライアント側でIDを生成可能（オフライン対応の余地）
- IDから投稿数などの情報を推測されない
- 将来的なシャーディングに対応しやすい

### 8.2 GEOGRAPHY vs GEOMETRY

| 項目 | GEOGRAPHY | GEOMETRY |
|------|-----------|----------|
| **採用** | ✅ 採用 | ❌ 不採用 |
| **座標系** | 緯度・経度（地球面） | 平面座標 |
| **距離計算** | メートル単位で正確 | 座標単位（変換必要） |

**具体的なメリット:**
- `ST_DWithin(location, point, 500)` で「500メートル以内」を直接指定可能
- 日本全国で正確な距離計算が可能

### 8.3 TIMESTAMPTZ vs TIMESTAMP

| 項目 | TIMESTAMPTZ | TIMESTAMP |
|------|-------------|-----------|
| **採用** | ✅ 採用 | ❌ 不採用 |
| **タイムゾーン** | 考慮する | 考慮しない |

**具体的なメリット:**
- 将来の多言語対応（訪日外国人）に備える
- サーバー・クライアント間のタイムゾーン差異を吸収

---

## 9. インデックス戦略

### 9.1 インデックス一覧

| テーブル | カラム | 種類 | 用途 |
|----------|--------|------|------|
| spots | location | GiST | 位置検索 |
| posts | status, created_at | B-tree | タイムライン表示 |
| posts | taken_location | GiST | 撮影位置検索 |
| post_images | post_id | B-tree | 投稿の画像取得 |
| visit_logs | user_id, visited_at | B-tree | 軌跡マップ表示 |
| visit_logs | location | GiST | 位置検索 |
| check_ins | user_id, checked_at | B-tree | チェックイン履歴 |
| oshis | name, COALESCE(group_name, '') | B-tree (UNIQUE) | 同名＋同グループの重複防止 |
| user_oshis | user_id | B-tree | ユーザーの推し取得 |

### 9.2 GiSTインデックスの説明

**GiST (Generalized Search Tree)** は、PostGISの空間データに最適なインデックスです。

```sql
-- 例: 500m以内のスポットを検索
-- GiSTインデックスにより高速に検索可能
SELECT * FROM spots
WHERE ST_DWithin(location, ST_MakePoint(139.7, 35.6)::geography, 500);
```

**なぜB-treeではダメか:**
- B-treeは1次元のソート順序でしか検索できない
- 2次元の空間データ（緯度・経度）には不向き
- GiSTは「近い場所」をまとめて管理できる

### 9.3 複合インデックスの設計

```sql
-- 良い例: よく一緒に使うカラムを複合インデックスに
CREATE INDEX idx_posts_status_created ON posts(status, created_at DESC);

-- 理由: WHERE status = 'active' ORDER BY created_at DESC
-- というクエリが多いため
```

---

**OSHIATO データベース定義書 v5.1**
