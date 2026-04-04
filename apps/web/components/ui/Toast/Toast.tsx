'use client';

import { useEffect, useState } from 'react';
import styles from './Toast.module.css';

export type ToastType = 'success' | 'error' | 'warning';

export interface ToastData {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastProps {
  toast: ToastData;
  onRemove: (id: string) => void;
}

export default function Toast({ toast, onRemove }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setIsExiting(true), 2700);
    const removeTimer = setTimeout(() => onRemove(toast.id), 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [toast.id, onRemove]);

  return (
    <div
      className={`${styles.toast} ${styles[toast.type]} ${isExiting ? styles.exit : ''}`}
      role="status"
    >
      <span className={styles.message}>{toast.message}</span>
    </div>
  );
}
