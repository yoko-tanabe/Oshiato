'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './OshiFilter.module.css';

export interface OshiOption {
  oshiId: string;
  name: string;
  themeColor: string;
}

interface OshiFilterProps {
  oshis: OshiOption[];
  selectedOshiIds: string[];
  onSelect: (oshiIds: string[]) => void;
}

/**
 * 推しフィルター: ドロップダウン形式で複数の推しを選択し、
 * 選択した推しに関連するスポットのみ地図に表示する
 */
export default function OshiFilter({ oshis, selectedOshiIds, onSelect }: OshiFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (oshis.length === 0) return null;

  // トグルボタンのラベル
  const buttonLabel = selectedOshiIds.length === 0
    ? 'すべての推し'
    : selectedOshiIds.length === 1
      ? oshis.find((o) => o.oshiId === selectedOshiIds[0])?.name ?? '1人選択中'
      : `${selectedOshiIds.length}人選択中`;

  function handleToggle(oshiId: string) {
    const next = selectedOshiIds.includes(oshiId)
      ? selectedOshiIds.filter((id) => id !== oshiId)
      : [...selectedOshiIds, oshiId];
    onSelect(next);
  }

  function handleSelectAll() {
    onSelect([]);
    setIsOpen(false);
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        type="button"
        className={`${styles.trigger} ${selectedOshiIds.length > 0 ? styles.triggerActive : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={styles.triggerLabel}>{buttonLabel}</span>
        <ChevronDown
          size={14}
          className={`${styles.triggerIcon} ${isOpen ? styles.triggerIconOpen : ''}`}
        />
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {/* すべて */}
          <button
            type="button"
            className={`${styles.option} ${selectedOshiIds.length === 0 ? styles.optionActive : ''}`}
            onClick={handleSelectAll}
          >
            <span className={styles.optionLabel}>すべて</span>
          </button>

          {/* 各推し */}
          {oshis.map((oshi) => {
            const isSelected = selectedOshiIds.includes(oshi.oshiId);
            return (
              <button
                key={oshi.oshiId}
                type="button"
                className={`${styles.option} ${isSelected ? styles.optionSelected : ''}`}
                style={{ '--oshi-opt-color': oshi.themeColor } as React.CSSProperties}
                onClick={() => handleToggle(oshi.oshiId)}
              >
                <span
                  className={styles.colorDot}
                  style={{ backgroundColor: oshi.themeColor }}
                />
                <span className={styles.optionLabel}>{oshi.name}</span>
                {isSelected && <span className={styles.checkMark}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
