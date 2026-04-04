'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { LocateFixed } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import styles from './MapView.module.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

// 東京を初期表示
const DEFAULT_CENTER: [number, number] = [139.6917, 35.6895];
const DEFAULT_ZOOM = 13;

// Supabase JOIN クエリの戻り値型
type SpotWithPosts = {
  id: string;
  location: string;
  address: string | null;
  posts: {
    id: string;
    oshis: { id: string; name: string; color: string } | null;
    post_images: { image_url: string; order: number }[];
  }[];
};

export default function MapView() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const popupsRef = useRef<mapboxgl.Popup[]>([]);
  const [isLocating, setIsLocating] = useState(false);

  // Supabaseからスポットを取得してピンを描画
  const loadSpots = useCallback(async (map: mapboxgl.Map) => {
    const { data: spots, error } = await supabase
      .from('spots')
      .select(`
        id,
        location,
        address,
        posts (
          id,
          oshis ( id, name, color ),
          post_images ( image_url, order )
        )
      `)
      .returns<SpotWithPosts[]>();

    if (error || !spots) return;

    // 既存マーカー・ポップアップを削除
    popupsRef.current.forEach((p) => p.remove());
    popupsRef.current = [];
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    spots.forEach((spot) => {
      // GEOGRAPHY型は "POINT(lng lat)" 形式で返ってくる場合があるためパース
      const coords = parsePoint(spot.location);
      if (!coords) return;

      // 最初の投稿の推し色・推し名・サムネイルを取得
      const firstPost = spot.posts?.[0] ?? null;
      const oshiColor = firstPost?.oshis?.color ?? '#333333';
      const oshiName = firstPost?.oshis?.name ?? null;
      const thumbnail = firstPost?.post_images
        ?.slice()
        .sort((a, b) => a.order - b.order)[0]?.image_url ?? null;
      const postCount = spot.posts?.length ?? 0;

      // マーカー要素を作成（推し色を CSS カスタムプロパティで渡す）
      const el = document.createElement('div');
      el.className = styles.pin;
      el.style.setProperty('--oshi-color', oshiColor);

      // ポップアップ HTML を組み立て
      const popupHtml = buildPopupHtml({ spot, oshiColor, oshiName, thumbnail, postCount });

      const popup = new mapboxgl.Popup({ offset: 12, closeButton: false })
        .setHTML(popupHtml);

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(coords)
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
      popupsRef.current.push(popup);
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
      popupsRef.current.forEach((p) => p.remove());
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

// HTML特殊文字をエスケープ（XSS対策）
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ポップアップのHTML文字列を組み立て
function buildPopupHtml(params: {
  spot: SpotWithPosts;
  oshiColor: string;
  oshiName: string | null;
  thumbnail: string | null;
  postCount: number;
}): string {
  const { spot, oshiColor, oshiName, thumbnail, postCount } = params;

  // oshi color は DB 由来だが CSS color 値として使うため英数字・#のみ許可
  const safeColor = /^#[0-9a-fA-F]{3,8}$/.test(oshiColor) ? oshiColor : '#333333';

  const thumbHtml = thumbnail
    ? `<img src="${escapeHtml(thumbnail)}" alt="スポット写真" class="spot-popup-thumb" />`
    : `<div class="spot-popup-thumb spot-popup-thumb--empty" style="background:${safeColor}22;"></div>`;

  const addressText = escapeHtml(spot.address ?? '住所不明');
  const oshiBadge = oshiName
    ? `<span class="spot-popup-oshi" style="background:${safeColor}33;color:${safeColor};">${escapeHtml(oshiName)}</span>`
    : '';
  const countText = `${postCount}件の投稿`;

  return `
    <div class="spot-popup">
      ${thumbHtml}
      <div class="spot-popup-body">
        ${oshiBadge}
        <p class="spot-popup-address">${addressText}</p>
        <p class="spot-popup-count">${countText}</p>
      </div>
    </div>
  `;
}
