'use client';

import { useState } from 'react';
import { formatDateToString, getWeekSunday } from '@/lib/date/periodHelper';
import styles from './MapFilter.module.css';

type FilterType = 'all' | 'today' | 'tomorrow' | 'week' | 'custom';

/** フィルター範囲: from〜to の期間。null はフィルターなし */
export interface DateRange {
  from: string; // "YYYY-MM-DD"
  to: string;   // "YYYY-MM-DD"
}

interface MapFilterProps {
  onFilterChange: (range: DateRange | null) => void;
}

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'today', label: '今日' },
  { value: 'tomorrow', label: '明日' },
  { value: 'week', label: '今週' },
  { value: 'custom', label: 'カスタム' },
];

/**
 * マップ上部の期間フィルターバー
 *
 * 「すべて」: null（フィルターなし）
 * 「今日」「明日」: 特定の1日（from = to）
 * 「今週」: 今日〜今週の日曜日
 * 「カスタム」: ユーザーが開始日・終了日を選択
 */
export default function MapFilter({ onFilterChange }: MapFilterProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  function handleFilterClick(filter: FilterType) {
    setActiveFilter(filter);

    if (filter === 'all') {
      onFilterChange(null);
      return;
    }

    if (filter === 'custom') {
      if (customFrom && customTo) {
        onFilterChange({ from: customFrom, to: customTo });
      }
      return;
    }

    const today = new Date();
    const todayStr = formatDateToString(today);

    if (filter === 'today') {
      onFilterChange({ from: todayStr, to: todayStr });
    } else if (filter === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = formatDateToString(tomorrow);
      onFilterChange({ from: tomorrowStr, to: tomorrowStr });
    } else if (filter === 'week') {
      const sundayStr = formatDateToString(getWeekSunday(today));
      onFilterChange({ from: todayStr, to: sundayStr });
    }
  }

  function handleCustomFromChange(value: string) {
    setCustomFrom(value);
    if (value && customTo) {
      onFilterChange({ from: value, to: customTo });
    }
  }

  function handleCustomToChange(value: string) {
    setCustomTo(value);
    if (customFrom && value) {
      onFilterChange({ from: customFrom, to: value });
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.chipRow}>
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`${styles.chip} ${activeFilter === opt.value ? styles.chipActive : ''}`}
            onClick={() => handleFilterClick(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {activeFilter === 'custom' && (
        <div className={styles.customRow}>
          <input
            type="date"
            className={styles.customInput}
            value={customFrom}
            onChange={(e) => handleCustomFromChange(e.target.value)}
          />
          <span className={styles.customSeparator}>〜</span>
          <input
            type="date"
            className={styles.customInput}
            value={customTo}
            onChange={(e) => handleCustomToChange(e.target.value)}
            min={customFrom || undefined}
          />
        </div>
      )}
    </div>
  );
}
