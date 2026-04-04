'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { LocateFixed, MapPinOff } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { getOrCreateUser } from '@/lib/user/getOrCreateUser';
import styles from './TrajectoryMap.module.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

const DEFAULT_CENTER: [number, number] = [139.6917, 35.6895];
const DEFAULT_ZOOM = 12;
const FALLBACK_COLOR = '#aaaaaa';

/** RPC から返る1行の型 */
type TrajectoryRow = {
  id: string;
  spot_id: string;
  oshi_id: string;
  lat: number;
  lng: number;
  visited_at: string;
  source: string;
};

export default function TrajectoryMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [stats, setStats] = useState<{ count: number; earliest: string; latest: string } | null>(null);

  /**
   * 訪問データを取得して地図に軌跡を描画する。
   *
   * Mapbox GL JS の addSource / addLayer を使い、
   * GeoJSON 形式でポイント（丸）とライン（軌跡線）を描く。
   * 個別の Marker を使う方法より、大量のポイントでもパフォーマンスが良い。
   */
  const loadTrajectory = useCallback(async (map: mapboxgl.Map) => {
    // ① ユーザーID取得
    const userId = await getOrCreateUser();

    // ② 推しのテーマカラーを取得
    const oshiColorMap = new Map<string, string>();
    const { data: userOshis } = await supabase
      .from('user_oshis')
      .select('oshi_id, theme_color')
      .eq('user_id', userId);

    userOshis?.forEach((row) => {
      oshiColorMap.set(row.oshi_id, row.theme_color);
    });

    // ③ 訪問データを取得（RPC で lat/lng を数値として受け取る）
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .rpc('get_visit_trajectory', { input_user_id: userId }) as {
        data: TrajectoryRow[] | null;
        error: Error | null;
      };

    if (error || !data || data.length === 0) {
      setIsEmpty(true);
      return;
    }

    setIsEmpty(false);

    // ④ 統計情報を計算
    setStats({
      count: data.length,
      earliest: data[0].visited_at,
      latest: data[data.length - 1].visited_at,
    });

    // ⑤ 推しごとにデータをグループ化
    const byOshi = new Map<string, TrajectoryRow[]>();
    data.forEach((row) => {
      const list = byOshi.get(row.oshi_id) ?? [];
      list.push(row);
      byOshi.set(row.oshi_id, list);
    });

    // ⑥ 推しごとにライン + ポイントレイヤーを追加
    byOshi.forEach((rows, oshiId) => {
      const color = oshiColorMap.get(oshiId) ?? FALLBACK_COLOR;
      const sourceId = `trajectory-${oshiId}`;

      // ライン用の座標配列
      const lineCoords = rows.map((r) => [r.lng, r.lat]);

      // ポイント用の GeoJSON Features
      const pointFeatures = rows.map((r) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [r.lng, r.lat],
        },
        properties: {
          visited_at: r.visited_at,
          source: r.source,
        },
      }));

      // --- ラインレイヤー ---
      if (lineCoords.length >= 2) {
        const lineSourceId = `${sourceId}-line`;
        map.addSource(lineSourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: lineCoords,
            },
            properties: {},
          },
        });

        map.addLayer({
          id: `${lineSourceId}-layer`,
          type: 'line',
          source: lineSourceId,
          paint: {
            'line-color': color,
            'line-width': 2,
            'line-opacity': 0.6,
          },
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
        });
      }

      // --- ポイントレイヤー ---
      const pointSourceId = `${sourceId}-points`;
      map.addSource(pointSourceId, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: pointFeatures,
        },
      });

      map.addLayer({
        id: `${pointSourceId}-layer`,
        type: 'circle',
        source: pointSourceId,
        paint: {
          'circle-radius': 6,
          'circle-color': color,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#1a1a1a',
        },
      });
    });

    // ⑦ 全ポイントが収まるようにカメラを調整
    const bounds = new mapboxgl.LngLatBounds();
    data.forEach((r) => bounds.extend([r.lng, r.lat]));
    map.fitBounds(bounds, { padding: 60, maxZoom: 15 });
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

    map.on('load', () => {
      loadTrajectory(map);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [loadTrajectory]);

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

  /** 日付を「YYYY/MM/DD」形式にフォーマット */
  function formatDate(iso: string): string {
    const d = new Date(iso);
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
  }

  return (
    <div className={styles.wrapper}>
      <div ref={mapContainerRef} className={styles.map} />

      {/* 空状態オーバーレイ */}
      {isEmpty && (
        <div className={styles.emptyOverlay}>
          <MapPinOff size={40} strokeWidth={1.2} color="#666" />
          <p className={styles.emptyTitle}>まだ軌跡がありません</p>
          <p className={styles.emptyDescription}>
            写真を投稿して足跡を残しましょう！
          </p>
        </div>
      )}

      {/* 統計オーバーレイ */}
      {stats && (
        <div className={styles.statsOverlay}>
          <span className={styles.statsCount}>{stats.count} 件の足跡</span>
          <span className={styles.statsRange}>
            {formatDate(stats.earliest)} 〜 {formatDate(stats.latest)}
          </span>
        </div>
      )}

      {/* 現在地ボタン */}
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
