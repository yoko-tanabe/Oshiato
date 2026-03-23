# design.md — 20260323-supabase-setup

## ファイル構成

```
apps/web/
├── .env.local                      ← 環境変数（gitignore済み）
└── lib/
    └── supabase/
        ├── client.ts               ← ブラウザ用クライアント
        ├── server.ts               ← サーバー用クライアント（Server Components）
        └── database.types.ts       ← DBテーブルの型定義
```

## クライアントの使い分け

| ファイル | 使う場所 | 理由 |
|---------|---------|------|
| `client.ts` | `'use client'` コンポーネント、フック | ブラウザで動作 |
| `server.ts` | Server Components、Route Handlers、Server Actions | サーバーで動作 |

## 環境変数

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxx...
```

`NEXT_PUBLIC_` プレフィックスがあるとブラウザにも公開される。
anon key はブラウザに公開しても安全（RLSで制御する）。

## Phase 1-2 テーブル一覧

| テーブル名 | 説明 |
|-----------|------|
| users | ユーザー（Phase 1-2は端末識別のみ） |
| oshis | 推しマスタ |
| areas | エリアマスタ |
| user_oshis | ユーザー×推し（中間テーブル） |
| spots | スポット情報 |
| posts | 投稿 |
| post_images | 投稿画像 |
| check_ins | チェックイン |
| visit_logs | 訪問ログ |

## PostGIS拡張

地理情報（緯度・経度）を扱うために `postgis` 拡張が必要。
Supabaseダッシュボードの Extensions から有効化する。
