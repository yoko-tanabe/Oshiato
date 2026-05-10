import { createClient } from './client';

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
