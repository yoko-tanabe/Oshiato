# Design

## アーキテクチャ

```
apps/web/app/timeline/page.tsx          (Server Component)
  └─ TimelineGrid.tsx                   ('use client' コンポーネント)
     └─ TimelineGrid.module.css         (CSS Module)
```

MapView や PostForm と同じパターン: `page.tsx` は Server Component として保ち、クライアント処理はコンポーネントに分離。

## データ取得フロー

```
1. useCurrentUser() → userId 取得
2. posts テーブル (user_id, status='active', ORDER BY created_at DESC, LIMIT 100)
3. Promise.all で並行取得:
   - post_images (display_order=0) → サムネイルURL
   - oshis → 推し名
4. Map で結合 → TimelinePost[] に変換
5. groupByMonth() で MonthGroup[] に変換
6. レンダリング
```

## コンポーネント構造

```tsx
<div.wrapper>
  {monthGroups.map(group => (
    <section>
      <h2.monthHeader>2026年4月</h2>
      <div.grid>
        {posts.map(post => (
          <div.tile>
            <img.tileImage src={post.imageUrl} loading="lazy" />
            <div.dateOverlay>4/4</div>
          </div>
        ))}
      </div>
    </section>
  ))}
</div>
```
