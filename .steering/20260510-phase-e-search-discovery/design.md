# Phase E 設計書

## 方針変更（2026/05/10）

検索はタブを追加せず、**マップ画面に統合する**（Google Maps スタイル）。
- マップ上部に常時表示の検索バー
- 検索結果は下からスライドするパネル（SearchResultSheet）に表示
- 検索結果ピンをマップ上にも描画
- タブバーは変更なし

## 新規ファイル一覧

```
apps/web/
├── app/
│   ├── search/
│   │   └── page.tsx                        ← 作成済み（タブ未追加・将来用に残す）
│   └── oshi/
│       └── [id]/
│           └── spots/
│               └── page.tsx                ← E-3: 推し別スポット一覧ページ
├── components/
│   ├── search/
│   │   ├── SearchPage/                     ← 作成済み（マップ統合により非タブ）
│   │   ├── SearchResultCard/               ← 作成済み（MapSearchSheet でも再利用）
│   │   ├── NearbySpots/                    ← 作成済み（MapSearchSheet でも再利用）
│   │   └── MapSearchBar/
│   │       ├── MapSearchBar.tsx            ← E-1: マップ上部の検索バー（'use client'）
│   │       └── MapSearchBar.module.css
│   ├── map/
│   │   └── SearchResultSheet/
│   │       ├── SearchResultSheet.tsx       ← E-1/E-2: 検索結果の下パネル（'use client'）
│   │       └── SearchResultSheet.module.css
│   └── oshi/
│       └── OshiSpotList/
│           ├── OshiSpotList.tsx            ← E-3: 推し別スポット一覧（'use client'）
│           └── OshiSpotList.module.css
└── lib/
    └── supabase/
        └── search.ts                       ← 作成済み
supabase/
└── 20260510_get_recommended_spots.sql      ← 作成済み・実行済み
```

---

## 各ファイルの設計

### `lib/supabase/search.ts`（新規）

検索・近傍・推し別スポット・レコメンド取得の4関数を持つ。

```typescript
// E-1: キーワード・推し・カテゴリ検索
searchSpots(keyword, oshiId, category): Promise<SearchResult[]>

// E-2: 近傍スポット（500m以内）
findNearbySpotsForDisplay(lat, lng, radiusMeters): Promise<NearbySpot[]>

// E-3: 推し別スポット一覧
getSpotsByOshi(oshiId): Promise<OshiSpot[]>

// E-4: レコメンドスポット（RPC呼び出し）
getRecommendedSpots(userId): Promise<RecommendedSpot[]>
```

#### `searchSpots` の実装方針

Supabase クライアントで `posts` テーブルを結合してクエリ：

```
posts
  .select('id, comment, category, is_public, oshi_id, spot_id, user_id,
           oshis(id, name, group_name),
           spots(id, location),
           post_images(image_url)')
  .eq('is_public', true)
  .eq('status', 'active')
  + keyword → .ilike('comment', `%keyword%`)
  + oshiId  → .eq('oshi_id', oshiId)
  + category → .eq('category', category)
```

#### `findNearbySpotsForDisplay` の実装方針

既存の `find_nearby_spot` RPC は半径50m・1件のみ返すため、近傍一覧には使えない。  
新しい RPC `find_nearby_spots_for_display` を作成する（半径・件数上限を引数で渡す）。

---

### `supabase/20260510_get_recommended_spots.sql`（新規）

`get_recommended_spots` PostgreSQL 関数の DDL。  
API仕様書（`docs/OSHIATO_API_Specification_v5_1.md` セクション9）のSQLをそのまま使用。  
Supabase SQL Editor で手動実行する。

---

### `app/search/page.tsx`

- サーバーコンポーネント（`'use client'` なし）
- `<SearchPage />` を import して返すだけ

```tsx
import SearchPage from '@/components/search/SearchPage/SearchPage';
export default function Page() {
  return <SearchPage />;
}
```

---

### `components/search/SearchPage/SearchPage.tsx`（`'use client'`）

**状態管理:**

| state | 型 | 初期値 | 役割 |
|-------|----|--------|------|
| `keyword` | string | `''` | テキスト入力 |
| `selectedOshiId` | string \| null | null | 推しフィルター |
| `selectedCategory` | string \| null | null | カテゴリフィルター |
| `results` | SearchResult[] | [] | 検索結果 |
| `loading` | boolean | false | ローディング |

**レイアウト:**

```
<header>検索</header>
<input placeholder="スポット名・コメントを検索" />
<OshiFilterChips />      ← 推し選択（横スクロール）
<CategoryFilterChips />  ← カテゴリ選択
<NearbySpots />          ← 近くのスポット（独立コンポーネント）
<SearchResultCard × n /> ← 検索結果一覧
```

---

### `components/search/SearchResultCard/SearchResultCard.tsx`

1件分の検索結果カード。

| 表示要素 | データソース |
|----------|-------------|
| サムネイル画像 | `post_images[0].image_url` |
| 推し名 | `oshis.name` |
| コメント（先頭50文字） | `posts.comment` |
| カテゴリバッジ | `posts.category` |

タップで `/spot/[spot_id]` に遷移。

---

### `components/search/NearbySpots/NearbySpots.tsx`（`'use client'`）

- マウント時に `navigator.geolocation.getCurrentPosition()` を呼ぶ
- 位置取得後に `findNearbySpotsForDisplay(lat, lng, 500)` を呼ぶ
- 許可なし → 「位置情報を許可するとこのエリアのスポットが表示されます」

---

### `app/oshi/[id]/spots/page.tsx`

- サーバーコンポーネント
- `<OshiSpotList oshiId={params.id} />` を返す

---

### `components/oshi/OshiSpotList/OshiSpotList.tsx`（`'use client'`）

- `getSpotsByOshi(oshiId)` でデータ取得
- 推し名・グループ名をヘッダーに表示
- `SearchResultCard` を再利用してスポット一覧を表示

---

### MapView へのレコメンドピン追加（E-5/E-6）

既存の `MapView.tsx` に以下を追加：

- `getRecommendedSpots(userId)` の呼び出し
- レコメンドスポット用の GeoJSON レイヤー（`recommended-layer`）を追加
- ピンスタイル: 星アイコン（`⭐`）or 黄色ピン（通常ピンと区別）
- ポップアップに `reason_count` を使ったテキスト：「同じ好みの N 人が推しています」

---

## `/search` への導線

タブバー（`TabBar.tsx`）に「検索」タブを追加する。  
現在のタブ構成を確認してから変更する（既存のタブ順は崩さない）。

---

## Supabase 新規 RPC

| 関数名 | 用途 | 実行方法 |
|--------|------|---------|
| `get_recommended_spots(target_user_id)` | レコメンドスポット取得 | SQLファイルを SQL Editor で実行 |
| `find_nearby_spots_for_display(lat, lng, radius, limit)` | 近傍スポット一覧取得 | 同上 |

---

## 実装順序

```
1. supabase/20260510_get_recommended_spots.sql（SQL2本）
2. lib/supabase/search.ts
3. app/search/page.tsx + SearchPage.tsx + SearchPage.module.css
4. components/search/SearchResultCard/
5. components/search/NearbySpots/
6. TabBar.tsx に「検索」タブを追加
7. app/oshi/[id]/spots/page.tsx + OshiSpotList/
8. OshiCard.tsx にリンクを追加（/oshi/[id]/spots）
9. MapView.tsx にレコメンドレイヤー追加（E-5/E-6）
```
