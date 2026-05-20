-- posts テーブルの RLS を有効化
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 既存の全許可ポリシーが残っていれば削除
DROP POLICY IF EXISTS "Allow all" ON posts;
DROP POLICY IF EXISTS "Enable read access for all users" ON posts;
DROP POLICY IF EXISTS "全員が読める" ON posts;

-- SELECT: 公開投稿は全員、非公開は本人のみ
DROP POLICY IF EXISTS "公開投稿は全員閲覧可能" ON posts;
CREATE POLICY "公開投稿は全員閲覧可能" ON posts
  FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

-- INSERT: ログイン済みユーザーが自分の投稿を作成可能
DROP POLICY IF EXISTS "本人のみ投稿可能" ON posts;
CREATE POLICY "本人のみ投稿可能" ON posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: 本人のみ編集可能
DROP POLICY IF EXISTS "本人のみ編集可能" ON posts;
CREATE POLICY "本人のみ編集可能" ON posts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- DELETE: 本人のみ削除可能
DROP POLICY IF EXISTS "本人のみ削除可能" ON posts;
CREATE POLICY "本人のみ削除可能" ON posts
  FOR DELETE
  USING (auth.uid() = user_id);
