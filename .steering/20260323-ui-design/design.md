# design.md — 20260323-ui-design

## コンポーネント構成

```
apps/web/
└── components/
    ├── ui/
    │   └── TabBar/
    │       ├── TabBar.tsx
    │       └── TabBar.module.css
    └── layout/
        └── AppShell/
            ├── AppShell.tsx
            └── AppShell.module.css
```

## TabBar コンポーネント

### タブ定義

| # | ラベル | アイコン（Lucide） | リンク先 |
|---|--------|-------------------|---------|
| 1 | マップ | `MapPin` | `/` |
| 2 | タイムライン | `LayoutGrid` | `/timeline` |
| 3 | 投稿（中央） | `Plus` | `/post/new` |
| 4 | 軌跡 | `Layers` | `/trajectory` |
| 5 | マイページ | `User` | `/oshi` |

### スタイル仕様（UI_Design_Guide.md §5.5より）

```
コンテナ:
  background: #1A1A1A
  border-top: 1px solid #252525
  padding: 14px 10px 12px

非アクティブアイコン:
  color: #444444

アクティブアイコン:
  color: #C4B5FD

中央の投稿ボタン:
  background: #C4B5FD
  width: 38px / height: 38px
  border-radius: 50%
  margin-top: -8px
  box-shadow: 0 4px 12px rgba(196, 181, 253, 0.3)
```

### アクティブ状態の判定

`usePathname()` フック（Next.js）でURLを取得し、現在のパスと一致するタブをアクティブにする。

## AppShell コンポーネント

### 役割

- ページコンテンツを `<main>` で包む
- 下部に `<TabBar>` を固定表示する
- コンテンツエリアはタブバーの高さ分だけ下パディングを確保する

### レイアウト構造

```
<div class="shell">        ← height: 100dvh, display: flex, flex-direction: column
  <main class="content">  ← flex: 1, overflow-y: auto
    {children}
  </main>
  <TabBar />              ← 固定（flex末尾）
</div>
```

## 依存ライブラリ

- `lucide-react`（アイコン）: インストール済み確認が必要
