'use client';

import dynamic from 'next/dynamic';

// Mapbox GL JSはブラウザAPIに依存するためSSRを無効化
//exportを追記した。そうしないと他から参照できない（小菅先生）
export const MapView_dynamic = dynamic(
  () => import('@/components/map/MapView/MapView'),
  {
    ssr: false,
    loading: () => <div style={{ width: '100%', height: '100%', background: '#1a1a1a' }} />,
  }
);


//以下はこのファイルの担当ではないので、元のファイルに
// export default function MapPage() {
//   return <MapView />;
// }
