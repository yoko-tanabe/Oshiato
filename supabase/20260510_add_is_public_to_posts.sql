-- Phase D: posts テーブルに公開/非公開フラグを追加

ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true;

-- 既存の posts SELECT ポリシーを差し替え（存在する場合は削除してから再作成）
DROP POLICY IF EXISTS "公開投稿は全員閲覧可能" ON posts;
CREATE POLICY "公開投稿は全員閲覧可能" ON posts
  FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

-- user_oshis: 本人のみ読み取り可能（プライバシー保護）
-- レコメンド機能は Phase E で SECURITY DEFINER 付き関数で実装するため、
-- 直接テーブルアクセスは本人に限定しても統計集計は可能
DROP POLICY IF EXISTS "推し一覧は全員閲覧可能" ON user_oshis;
DROP POLICY IF EXISTS "推し一覧は本人のみ閲覧可能" ON user_oshis;
CREATE POLICY "推し一覧は本人のみ閲覧可能" ON user_oshis
  FOR SELECT
  USING (auth.uid() = user_id);
