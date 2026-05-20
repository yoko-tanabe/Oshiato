-- ============================================================
-- E-4: レコメンドスポット取得関数
-- 協調フィルタリングSQL（外部MLなし、PostgreSQL集計のみ）
-- ============================================================
CREATE OR REPLACE FUNCTION get_recommended_spots(target_user_id UUID)
RETURNS TABLE (
  spot_id        UUID,
  latitude       DOUBLE PRECISION,
  longitude      DOUBLE PRECISION,
  oshi_id        UUID,
  oshi_name      TEXT,
  group_name     TEXT,
  category       TEXT,
  score          BIGINT,
  reason_count   BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH
  -- 自分の推しリスト
  my_oshis AS (
    SELECT oshi_id FROM user_oshis WHERE user_id = target_user_id
  ),
  -- 自分と推しが被るユーザー（類似ユーザー）
  similar_users AS (
    SELECT uo.user_id, COUNT(*) AS overlap
    FROM user_oshis uo
    WHERE uo.oshi_id IN (SELECT oshi_id FROM my_oshis)
      AND uo.user_id <> target_user_id
    GROUP BY uo.user_id
    HAVING COUNT(*) >= 1
  ),
  -- 類似ユーザーが推している自分未登録の推し（上位5件）
  candidate_oshis AS (
    SELECT uo.oshi_id, COUNT(DISTINCT su.user_id) AS score
    FROM user_oshis uo
    JOIN similar_users su ON su.user_id = uo.user_id
    WHERE uo.oshi_id NOT IN (SELECT oshi_id FROM my_oshis)
    GROUP BY uo.oshi_id
    ORDER BY score DESC
    LIMIT 5
  )
  -- 候補推しの公開スポットを返す
  SELECT
    s.id                              AS spot_id,
    ST_Y(s.location::geometry)        AS latitude,
    ST_X(s.location::geometry)        AS longitude,
    o.id                              AS oshi_id,
    o.name                            AS oshi_name,
    o.group_name,
    o.category::TEXT,
    co.score,
    co.score                          AS reason_count
  FROM candidate_oshis co
  JOIN oshis o ON o.id = co.oshi_id
  JOIN posts p ON p.oshi_id = o.id AND p.status = 'active' AND p.is_public = true
  JOIN spots s ON s.id = p.spot_id
  ORDER BY co.score DESC, s.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- E-2: 近傍スポット一覧取得関数（検索ページ用）
-- find_nearby_spot（投稿チェック用・50m・1件）とは別に作成
-- ============================================================
CREATE OR REPLACE FUNCTION find_nearby_spots_for_display(
  input_lat      DOUBLE PRECISION,
  input_lng      DOUBLE PRECISION,
  radius_meters  DOUBLE PRECISION DEFAULT 500,
  result_limit   INT              DEFAULT 20
)
RETURNS TABLE (
  spot_id    UUID,
  latitude   DOUBLE PRECISION,
  longitude  DOUBLE PRECISION,
  distance_m DOUBLE PRECISION,
  post_id    UUID,
  oshi_id    UUID,
  oshi_name  TEXT,
  comment    TEXT,
  category   TEXT,
  image_url  TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id                                                     AS spot_id,
    ST_Y(s.location::geometry)                               AS latitude,
    ST_X(s.location::geometry)                               AS longitude,
    ST_Distance(
      s.location::geography,
      ST_MakePoint(input_lng, input_lat)::geography
    )                                                        AS distance_m,
    p.id                                                     AS post_id,
    p.oshi_id,
    o.name                                                   AS oshi_name,
    p.comment,
    p.category::TEXT,
    (SELECT pi.image_url FROM post_images pi WHERE pi.post_id = p.id LIMIT 1) AS image_url
  FROM spots s
  JOIN posts p ON p.spot_id = s.id AND p.status = 'active' AND p.is_public = true
  JOIN oshis o ON o.id = p.oshi_id
  WHERE ST_DWithin(
    s.location::geography,
    ST_MakePoint(input_lng, input_lat)::geography,
    radius_meters
  )
  ORDER BY distance_m ASC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
