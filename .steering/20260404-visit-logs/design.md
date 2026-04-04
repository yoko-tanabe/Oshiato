# 訪問ログページ - 設計

## ファイル構成

```
apps/web/components/visits/
└── VisitList/
    ├── VisitList.tsx
    └── VisitList.module.css
```

修正: `app/visits/page.tsx` — VisitList をインポート

## VisitList コンポーネント

### データ取得フロー

1. `visit_logs` を `user_id` でフィルタ、`visited_at DESC` で取得（limit 200）
2. 関連する `spot_id` → `spots.address` を取得
3. 関連する `oshi_id` → `oshis.name` + `user_oshis.theme_color` を取得
4. 月ごとにグループ化

### 型定義

```typescript
interface VisitItem {
  id: string;
  spotId: string;
  address: string | null;
  oshiName: string | null;
  oshiColor: string;
  visitedAt: string;
  source: 'checkin' | 'exif' | 'manual';
}

interface MonthGroup {
  key: string;       // "2026-04"
  label: string;     // "2026年4月"
  visits: VisitItem[];
}
```

### UI構成

```
┌─────────────────────────────┐
│ 訪問ログ                    │  ← ページタイトル
├─────────────────────────────┤
│ 5 スポット  ·  12 回訪問    │  ← サマリー
├─────────────────────────────┤
│ 2026年4月                   │  ← 月ヘッダー
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ ● 推し名   [exif]      │ │  ← 推し色ドット + ソースバッジ
│ │ 〒渋谷区道玄坂1-2-3    │ │  ← 住所
│ │ 4/3 14:30              │ │  ← 日時
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ ● 推し名   [checkin]   │ │
│ │ ...                     │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

### ソースバッジの表示

| source | ラベル | 色 |
|--------|--------|-----|
| exif | 写真 | --color-accent-primary |
| checkin | チェックイン | --color-success |
| manual | 手動 | --color-text-secondary |
