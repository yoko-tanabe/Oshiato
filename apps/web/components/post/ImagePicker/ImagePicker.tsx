'use client';

import { useRef, useState, useEffect } from 'react';
import { ImagePlus, ImageIcon, X } from 'lucide-react';
import { createPreviewUrl } from '@/lib/image/processImage';
import styles from './ImagePicker.module.css';

interface ImagePickerProps {
  files: File[];
  onChange: (files: File[]) => void;
  maxImages?: number;
}

export default function ImagePicker({ files, onChange, maxImages = 4 }: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  // ファイル変更時にプレビューURLを生成
  useEffect(() => {
    let cancelled = false;
    Promise.all(files.map((f) => createPreviewUrl(f))).then((urls) => {
      if (!cancelled) setPreviews(urls);
    });
    return () => {
      cancelled = true;
    };
  }, [files]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    const merged = [...files, ...selected].slice(0, maxImages);
    onChange(merged);
    // 同じファイルを再選択できるようにリセット
    e.target.value = '';
  }

  function handleRemove(index: number) {
    const next = files.filter((_, i) => i !== index);
    onChange(next);
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {previews.map((src, i) => (
          <div key={i} className={styles.previewItem}>
            {src ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={src} alt={`選択画像 ${i + 1}`} className={styles.previewImage} />
            ) : (
              <div className={styles.previewFallback}>
                <ImageIcon size={24} />
                <span>プレビュー不可</span>
              </div>
            )}
            <button
              type="button"
              className={styles.removeButton}
              onClick={() => handleRemove(i)}
              aria-label={`画像 ${i + 1} を削除`}
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {files.length < maxImages && (
          <button
            type="button"
            className={styles.addButton}
            onClick={() => inputRef.current?.click()}
            aria-label="画像を追加"
          >
            <ImagePlus size={28} />
            <span>{files.length === 0 ? '写真を選ぶ' : '追加'}</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className={styles.hiddenInput}
        onChange={handleFileChange}
      />
    </div>
  );
}
