# decision.md — 20260323-map-display

## 決定事項

### 1. `dynamic()` + `ssr: false` でSSRを無効化

**理由:**
- Mapbox GL JSはブラウザAPIに依存しており、Next.jsのサーバーサイドレンダリングで実行するとエラーになる
- `dynamic()` はNext.js標準の遅延読み込み機能で、`ssr: false` を指定するとブラウザでのみ実行される

---

### 2. 地図スタイルは `mapbox://styles/mapbox/dark-v11` を使用

**理由:**
- OSHIATOのデザインコンセプト「ダークテーマベース」に合致
- Mapbox公式スタイルのため追加費用なし
- 写真が映えるダークな背景

---

### 3. スポットデータはクライアント側で取得（useEffect）

**理由:**
- Phase 1-2はリアルタイム更新不要のシンプルな実装
- Server Componentからマップに渡す場合、シリアライズが複雑になる
- Phase 3以降でRealtimeサブスクリプションに移行しやすい

---

### 4. ピンはMapboxのカスタムマーカーで実装

**理由:**
- HTML要素をマーカーとして使えるため、CSSで自由にスタイリング可能
- デザインガイドのピン仕様（円形、Lavender）をそのまま適用できる
