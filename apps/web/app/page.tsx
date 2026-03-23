'use client';

import dynamic from 'next/dynamic';

// Mapbox GL JSはブラウザAPIに依存するためSSRを無効化
const MapView = dynamic(
  () => import('@/components/map/MapView/MapView'),
  {
    ssr: false,
    loading: () => <div style={{ width: '100%', height: '100%', background: '#1a1a1a' }} />,
  }
);

export default function MapPage() {
  return <MapView />;
}
