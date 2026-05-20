import { createClient } from './client';

type Category = 'ooh' | 'popup' | 'event' | 'other';

export async function updatePost(
  postId: string,
  data: { category?: Category; comment?: string | null }
): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('posts')
    .update(data)
    .eq('id', postId);
  return !error;
}

export async function deletePost(postId: string, imageUrls: string[]): Promise<boolean> {
  const supabase = createClient();

  // Storage からファイル削除（メイン画像 + サムネイル）
  const storagePaths: string[] = [];
  for (const url of imageUrls) {
    const marker = '/post-images/';
    const idx = url.indexOf(marker);
    if (idx !== -1) {
      const path = url.slice(idx + marker.length);
      storagePaths.push(path);
      // サムネイルは ".webp" → "_thumb.webp" に変換して追加
      storagePaths.push(path.replace(/\.webp$/, '_thumb.webp'));
    }
  }
  if (storagePaths.length > 0) {
    await supabase.storage.from('post-images').remove(storagePaths);
  }

  // post_images レコード削除
  const { error: imgError } = await supabase
    .from('post_images')
    .delete()
    .eq('post_id', postId);
  if (imgError) return false;

  // posts レコード削除
  const { error: postError } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);
  return !postError;
}

/**
 * 指定した緯度経度から半径50m以内のスポットを検索する
 * 見つかった場合は spot_id を返す、なければ null を返す
 *
 * 前提: Supabase に find_nearby_spot RPC関数が作成済みであること
 * （supabase/migrations/ 内のSQLを実行すること）
 */
export async function findNearbySpot(lat: number, lng: number): Promise<string | null> {
  const supabase = createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('find_nearby_spot', {
    input_lat: lat,
    input_lng: lng,
    radius_meters: 50,
  });

  if (error) {
    console.error('スポット近傍検索エラー:', error);
    return null;
  }

  return data ?? null;
}

/**
 * 新しいスポットを作成して spot_id を返す
 */
export async function createSpot(lat: number, lng: number): Promise<string | null> {
  const supabase = createClient();

  // PostGIS POINT形式: ST_MakePoint(lng, lat) — 経度が先
  const locationWkt = `POINT(${lng} ${lat})`;

  const { data, error } = await supabase
    .from('spots')
    .insert({ location: locationWkt })
    .select('id')
    .single();

  if (error) {
    console.error('スポット作成エラー:', error);
    return null;
  }

  return data?.id ?? null;
}

/**
 * EXIF座標から既存スポットを探すか新規作成して spot_id を返す
 * EXIF座標がない場合は null を返す
 */
export async function findOrCreateSpot(
  lat: number | null,
  lng: number | null
): Promise<string | null> {
  if (lat == null || lng == null) return null;

  const existingId = await findNearbySpot(lat, lng);
  if (existingId) return existingId;

  return createSpot(lat, lng);
}
