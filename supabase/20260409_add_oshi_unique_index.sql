-- 推しマスタの重複防止: (name, group_name) のユニークインデックス
-- group_name が NULL の場合も一意性を保証するため COALESCE を使用
--
-- 実行方法: Supabase Dashboard > SQL Editor で実行

-- Step 1: 重複レコードの解消
-- 同じ (name, group_name) の組み合わせで、古いほうのIDに統一する
-- まず user_oshis の参照先を古いほうに付け替える
UPDATE user_oshis
SET oshi_id = keeper.id
FROM (
  SELECT DISTINCT ON (name, COALESCE(group_name, ''))
    id, name, group_name
  FROM oshis
  ORDER BY name, COALESCE(group_name, ''), created_at ASC
) AS keeper
WHERE user_oshis.oshi_id IN (
  SELECT id FROM oshis o
  WHERE o.name = keeper.name
    AND COALESCE(o.group_name, '') = COALESCE(keeper.group_name, '')
    AND o.id != keeper.id
);

-- posts の参照先も同様に付け替える
UPDATE posts
SET oshi_id = keeper.id
FROM (
  SELECT DISTINCT ON (name, COALESCE(group_name, ''))
    id, name, group_name
  FROM oshis
  ORDER BY name, COALESCE(group_name, ''), created_at ASC
) AS keeper
WHERE posts.oshi_id IN (
  SELECT id FROM oshis o
  WHERE o.name = keeper.name
    AND COALESCE(o.group_name, '') = COALESCE(keeper.group_name, '')
    AND o.id != keeper.id
);

-- 重複レコード（新しいほう）を削除
DELETE FROM oshis
WHERE id NOT IN (
  SELECT DISTINCT ON (name, COALESCE(group_name, ''))
    id
  FROM oshis
  ORDER BY name, COALESCE(group_name, ''), created_at ASC
);

-- Step 2: ユニークインデックスを作成
CREATE UNIQUE INDEX IF NOT EXISTS idx_oshis_name_group
  ON oshis (name, COALESCE(group_name, ''));
