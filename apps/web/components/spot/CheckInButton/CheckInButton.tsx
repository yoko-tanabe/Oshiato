'use client';

import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { isCheckedInToday, performCheckIn } from '@/lib/supabase/checkins';
import { useCurrentUser } from '@/lib/user/useCurrentUser';
import { useToast } from '@/components/ui/Toast/ToastProvider';
import LoadingSpinner from '@/components/ui/LoadingSpinner/LoadingSpinner';
import styles from './CheckInButton.module.css';

interface CheckInButtonProps {
  spotId: string;
  oshiId: string;
  spotLat: number;
  spotLng: number;
}

export default function CheckInButton({
  spotId,
  oshiId,
  spotLat,
  spotLng,
}: CheckInButtonProps) {
  const { userId } = useCurrentUser();
  const { showToast } = useToast();
  const [isChecked, setIsChecked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // 初期表示時に当日チェックイン済みか確認
  useEffect(() => {
    if (!userId) return;
    isCheckedInToday(userId, spotId).then((checked) => {
      setIsChecked(checked);
      setIsInitializing(false);
    });
  }, [userId, spotId]);

  async function handleCheckIn() {
    if (!userId || isProcessing || isChecked) return;

    setIsProcessing(true);

    // 現在地を取得
    if (!navigator.geolocation) {
      showToast('error', '位置情報がサポートされていません');
      setIsProcessing(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const result = await performCheckIn({
          userId,
          spotId,
          oshiId,
          spotLat,
          spotLng,
          userLat: pos.coords.latitude,
          userLng: pos.coords.longitude,
        });

        if (result.success) {
          setIsChecked(true);
          showToast('success', 'チェックインしました');
        } else {
          showToast('error', result.error ?? 'チェックインに失敗しました');
        }
        setIsProcessing(false);
      },
      () => {
        showToast('error', '位置情報を取得できませんでした');
        setIsProcessing(false);
      },
    );
  }

  if (isInitializing) {
    return <LoadingSpinner size="small" />;
  }

  if (isChecked) {
    return (
      <div className={styles.checked}>
        <MapPin size={14} strokeWidth={1.5} />
        チェックイン済み
      </div>
    );
  }

  return (
    <button
      className={styles.button}
      onClick={handleCheckIn}
      disabled={isProcessing}
    >
      {isProcessing ? (
        <LoadingSpinner size="small" />
      ) : (
        <>
          <MapPin size={14} strokeWidth={1.5} />
          チェックイン
        </>
      )}
    </button>
  );
}
