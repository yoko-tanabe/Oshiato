'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from './LocationPicker.module.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

/** Geocoding APIのレスポンス1件分 */
interface GeocodingFeature {
  place_name: string;
  center: [number, number]; // [lng, lat]
}

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

// 東京を初期表示
const DEFAULT_CENTER: [number, number] = [139.6917, 35.6895];
const DEFAULT_ZOOM = 13;

export default function LocationPicker({ onLocationSelect }: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodingFeature[]>([]);
  const [selectedLabel, setSelectedLabel] = useState('');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- 地図の初期化 ---
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
    });

    // 地図タップでピンを配置
    map.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      placeMarker(map, lng, lat);
      onLocationSelect(lat, lng);
      setSelectedLabel(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      setSuggestions([]);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // onLocationSelect は親から渡されるコールバックなので依存配列から除外
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- ピンを配置・移動する ---
  function placeMarker(map: mapboxgl.Map, lng: number, lat: number) {
    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
    } else {
      const marker = new mapboxgl.Marker({ color: '#c4b5fd', draggable: true })
        .setLngLat([lng, lat])
        .addTo(map);

      // ドラッグ終了時に座標を更新
      marker.on('dragend', () => {
        const pos = marker.getLngLat();
        onLocationSelect(pos.lat, pos.lng);
        setSelectedLabel(`${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`);
      });

      markerRef.current = marker;
    }

    map.flyTo({ center: [lng, lat], zoom: 15 });
  }

  // --- 住所検索（デバウンス付き）---
  function handleQueryChange(value: string) {
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?access_token=${token}&language=ja&country=jp&limit=5&types=poi,address,place`;

      try {
        const res = await fetch(url);
        const data = await res.json();
        setSuggestions(data.features ?? []);
      } catch {
        setSuggestions([]);
      }
    }, 300);
  }

  // --- サジェスト選択 ---
  function handleSuggestionSelect(feature: GeocodingFeature) {
    const [lng, lat] = feature.center;

    setQuery(feature.place_name);
    setSelectedLabel(feature.place_name);
    setSuggestions([]);

    if (mapRef.current) {
      placeMarker(mapRef.current, lng, lat);
    }

    onLocationSelect(lat, lng);
  }

  return (
    <div className={styles.wrapper}>
      {/* 住所検索 */}
      <div className={styles.searchBox}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="住所・場所名を入力..."
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
        />
        {suggestions.length > 0 && (
          <ul className={styles.suggestions}>
            {suggestions.map((feature, i) => (
              <li
                key={i}
                className={styles.suggestionItem}
                onClick={() => handleSuggestionSelect(feature)}
              >
                {feature.place_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 地図 */}
      <div ref={mapContainerRef} className={styles.mapContainer} />
      <p className={styles.mapHint}>地図をタップ、またはピンをドラッグして位置を調整できます</p>

      {/* 選択済み表示 */}
      {selectedLabel && (
        <p className={styles.selectedLocation}>📍 {selectedLabel}</p>
      )}
    </div>
  );
}
