'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, MapPin, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/Toast/ToastProvider';
import ImagePicker from '../ImagePicker/ImagePicker';
import LocationPicker from '../LocationPicker/LocationPicker';
import { extractExif, type ExifData } from '@/lib/exif/extractExif';
import { processImage } from '@/lib/image/processImage';
import { calcDefaultPeriod } from '@/lib/date/periodHelper';
import { findOrCreateSpot } from '@/lib/supabase/spots';
import { createClient } from '@/lib/supabase/client';
import { useCurrentUser } from '@/lib/user/useCurrentUser';
import styles from './PostForm.module.css';

type Category = 'ooh' | 'popup' | 'event' | 'other';

const CATEGORIES: { value: Category; label: string; description: string }[] = [
  { value: 'ooh', label: '広告（OOH）', description: '屋外広告、看板、ラッピングなど' },
  { value: 'popup', label: 'ポップアップ', description: 'コラボカフェ、期間限定ショップなど' },
  { value: 'event', label: 'イベント', description: 'ライブ、握手会、ファンミなど' },
  { value: 'other', label: 'その他', description: '常設ショップ、聖地など' },
];

interface OshiOption {
  oshi_id: string;
  name: string;
  theme_color: string;
}

export default function PostForm() {
  const router = useRouter();
  const { userId } = useCurrentUser();
  const { showToast } = useToast();

  const [images, setImages] = useState<File[]>([]);
  const [exifList, setExifList] = useState<(ExifData | null)[]>([]);
  const [oshiOptions, setOshiOptions] = useState<OshiOption[]>([]);
  const [selectedOshiId, setSelectedOshiId] = useState<string>('');
  const [category, setCategory] = useState<Category>('ooh');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [comment, setComment] = useState('');

  // カテゴリ変更時にデフォルト期間を自動設定
  function handleCategoryChange(newCategory: Category) {
    setCategory(newCategory);
    const today = new Date();
    const defaults = calcDefaultPeriod(newCategory, today);
    setStartDate(defaults.startDate);
    setEndDate(defaults.endDate);
  }

  // 初回マウント時にもデフォルト期間を設定
  useEffect(() => {
    const today = new Date();
    const defaults = calcDefaultPeriod(category, today);
    setStartDate(defaults.startDate);
    setEndDate(defaults.endDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [manualLat, setManualLat] = useState<number | null>(null);
  const [manualLng, setManualLng] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 登録済み推しを取得
  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    type UserOshiRow = {
      oshi_id: string;
      theme_color: string;
      oshis: { name: string } | null;
    };

    supabase
      .from('user_oshis')
      .select('oshi_id, theme_color, oshis(name)')
      .eq('user_id', userId)
      .order('display_order')
      .then(({ data }) => {
        if (!data) return;
        const options = (data as unknown as UserOshiRow[]).map((row) => ({
          oshi_id: row.oshi_id,
          name: row.oshis?.name ?? '不明',
          theme_color: row.theme_color,
        }));
        setOshiOptions(options);
        if (options.length > 0) setSelectedOshiId(options[0].oshi_id);
      });
  }, [userId]);

  // 画像変更時にEXIFを抽出
  async function handleImagesChange(files: File[]) {
    setImages(files);
    const results = await Promise.all(files.map((f) => extractExif(f)));
    setExifList(results);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const supabase = createClient();

    if (images.length === 0) {
      setError('写真を1枚以上選択してください');
      return;
    }
    if (!selectedOshiId) {
      setError('推しを選択してください');
      return;
    }
    if (!userId) {
      setError('ユーザー情報が取得できませんでした。再読み込みしてください');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. EXIF座標 or 手動指定座標からスポットを探すか作成
      const firstExif = exifList.find((e) => e !== null) ?? null;
      const lat = firstExif?.lat ?? manualLat;
      const lng = firstExif?.lng ?? manualLng;
      const spotId = await findOrCreateSpot(lat, lng);

      if (!spotId) {
        setError('位置情報を取得できませんでした。住所検索または地図タップで場所を指定してください');
        setIsSubmitting(false);
        return;
      }

      // 2. 画像を処理してSupabase Storageにアップロード
      const imageUrls: string[] = [];

      for (let i = 0; i < images.length; i++) {
        const { webp, thumbnail } = await processImage(images[i]);

        // 仮のpost_idとしてtimestampを使用（後でpost_id確定後に正式パスへ移行可能）
        const basePath = `${userId}/${Date.now()}_${i}`;

        const { data: imgData, error: imgError } = await supabase.storage
          .from('post-images')
          .upload(`${basePath}.webp`, webp, { contentType: 'image/webp' });

        if (imgError) throw new Error(`画像アップロード失敗: ${imgError.message}`);

        await supabase.storage
          .from('post-images')
          .upload(`${basePath}_thumb.webp`, thumbnail, { contentType: 'image/webp' });

        const { data: urlData } = supabase.storage
          .from('post-images')
          .getPublicUrl(imgData.path);

        imageUrls.push(urlData.publicUrl);
      }

      // 3. postsテーブルに保存
      const defaults = calcDefaultPeriod(category, new Date());
      const finalStartDate = startDate || defaults.startDate;
      const finalEndDate = endDate || defaults.endDate;

      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          spot_id: spotId,
          oshi_id: selectedOshiId,
          user_id: userId,
          category,
          comment: comment.trim() || null,
          start_date: finalStartDate,
          end_date: finalEndDate,
          taken_at: firstExif?.takenAt ?? null,
          taken_location: firstExif
            ? `POINT(${firstExif.lng} ${firstExif.lat})`
            : null,
          status: 'active',
        })
        .select('id')
        .single();

      if (postError) throw new Error(`投稿保存失敗: ${postError.message}`);

      // 4. post_imagesテーブルに保存
      const imageRows = imageUrls.map((url, i) => ({
        post_id: post.id,
        image_url: url,
        display_order: i,
      }));

      const { error: imgRowError } = await supabase
        .from('post_images')
        .insert(imageRows);

      if (imgRowError) throw new Error(`画像情報保存失敗: ${imgRowError.message}`);

      // 5. 訪問ログに記録（軌跡マップ用データ。失敗しても投稿は成功扱い）
      if (lat && lng) {
        try {
          await supabase.from('visit_logs').insert({
            user_id: userId,
            spot_id: spotId,
            oshi_id: selectedOshiId,
            location: `POINT(${lng} ${lat})`,
            visited_at: firstExif?.takenAt ?? new Date().toISOString(),
            source: firstExif ? ('exif' as const) : ('manual' as const),
          });
        } catch (visitError) {
          console.warn('visit_logs挿入スキップ:', visitError);
        }
      }

      // 6. 成功通知 → マップ画面へリダイレクト
      showToast('success', '投稿しました');
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '投稿に失敗しました');
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* 画像選択 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>写真</h2>
        <ImagePicker files={images} onChange={handleImagesChange} />
        {exifList.some((e) => e !== null) && (
          <p className={styles.exifNote}><MapPin size={14} /> GPS情報を取得しました</p>
        )}
        {images.length > 0 && exifList.every((e) => e === null) && (
          <>
            <p className={styles.exifWarn}><AlertTriangle size={14} /> GPS情報なし — 下の地図で場所を指定してください</p>
            <LocationPicker
              onLocationSelect={(lat, lng) => {
                setManualLat(lat);
                setManualLng(lng);
              }}
            />
          </>
        )}
      </section>

      {/* 推し選択 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>推し</h2>
        {oshiOptions.length === 0 ? (
          <p className={styles.emptyNote}>推しが登録されていません。推し管理から追加してください。</p>
        ) : (
          <div className={styles.oshiGrid}>
            {oshiOptions.map((opt) => (
              <button
                key={opt.oshi_id}
                type="button"
                className={`${styles.oshiButton} ${selectedOshiId === opt.oshi_id ? styles.oshiButtonActive : ''}`}
                style={{ '--oshi-color': opt.theme_color } as React.CSSProperties}
                onClick={() => setSelectedOshiId(opt.oshi_id)}
              >
                {opt.name}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* カテゴリ */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>カテゴリ</h2>
        <div className={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              className={`${styles.categoryButton} ${category === cat.value ? styles.categoryButtonActive : ''}`}
              onClick={() => handleCategoryChange(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* 期間 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>期間</h2>
        <p className={styles.periodHint}>
          {category === 'ooh'
            ? 'OOH広告は掲出週が自動設定されます。終了日は延長可能です。'
            : '未入力の場合は今週日曜日までが自動設定されます。'}
        </p>
        <div className={styles.periodRow}>
          <label className={styles.periodLabel}>
            <span className={styles.periodLabelText}>開始</span>
            <input
              type="date"
              className={styles.periodInput}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              readOnly={category === 'ooh'}
            />
          </label>
          <span className={styles.periodSeparator}>〜</span>
          <label className={styles.periodLabel}>
            <span className={styles.periodLabelText}>終了</span>
            <input
              type="date"
              className={styles.periodInput}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={category === 'ooh' ? endDate : startDate || undefined}
            />
          </label>
        </div>
      </section>

      {/* コメント */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>コメント（任意）</h2>
        <textarea
          className={styles.textarea}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="推しの足跡についてひとこと..."
          maxLength={300}
          rows={3}
        />
        <p className={styles.charCount}>{comment.length} / 300</p>
      </section>

      {/* エラー表示 */}
      {error && <p className={styles.error}>{error}</p>}

      {/* 投稿ボタン */}
      <button
        type="submit"
        className={styles.submitButton}
        disabled={isSubmitting || oshiOptions.length === 0}
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className={styles.spinner} />
            投稿中...
          </>
        ) : (
          '投稿する'
        )}
      </button>
    </form>
  );
}
