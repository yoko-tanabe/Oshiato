/**
 * 投稿の期間（start_date / end_date）を計算するヘルパー関数
 *
 * カテゴリごとのデフォルト期間:
 * - ooh（広告）: 投稿日の週の月曜〜日曜
 * - popup / event / other: 投稿日〜投稿日の週の日曜
 */

/** 指定日の週の月曜日を返す（ISO準拠: 月曜始まり） */
export function getWeekMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=日, 1=月, ..., 6=土
  // 日曜(0)の場合は6日前、それ以外は (day - 1) 日前
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d;
}

/** 指定日の週の日曜日を返す（ISO準拠: 月曜始まり） */
export function getWeekSunday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=日, 1=月, ..., 6=土
  // 日曜(0)の場合はそのまま、それ以外は (7 - day) 日後
  const diff = day === 0 ? 0 : 7 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

/** Date を "YYYY-MM-DD" 形式の文字列に変換（ローカル時間基準） */
export function formatDateToString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

type Category = 'ooh' | 'popup' | 'event' | 'other';

interface Period {
  startDate: string; // "YYYY-MM-DD"
  endDate: string;   // "YYYY-MM-DD"
}

/**
 * カテゴリと投稿日からデフォルトの期間を計算する
 *
 * - ooh: 投稿日の週の月曜〜日曜
 * - popup / event / other: 投稿日〜投稿日の週の日曜
 */
export function calcDefaultPeriod(category: Category, postDate: Date): Period {
  const sunday = getWeekSunday(postDate);

  if (category === 'ooh') {
    const monday = getWeekMonday(postDate);
    return {
      startDate: formatDateToString(monday),
      endDate: formatDateToString(sunday),
    };
  }

  return {
    startDate: formatDateToString(postDate),
    endDate: formatDateToString(sunday),
  };
}
