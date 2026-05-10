import { createClient } from './client';

/**
 * 2点間の距離をメートルで返す（Haversine 公式）
 */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000; // 地球の半径（メートル）
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** チェックイン可能な最大距離（メートル） */
const MAX_CHECKIN_DISTANCE = 200;

/**
 * ローカルタイムゾーンの日付を YYYY-MM-DD 形式で返す
 * toISOString() は UTC を返すため、日本時間との日付ズレを防ぐ
 */
function getLocalDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 当日チェックイン済みかどうかを確認
 */
export async function isCheckedInToday(
  userId: string,
  spotId: string,
): Promise<boolean> {
  const supabase = createClient();
  const today = getLocalDateString();

  const { data } = await supabase
    .from('check_ins')
    .select('id')
    .eq('user_id', userId)
    .eq('spot_id', spotId)
    .eq('checked_date', today)
    .limit(1);

  return (data?.length ?? 0) > 0;
}

/**
 * チェックイン実行
 * 1. 現在地とスポットの距離を確認（200m以内）
 * 2. check_ins テーブルに挿入
 * 3. visit_logs テーブルに挿入（source: 'checkin'）
 */
export async function performCheckIn(params: {
  userId: string;
  spotId: string;
  oshiId: string;
  spotLat: number;
  spotLng: number;
  userLat: number;
  userLng: number;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { userId, spotId, oshiId, spotLat, spotLng, userLat, userLng } = params;

  // 距離チェック
  const distance = haversineDistance(userLat, userLng, spotLat, spotLng);
  if (distance > MAX_CHECKIN_DISTANCE) {
    return {
      success: false,
      error: `スポットから${Math.round(distance)}m離れています（${MAX_CHECKIN_DISTANCE}m以内でチェックインできます）`,
    };
  }

  // 当日チェックイン済みか確認
  const alreadyCheckedIn = await isCheckedInToday(userId, spotId);
  if (alreadyCheckedIn) {
    return { success: false, error: '本日はすでにチェックイン済みです' };
  }

  const now = new Date().toISOString();
  const today = getLocalDateString();

  // check_ins に挿入
  const { error: checkInError } = await supabase
    .from('check_ins')
    .insert({
      user_id: userId,
      spot_id: spotId,
      checked_at: now,
      checked_date: today,
    });

  if (checkInError) {
    return { success: false, error: 'チェックインに失敗しました' };
  }

  // visit_logs に挿入（失敗してもチェックイン自体は成功扱い）
  try {
    await supabase.from('visit_logs').insert({
      user_id: userId,
      spot_id: spotId,
      oshi_id: oshiId,
      location: `POINT(${userLng} ${userLat})`,
      visited_at: now,
      source: 'checkin' as const,
    });
  } catch {
    // visit_logs 挿入失敗は無視
  }

  return { success: true };
}
