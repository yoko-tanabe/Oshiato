'use client';

import { useCallback, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import styles from './AddOshiForm.module.css';

// デフォルトのプリセットカラー（8色）
const PRESET_COLORS = [
  '#c4b5fd', // Lavender
  '#f9a8d4', // Pink
  '#86efac', // Mint
  '#7dd3fc', // Sky
  '#fcd34d', // Yellow
  '#fb923c', // Orange
  '#f87171', // Red
  '#a3e635', // Lime
];

type Props = {
  userId: string;
  usedColors: string[];
  onAdded: () => void;
};

/** HSLからHEXに変換 */
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export default function AddOshiForm({ userId, usedColors, onAdded }: Props) {
  const [name, setName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [themeColor, setThemeColor] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // カラーピッカーのstate
  const [hue, setHue] = useState(270);          // 0-360
  const [lightness, setLightness] = useState(70); // 20-90
  const hueBarRef = useRef<HTMLDivElement>(null);
  const lightnessBarRef = useRef<HTMLDivElement>(null);

  function isUsed(color: string): boolean {
    return usedColors.some((c) => c.toLowerCase() === color.toLowerCase());
  }

  function handleColorSelect(color: string) {
    if (isUsed(color)) return;
    setThemeColor(color);
  }

  // 初期選択
  if (themeColor === '') {
    const firstAvailable = PRESET_COLORS.find((c) => !isUsed(c)) ?? PRESET_COLORS[0];
    setThemeColor(firstAvailable);
  }

  // Hueバーのクリック/ドラッグ
  const handleHueInteraction = useCallback((clientX: number) => {
    const bar = hueBarRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newHue = Math.round(ratio * 360);
    setHue(newHue);
    const newColor = hslToHex(newHue, 70, lightness);
    if (!isUsed(newColor)) setThemeColor(newColor);
  }, [lightness, usedColors]); // eslint-disable-line react-hooks/exhaustive-deps

  // Lightnessバーのクリック/ドラッグ
  const handleLightnessInteraction = useCallback((clientX: number) => {
    const bar = lightnessBarRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    // 20%〜90%の範囲にマッピング（暗すぎ・明るすぎを除外）
    const newLightness = Math.round(20 + ratio * 70);
    setLightness(newLightness);
    const newColor = hslToHex(hue, 70, newLightness);
    if (!isUsed(newColor)) setThemeColor(newColor);
  }, [hue, usedColors]); // eslint-disable-line react-hooks/exhaustive-deps

  // ドラッグ操作の共通ハンドラ
  function startDrag(handler: (clientX: number) => void) {
    return (e: React.MouseEvent | React.TouchEvent) => {
      const getX = (ev: MouseEvent | TouchEvent) =>
        'touches' in ev ? ev.touches[0].clientX : (ev as MouseEvent).clientX;

      handler('touches' in e ? e.touches[0].clientX : e.clientX);

      const onMove = (ev: MouseEvent | TouchEvent) => {
        ev.preventDefault();
        handler(getX(ev));
      };
      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('touchend', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('touchend', onUp);
    };
  }

  const spectrumColor = hslToHex(hue, 70, lightness);
  const huePosition = (hue / 360) * 100;
  const lightnessPosition = ((lightness - 20) / 70) * 100;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const { data: oshi, error: oshiError } = await supabase
      .from('oshis')
      .insert({ name: name.trim(), group_name: groupName.trim() || null })
      .select('id')
      .single();

    if (oshiError || !oshi) {
      setError('推しの登録に失敗しました');
      setIsSubmitting(false);
      return;
    }

    const { error: linkError } = await supabase
      .from('user_oshis')
      .insert({ user_id: userId, oshi_id: oshi.id, theme_color: themeColor });

    if (linkError) {
      setError('推しの紐付けに失敗しました');
      setIsSubmitting(false);
      return;
    }

    setName('');
    setGroupName('');
    setThemeColor('');
    setShowPicker(false);
    setIsSubmitting(false);
    onAdded();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>推しを追加</h2>

      <label className={styles.label}>
        推しの名前 <span className={styles.required}>*</span>
        <input
          className={styles.input}
          type="text"
          placeholder="例：田中花子"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
        />
      </label>

      <label className={styles.label}>
        グループ名（任意）
        <input
          className={styles.input}
          type="text"
          placeholder="例：○○○48"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          maxLength={50}
        />
      </label>

      <div className={styles.label}>
        テーマカラー
        <div className={styles.colorGrid}>
          {PRESET_COLORS.map((color) => {
            const used = isUsed(color);
            return (
              <button
                key={color}
                type="button"
                className={`${styles.colorButton} ${themeColor === color ? styles.selected : ''} ${used ? styles.colorUsed : ''}`}
                style={{ background: color }}
                onClick={() => handleColorSelect(color)}
                disabled={used}
                aria-label={`${color}${used ? '（使用済み）' : ''}`}
                title={used ? '使用済み' : ''}
              />
            );
          })}
        </div>

        <button
          type="button"
          className={styles.toggleColors}
          onClick={() => setShowPicker(!showPicker)}
        >
          {showPicker ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {showPicker ? '閉じる' : 'もっと選ぶ'}
        </button>

        {showPicker && (
          <div className={styles.pickerArea}>
            {/* 選択中の色プレビュー */}
            <div className={styles.pickerPreview}>
              <div
                className={styles.pickerPreviewSwatch}
                style={{ background: spectrumColor }}
              />
              <span className={styles.pickerPreviewHex}>{spectrumColor}</span>
            </div>

            {/* Hue（色相）バー */}
            <div className={styles.barLabel}>色合い</div>
            <div
              ref={hueBarRef}
              className={styles.hueBar}
              onMouseDown={startDrag(handleHueInteraction)}
              onTouchStart={startDrag(handleHueInteraction)}
            >
              <div
                className={styles.barThumb}
                style={{ left: `${huePosition}%` }}
              />
            </div>

            {/* Lightness（明度）バー */}
            <div className={styles.barLabel}>明るさ</div>
            <div
              ref={lightnessBarRef}
              className={styles.lightnessBar}
              style={{
                background: `linear-gradient(to right, ${hslToHex(hue, 70, 20)}, ${hslToHex(hue, 70, 55)}, ${hslToHex(hue, 70, 90)})`,
              }}
              onMouseDown={startDrag(handleLightnessInteraction)}
              onTouchStart={startDrag(handleLightnessInteraction)}
            >
              <div
                className={styles.barThumb}
                style={{ left: `${lightnessPosition}%` }}
              />
            </div>

            {/* スペクトラムの色を確定するボタン */}
            <button
              type="button"
              className={styles.pickerApply}
              onClick={() => {
                if (!isUsed(spectrumColor)) {
                  setThemeColor(spectrumColor);
                }
              }}
              disabled={isUsed(spectrumColor)}
            >
              {isUsed(spectrumColor) ? 'この色は使用済みです' : 'この色を選択'}
            </button>
          </div>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button
        className={styles.submit}
        type="submit"
        disabled={!name.trim() || isSubmitting}
      >
        {isSubmitting ? '追加中...' : '追加する'}
      </button>
    </form>
  );
}
