import { createClient } from './client';

export type Category = 'ooh' | 'popup' | 'event' | 'other';

export interface SearchResult {
  postId: string;
  spotId: string;
  oshiId: string;
  oshiName: string;
  groupName: string | null;
  comment: string | null;
  category: Category;
  imageUrl: string | null;
}

export interface NearbySpot {
  spotId: string;
  latitude: number;
  longitude: number;
  distanceM: number;
  postId: string;
  oshiId: string;
  oshiName: string;
  comment: string | null;
  category: string;
  imageUrl: string | null;
}

export interface RecommendedSpot {
  spotId: string;
  latitude: number;
  longitude: number;
  oshiId: string;
  oshiName: string;
  groupName: string | null;
  category: string;
  score: number;
  reasonCount: number;
}

// E-1: キーワード・推し・カテゴリで公開スポットを検索する
// MapView と同じく FK ネスト結合を避け、個別クエリで組み立てる
export async function searchSpots(
  keyword: string,
  oshiId: string | null,
  category: Category | null
): Promise<SearchResult[]> {
  const supabase = createClient();
  const trimmed = keyword.trim();

  // ① キーワードが推し名・グループ名にマッチする oshi_id を取得
  let keywordOshiIds: string[] = [];
  if (trimmed) {
    const { data: oshiMatches } = await supabase
      .from('oshis')
      .select('id')
      .or(`name.ilike.%${trimmed}%,group_name.ilike.%${trimmed}%`);
    keywordOshiIds = oshiMatches?.map((o) => o.id) ?? [];
  }

  // ② posts を検索（FK ネスト結合なし）
  let query = supabase
    .from('posts')
    .select('id, spot_id, oshi_id, comment, category')
    .eq('is_public', true)
    .eq('status', 'active');

  if (trimmed) {
    if (keywordOshiIds.length > 0) {
      // コメント OR 推し名のどちらかにマッチ
      query = query.or(
        `comment.ilike.%${trimmed}%,oshi_id.in.(${keywordOshiIds.join(',')})`
      );
    } else {
      query = query.ilike('comment', `%${trimmed}%`);
    }
  }
  if (oshiId) {
    query = query.eq('oshi_id', oshiId);
  }
  if (category) {
    query = query.eq('category', category);
  }

  const { data: posts, error } = await query.limit(50);

  if (error) {
    console.error('スポット検索エラー:', error);
    return [];
  }
  if (!posts || posts.length === 0) return [];

  // ③ 推し名を個別取得
  const oshiIds = [...new Set(posts.map((p) => p.oshi_id))];
  const { data: oshiRows } = await supabase
    .from('oshis')
    .select('id, name, group_name')
    .in('id', oshiIds);
  const oshiMap = new Map(oshiRows?.map((o) => [o.id, o]) ?? []);

  // ④ サムネイルを個別取得（post ごとに先頭1件）
  const postIds = posts.map((p) => p.id);
  const { data: imageRows } = await supabase
    .from('post_images')
    .select('post_id, image_url')
    .in('post_id', postIds);
  const imageMap = new Map(imageRows?.map((i) => [i.post_id, i.image_url]) ?? []);

  return posts.map((p) => ({
    postId: p.id,
    spotId: p.spot_id,
    oshiId: p.oshi_id,
    oshiName: oshiMap.get(p.oshi_id)?.name ?? '',
    groupName: oshiMap.get(p.oshi_id)?.group_name ?? null,
    comment: p.comment,
    category: p.category as Category,
    imageUrl: imageMap.get(p.id) ?? null,
  }));
}

// E-2: 現在地周辺の公開スポットを取得する（デフォルト500m・20件）
export async function findNearbySpotsForDisplay(
  lat: number,
  lng: number,
  radiusMeters = 500
): Promise<NearbySpot[]> {
  const supabase = createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('find_nearby_spots_for_display', {
    input_lat: lat,
    input_lng: lng,
    radius_meters: radiusMeters,
    result_limit: 20,
  });

  if (error) {
    console.error('近傍スポット取得エラー:', error);
    return [];
  }

  return (data ?? []).map((row: {
    spot_id: string;
    latitude: number;
    longitude: number;
    distance_m: number;
    post_id: string;
    oshi_id: string;
    oshi_name: string;
    comment: string | null;
    category: string;
    image_url: string | null;
  }) => ({
    spotId: row.spot_id,
    latitude: row.latitude,
    longitude: row.longitude,
    distanceM: row.distance_m,
    postId: row.post_id,
    oshiId: row.oshi_id,
    oshiName: row.oshi_name,
    comment: row.comment,
    category: row.category,
    imageUrl: row.image_url,
  }));
}

// E-3: 推し別の公開スポット一覧を取得する（FK ネスト結合なし）
export async function getSpotsByOshi(oshiId: string): Promise<SearchResult[]> {
  const supabase = createClient();

  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, spot_id, oshi_id, comment, category')
    .eq('oshi_id', oshiId)
    .eq('is_public', true)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('推し別スポット取得エラー:', error);
    return [];
  }
  if (!posts || posts.length === 0) return [];

  // 推し名を取得
  const { data: oshiRow } = await supabase
    .from('oshis')
    .select('id, name, group_name')
    .eq('id', oshiId)
    .single();

  // サムネイルを取得
  const postIds = posts.map((p) => p.id);
  const { data: imageRows } = await supabase
    .from('post_images')
    .select('post_id, image_url')
    .in('post_id', postIds);
  const imageMap = new Map(imageRows?.map((i) => [i.post_id, i.image_url]) ?? []);

  return posts.map((p) => ({
    postId: p.id,
    spotId: p.spot_id,
    oshiId: p.oshi_id,
    oshiName: oshiRow?.name ?? '',
    groupName: oshiRow?.group_name ?? null,
    comment: p.comment,
    category: p.category as Category,
    imageUrl: imageMap.get(p.id) ?? null,
  }));
}

// E-4: 推しレコメンデーション（協調フィルタリング）
export async function getRecommendedSpots(userId: string): Promise<RecommendedSpot[]> {
  const supabase = createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('get_recommended_spots', {
    target_user_id: userId,
  });

  if (error) {
    console.error('レコメンドスポット取得エラー:', error);
    return [];
  }

  return (data ?? []).map((row: {
    spot_id: string;
    latitude: number;
    longitude: number;
    oshi_id: string;
    oshi_name: string;
    group_name: string | null;
    category: string;
    score: number;
    reason_count: number;
  }) => ({
    spotId: row.spot_id,
    latitude: row.latitude,
    longitude: row.longitude,
    oshiId: row.oshi_id,
    oshiName: row.oshi_name,
    groupName: row.group_name,
    category: row.category,
    score: Number(row.score),
    reasonCount: Number(row.reason_count),
  }));
}
