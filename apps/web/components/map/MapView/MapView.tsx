'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { LocateFixed } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';
import styles from './MapView.module.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

// 東京を初期表示
const DEFAULT_CENTER: [number, number] = [139.6917, 35.6895];
const DEFAULT_ZOOM = 13;

type Spot = Database['public']['Tables']['spots']['Row'];

export default function MapView() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [isLocating, setIsLocating] = useState(false);

  // Supabaseからスポットを取得してピンを描画
  const loadSpots = useCallback(async (map: mapboxgl.Map) => {
    const { data: spots, error } = await supabase
      .from('spots')
      .select('*');

    if (error || !spots) return;

    // 既存マーカーを削除
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    spots.forEach((spot: Spot) => {
      // GEOGRAPHY型は "POINT(lng lat)" 形式で返ってくる場合があるためパース
      const coords = parsePoint(spot.location);
      if (!coords) return;

      const el = document.createElement('div');
      el.className = styles.pin;

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(coords)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, []);

  // 地図を初期化
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
    });

    mapRef.current = map;

    // 地図の読み込み完了後にスポットを取得
    map.on('load', () => {
      loadSpots(map);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      map.remove();
      mapRef.current = null;
    };
  }, [loadSpots]);

  // 現在地に移動
  function handleLocate() {
    if (!navigator.geolocation || !mapRef.current) return;

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapRef.current?.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 15,
          duration: 1200,
        });
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      }
    );
  }

  return (
    <div className={styles.wrapper}>
      <div ref={mapContainerRef} className={styles.map} />
      <button
        className={`${styles.locateButton} ${isLocating ? styles.locating : ''}`}
        onClick={handleLocate}
        aria-label="現在地に移動"
      >
        <LocateFixed size={18} strokeWidth={1.5} />
      </button>
    </div>
  );
}

// "POINT(lng lat)" または GeoJSON 形式から [lng, lat] を取得
function parsePoint(location: string): [number, number] | null {
  // WKT形式: POINT(139.69 35.68)
  const wkt = location.match(/POINT\(([^ ]+) ([^ )]+)\)/);
  if (wkt) return [parseFloat(wkt[1]), parseFloat(wkt[2])];

  // GeoJSON形式: {"type":"Point","coordinates":[lng,lat]}
  try {
    const geo = JSON.parse(location);
    if (geo?.coordinates?.length === 2) {
      return [geo.coordinates[0], geo.coordinates[1]];
    }
  } catch {
    // パース失敗は無視
  }

  return null;
}
