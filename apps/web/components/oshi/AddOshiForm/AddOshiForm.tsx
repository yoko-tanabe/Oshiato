'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
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

/** サジェスト候補の型 */
type OshiSuggestion = {
  id: string;
  name: string;
  group_name: string | null;
};

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

  // サジェスト関連
  const [suggestions, setSuggestions] = useState<OshiSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedOshiId, setSelectedOshiId] = useState<string | null>(null);
  const [, setIsNewOshi] = useState(false);
  const suggestRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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

  // サジェスト検索
  const searchOshis = useCallback(async (keyword: string) => {
    if (keyword.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const { data } = await supabase
      .from('oshis')
      .select('id, name, group_name')
      .or(`name.ilike.%${keyword}%,group_name.ilike.%${keyword}%`)
      .limit(10);

    if (data) {
      setSuggestions(data);
      setShowSuggestions(true);
    }
  }, []);

  // 入力変更時のハンドラ
  function handleNameChange(value: string) {
    setName(value);
    // 既存選択をリセット
    setSelectedOshiId(null);
    setIsNewOshi(false);
    setGroupName('');

    // デバウンスで検索
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchOshis(value.trim());
    }, 300);
  }

  // 候補を選択
  function handleSelectSuggestion(oshi: OshiSuggestion) {
    setSelectedOshiId(oshi.id);
    setName(oshi.name);
    setGroupName(oshi.group_name ?? '');
    setIsNewOshi(false);
    setShowSuggestions(false);
    setSuggestions([]);
  }

  // 新規登録を選択
  function handleSelectNew() {
    setSelectedOshiId(null);
    setIsNewOshi(true);
    setShowSuggestions(false);
    setSuggestions([]);
  }

  // サジェスト外クリックで閉じる
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (suggestRef.current && !suggestRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    const newLightness = Math.round(20 + ratio * 70);
    setLightness(newLightness);
    const newColor = hslToHex(hue, 70, newLightness);
    if (!isUsed(newColor)) setThemeColor(newColor);
  }, [hue, usedColors]); // eslint-disable-line react-hooks/exhaustive-deps

  // ドラッグ操作の共通ハンドラ（useMemoで事前計算しJSX内でのref渡しを回避）
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

  // eslint-disable-next-line react-hooks/refs
  const hueDragHandler = useMemo(() => startDrag(handleHueInteraction), [handleHueInteraction]);
  // eslint-disable-next-line react-hooks/refs
  const lightnessDragHandler = useMemo(() => startDrag(handleLightnessInteraction), [handleLightnessInteraction]);

  const spectrumColor = hslToHex(hue, 70, lightness);
  const huePosition = (hue / 360) * 100;
  const lightnessPosition = ((lightness - 20) / 70) * 100;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    let oshiId = selectedOshiId;

    // 既存の推しが選択されていない場合は新規作成（または既存を検索）
    if (!oshiId) {
      const trimmedName = name.trim();
      const trimmedGroup = groupName.trim() || null;

      // まず同名＋同グループの既存レコードを検索
      let query = supabase
        .from('oshis')
        .select('id')
        .eq('name', trimmedName);

      if (trimmedGroup) {
        query = query.eq('group_name', trimmedGroup);
      } else {
        query = query.is('group_name', null);
      }

      const { data: existing } = await query.maybeSingle();

      if (existing) {
        // 既に存在する場合はそのIDを使う
        oshiId = existing.id;
      } else {
        // 存在しない場合は新規作成
        const { data: oshi, error: oshiError } = await supabase
          .from('oshis')
          .insert({ name: trimmedName, group_name: trimmedGroup })
          .select('id')
          .single();

        if (oshiError || !oshi) {
          setError('推しの登録に失敗しました');
          setIsSubmitting(false);
          return;
        }
        oshiId = oshi.id;
      }
    }

    const { error: linkError } = await supabase
      .from('user_oshis')
      .insert({ user_id: userId, oshi_id: oshiId, theme_color: themeColor });

    if (linkError) {
      setError('推しの紐付けに失敗しました');
      setIsSubmitting(false);
      return;
    }

    setName('');
    setGroupName('');
    setThemeColor('');
    setSelectedOshiId(null);
    setIsNewOshi(false);
    setShowPicker(false);
    setIsSubmitting(false);
    onAdded();
  }

  /** サジェストの表示テキスト */
  function formatSuggestion(oshi: OshiSuggestion): string {
    if (oshi.group_name) {
      return `${oshi.name}（${oshi.group_name}）`;
    }
    return `${oshi.name}（グループ）`;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>推しを追加</h2>

      {/* 推し名入力 + サジェスト */}
      <div className={`${styles.label} ${styles.suggestWrap}`} ref={suggestRef}>
        推しの名前 <span className={styles.required}>*</span>
        <div className={styles.searchInputWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="名前で検索（例：道枝駿佑）"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            maxLength={50}
            autoComplete="off"
          />
        </div>

        {/* 選択済み表示 */}
        {selectedOshiId && (
          <div className={styles.selectedBadge}>
            {groupName ? `${name}（${groupName}）` : name} を選択中
          </div>
        )}

        {/* サジェストドロップダウン */}
        {showSuggestions && (
          <div className={styles.suggestDropdown}>
            {suggestions.length > 0 ? (
              <>
                {suggestions.map((oshi) => (
                  <button
                    key={oshi.id}
                    type="button"
                    className={styles.suggestItem}
                    onClick={() => handleSelectSuggestion(oshi)}
                  >
                    {formatSuggestion(oshi)}
                  </button>
                ))}
              </>
            ) : (
              <div className={styles.suggestEmpty}>
                該当する推しが見つかりません
              </div>
            )}
            <button
              type="button"
              className={styles.suggestNewItem}
              onClick={handleSelectNew}
            >
              「{name.trim()}」を新しく登録する
            </button>
          </div>
        )}
      </div>

      {/* グループ名（既存選択時は読み取り専用、新規登録時は編集可） */}
      <label className={styles.label}>
        グループ名（任意）
        <input
          className={styles.input}
          type="text"
          placeholder="例：Snow Man"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          maxLength={50}
          readOnly={!!selectedOshiId}
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
              onMouseDown={hueDragHandler}
              onTouchStart={hueDragHandler}
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
              onMouseDown={lightnessDragHandler}
              onTouchStart={lightnessDragHandler}
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
