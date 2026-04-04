'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { LocateFixed } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { getOrCreateUser } from '@/lib/user/getOrCreateUser';
import styles from './MapView.module.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

// 東京を初期表示
const DEFAULT_CENTER: [number, number] = [139.6917, 35.6895];
const DEFAULT_ZOOM = 13;

export default function MapView() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const popupsRef = useRef<mapboxgl.Popup[]>([]);
  const [isLocating, setIsLocating] = useState(false);

  // Supabaseからスポットを取得してピンを描画
  const loadSpots = useCallback(async (map: mapboxgl.Map) => {
    // ① 現在のユーザーの推し色・推し名マップを取得
    const oshiColorMap = new Map<string, string>();
    const oshiNameMap = new Map<string, string>();
    try {
      const userId = await getOrCreateUser();

      // user_oshis から oshi_id と theme_color を取得
      const { data: userOshis } = await supabase
        .from('user_oshis')
        .select('oshi_id, theme_color')
        .eq('user_id', userId);

      if (userOshis && userOshis.length > 0) {
        userOshis.forEach((row) => {
          oshiColorMap.set(row.oshi_id, row.theme_color);
        });

        // oshis テーブルから名前を取得（FKネストを使わず個別クエリ）
        const oshiIds = userOshis.map((row) => row.oshi_id);
        const { data: oshiRows } = await supabase
          .from('oshis')
          .select('id, name')
          .in('id', oshiIds);

        oshiRows?.forEach((o) => {
          oshiNameMap.set(o.id, o.name);
        });
      }
    } catch {
      // ユーザー取得失敗時はデフォルト色にフォールバック
    }

    // ② スポット一覧を取得（PostGIS の GEOGRAPHY 型は WKB で返るため、RPC で座標を数値として取得）
    type SpotRow = { id: string; lng: number; lat: number; address: string | null };
    const { data: spots, error: spotsError } = await supabase
      .rpc('get_spots_with_coords') as unknown as { data: SpotRow[] | null; error: Error | null };

    if (spotsError || !spots || spots.length === 0) {
      console.log('[MapView] spots が空またはエラー:', spotsError);
      return;
    }

    console.log('[MapView] spots:', spots);

    const spotIds = spots.map((s) => s.id);

    // ③ 該当スポットの投稿を一括取得
    const { data: posts } = await supabase
      .from('posts')
      .select('id, spot_id, oshi_id')
      .in('spot_id', spotIds)
      .eq('status', 'active');

    // ④ 先頭画像（display_order=0）を一括取得
    const postIds = posts?.map((p) => p.id) ?? [];
    const { data: images } = postIds.length > 0
      ? await supabase
          .from('post_images')
          .select('post_id, image_url, display_order')
          .in('post_id', postIds)
          .eq('display_order', 0)
      : { data: [] as { post_id: string; image_url: string; display_order: number }[] };

    // spot_id → posts のマップ
    const postsBySpot = new Map<string, { id: string; oshi_id: string }[]>();
    posts?.forEach((p) => {
      const list = postsBySpot.get(p.spot_id) ?? [];
      list.push({ id: p.id, oshi_id: p.oshi_id });
      postsBySpot.set(p.spot_id, list);
    });

    // post_id → image_url のマップ
    const thumbByPost = new Map<string, string>();
    images?.forEach((img) => {
      thumbByPost.set(img.post_id, img.image_url);
    });

    // 既存マーカー・ポップアップを削除
    popupsRef.current.forEach((p) => p.remove());
    popupsRef.current = [];
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    spots.forEach((spot) => {
      const coords: [number, number] = [spot.lng, spot.lat];
      if (!coords[0] || !coords[1]) return;

      const spotPosts = postsBySpot.get(spot.id) ?? [];
      const firstPost = spotPosts[0] ?? null;
      const oshiColor = firstPost ? (oshiColorMap.get(firstPost.oshi_id) ?? '#aaaaaa') : '#aaaaaa';
      const oshiName = firstPost ? (oshiNameMap.get(firstPost.oshi_id) ?? null) : null;
      const thumbnail = firstPost ? (thumbByPost.get(firstPost.id) ?? null) : null;
      const postCount = spotPosts.length;

      // マーカー要素を作成（推し色を CSS カスタムプロパティで渡す）
      const el = document.createElement('div');
      el.className = styles.pin;
      el.style.setProperty('--oshi-color', oshiColor);

      // ポップアップ HTML を組み立て
      const popupHtml = buildPopupHtml({
        address: spot.address,
        oshiColor,
        oshiName,
        thumbnail,
        postCount,
      });

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
  address: string | null;
  oshiColor: string;
  oshiName: string | null;
  thumbnail: string | null;
  postCount: number;
}): string {
  const { address, oshiColor, oshiName, thumbnail, postCount } = params;

  // oshi color は DB 由来だが CSS color 値として使うため #RRGGBB のみ許可
  const safeColor = /^#[0-9a-fA-F]{3,8}$/.test(oshiColor) ? oshiColor : '#aaaaaa';

  const thumbHtml = thumbnail
    ? `<img src="${escapeHtml(thumbnail)}" alt="スポット写真" class="spot-popup-thumb" />`
    : `<div class="spot-popup-thumb spot-popup-thumb--empty" style="background:${safeColor}22;"></div>`;

  const addressText = escapeHtml(address ?? '住所不明');
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
