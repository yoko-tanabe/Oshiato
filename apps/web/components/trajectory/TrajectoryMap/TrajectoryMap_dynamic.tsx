'use client';

import dynamic from 'next/dynamic';

// Mapbox GL JSはブラウザAPIに依存するためSSRを無効化
export const TrajectoryMap_dynamic = dynamic(
  () => import('@/components/trajectory/TrajectoryMap/TrajectoryMap'),
  {
    ssr: false,
    loading: () => <div style={{ width: '100%', height: '100%', background: '#1a1a1a' }} />,
  }
);
