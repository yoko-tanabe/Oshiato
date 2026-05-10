# OSHIATO 技術構成資料

**地図であなたのOSHIの足跡を残す**

---

| 項目 | 内容 |
|------|------|
| バージョン | v6.0 |
| 作成日 | 2026年3月 |
| 更新日 | 2026年5月 |
| 対応要件定義書 | v6.0 |

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|------------|------|----------|
| v1.0 | 2026/03 | 初版作成 |
| v5.0 | 2026/03 | 段階的開発アプローチに変更、移行前提の設計、Phase別コスト計算追加 |
| v5.1 | 2026/03 | Tailwind CSS削除、CSS Modulesに変更 |
| v5.2 | 2026/04 | Next.js `use client` コンポーネント設計方針を追加 |
| v6.0 | 2026/05 | 開発順序変更（Web先行実装→iOS版メイン）。Phase構成をA〜Jに刷新。新機能3件の技術追加（協調フィルタリング・Canvas API/watchPosition・Apple Intelligence Vision.framework）。 |
| v6.1 | 2026/05 | Phase B 完了。`@supabase/ssr` 導入・RLS 全テーブル設定・認証ページ実装。 |

---

## 1. 開発アプローチ

### 1.1 段階的開発戦略

**iOS版がメインプロダクト。** Web版はiOS版開発前に機能・UXを検証する先行実装版。

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   OSHIATO 段階的開発戦略（v6.0）                              │
└─────────────────────────────────────────────────────────────────────────────┘

  ━━━━━━━━━━━━━━ Web版先行実装フェーズ ━━━━━━━━━━━━━━    ━ iOS版（メイン）━

  Phase A-H                                              Phase I        Phase J
  Web版完成                                              iOS版          スケール
  （先行実装）                                           （メイン）      （継続）
     │                                                      │              │
     ▼                                                      ▼              ▼
┌───────────────────────────────────────────┐        ┌─────────┐    ┌─────────┐
│  Next.js + Supabase + Mapbox              │        │ Swift   │    │ 移行    │
│  + Canvas API（Phase F）                  │        │ SwiftUI │    │ Android │
│  + Geolocation watchPosition（Phase F）   │        │ MapKit  │    │ 多言語  │
│  + 協調フィルタリングSQL（Phase E）        │        │ Vision  │    │         │
└───────────────────────────────────────────┘        └─────────┘    └─────────┘
     │                                                      │              │
     ▼                                                      ▼              ▼
 Vercel Free / Supabase Free                           Vercel Pro     Render等
     │                                                 Supabase Pro       │
     ▼                                                      ▼              ▼
   $0/月                                              $45-71/月      $58-65/月
```

### 1.2 設計原則

| 原則 | 説明 |
|------|------|
| **移行前提の設計** | 特定ベンダーにロックインしない |
| **Supabase中心** | DB/Auth/Storage/Realtimeを統一 |
| **段階的投資** | 初期はゼロコスト、成長に応じて課金 |
| **学習効率** | 既存スキル（JS/TS）を活かしつつ新技術を習得 |

---

## 2. Phase別技術構成

### 2.1 Phase A（完了済み）: Web版プロトタイプ

| カテゴリ | 技術 | バージョン | 用途 |
|----------|------|------------|------|
| **フレームワーク** | Next.js | 15.x | SSR/SSG、App Router |
| | React | 19.x | UI |
| | TypeScript | 5.x | 型安全 |
| **スタイル** | CSS Modules | - | スコープ付きCSS |
| **地図** | Mapbox GL JS | 3.x | 地図表示・クラスタリング |
| | Mapbox Geocoding API | v5 | 住所検索→座標変換 |
| **画像処理** | exifr | 7.x | EXIF/GPS抽出 |
| | heic-decode | 2.x | HEIC形式デコード |
| **DB** | Supabase | - | PostgreSQL + PostGIS |
| **ストレージ** | Supabase Storage | - | 画像保存・配信 |
| **ホスティング** | Vercel | Free | デプロイ |
| **月額コスト** | | | **$0** |

#### 避けるVercel固有機能

| 使用しない | 代替 |
|------------|------|
| ~~Vercel KV~~ | Supabase |
| ~~Vercel Blob~~ | Supabase Storage |
| ~~Vercel Edge Config~~ | 環境変数 |
| ~~@vercel/analytics~~ | PostHog（Phase J〜） |
| ~~@vercel/og~~ | 標準Canvas API |

---

### 2.2 Phase B: 認証基盤（完了）

Phase Aの構成に加えて:

| カテゴリ | 技術 | 用途 |
|----------|------|------|
| **認証** | Supabase Auth | メールアドレス/パスワード認証（Google/Apple は Phase I で追加） |
| **セッション管理** | `@supabase/ssr` + Cookie | Next.js SSR 対応のセッション管理 |
| **認可** | RLS（Row Level Security） | 全テーブル + Storage バケットにポリシーを設定 |
| **ルート保護** | Next.js Middleware | 未認証ユーザーを `/auth/login` にリダイレクト |

**実装済み内容:**
- `lib/supabase/client.ts`: `createBrowserClient`（シングルトンから関数に変更）
- `lib/supabase/server.ts`: `createServerClient` + Cookie 読み書き
- `lib/supabase/middleware.ts`: セッション更新 / 未認証リダイレクト / `profile_completed` チェック
- `middleware.ts`: 薄いラッパー（静的ファイルを除く全ルートに適用）
- 認証ページ: `/auth/login`, `/auth/register`, `/auth/callback`, `/setup-profile`
- ログアウトボタン: `/oshi` ページに実装

**データ移行方針:** device_id ベースの既存データは破棄（開発中ダミーデータのため移行コスト > 価値）

**開発中の注意事項:**
- Supabase 無料プランのメール送信レート制限により "Confirm email" を OFF に設定
- テストユーザーは Supabase ダッシュボード → Authentication → Users から手動作成
- 本番リリース前に "Confirm email" を ON に戻すこと

**RLS 設定対象:**
- テーブル: `users`, `spots`, `posts`, `post_images`, `check_ins`, `user_oshis`, `visit_logs`
- Storage: `post-images` バケット（`storage.objects` テーブルへのポリシー）

---

### 2.3 Phase C〜D: マイページ・公開スポット閲覧

追加技術なし。Phase Bまでの構成で実装可能。

---

### 2.4 Phase E: 検索・推しレコメンデーション

| カテゴリ | 技術 | 用途 |
|----------|------|------|
| **レコメンドアルゴリズム** | PostgreSQL（Supabase） | 協調フィルタリング：`oshi_users`テーブルを使ったSQL集計でスコアリング |
| **マップ追加描画** | Mapbox GL JS（既存） | おすすめスポットを別レイヤーのピンとして重ねて表示 |

**協調フィルタリングの考え方:**
```sql
-- 自分と推しが重なるユーザーを探し、そのユーザーが推している
-- 自分がまだ登録していないアイドルをランキングする
-- → ML不要、シンプルなSQLで実装可能
```

---

### 2.5 Phase F: 推しの言葉オーバーレイ ⭐

| カテゴリ | 技術 | 用途 |
|----------|------|------|
| **近接検知** | Web Geolocation API `watchPosition()` | スポット半径50m以内への入場を検知 |
| **距離計算** | Haversine公式（自前実装） | 現在地とスポット座標の距離を計算 |
| **アニメーション** | CSS `@keyframes` + `transform: translateY` | 言葉が上から降ってくる演出 |
| **写真合成** | Canvas API `drawImage()` / `fillText()` / `toDataURL()` | テキストを写真に重ねて画像として保存 |
| **DB追加** | Supabase（`spot_quotes`テーブル） | スポットに紐づく言葉を格納 |

**実装メモ:**
- Web版はリアルタイムカメラARは対象外（スポット詳細の既存写真への合成を優先）
- iOSでは ARKit を使ったカメラオーバーレイも将来検討可能

---

### 2.6 Phase G〜H: 最適化・LP

追加技術なし。既存構成で実装可能。

---

### 2.7 Phase I: iOS版（メインプロダクト）

```
┌─────────────────────────────────────────────────────────────────┐
│                  Phase I: iOS版（メインプロダクト）               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  iOSアプリ                                               │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐           │   │
│  │  │  Swift    │  │  SwiftUI  │  │  MapKit   │           │   │
│  │  │  5.x      │  │           │  │           │           │   │
│  │  └───────────┘  └───────────┘  └───────────┘           │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐           │   │
│  │  │  Core     │  │    AV     │  │ Vision    │ ← OCR     │   │
│  │  │ Location  │  │Foundation │  │ framework │   NEW     │   │
│  │  └───────────┘  └───────────┘  └───────────┘           │   │
│  │  ┌───────────┐  ┌───────────┐                          │   │
│  │  │  Apple    │  │ Supabase  │                          │   │
│  │  │Intelligence│ │ Swift SDK │                          │   │
│  │  └───────────┘  └───────────┘                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  月額コスト: $0（開発中）/ App Store公開時: Apple Dev $99/年    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

| カテゴリ | 技術 | 用途 |
|----------|------|------|
| **言語** | Swift 5.x | iOS開発 |
| **UI** | SwiftUI | 宣言的UI |
| **地図** | MapKit | Apple標準地図 |
| **位置情報** | Core Location | GPS・ジオフェンシング・watchPosition相当 |
| **カメラ** | AVFoundation | 写真撮影 |
| **写真選択** | PhotosUI | ギャラリー |
| **EXIF処理** | Photos Framework | GPS・撮影日時抽出 |
| **画像処理** | Core Image | EXIF削除・リサイズ |
| **通知** | UserNotifications + APNs | プッシュ通知 |
| **ローカルキャッシュ** | SwiftData | オフライン対応 |
| **OCR（重複マージ）⭐** | Vision.framework `VNRecognizeTextRequest` | 写真内テキスト認識（On-Device） |
| **AI処理** | Apple Intelligence（On-Device） | プライバシー保護されたOCR処理 |
| **リアルタイム** | Supabase Realtime | DM・タイムライン更新 |
| **DB連携** | supabase-swift | バックエンド接続 |

#### React Native切り替えの判断基準

| 状況 | 判断 |
|------|------|
| Swiftの学習が順調 | → Swift継続 |
| 基本機能が一定期間で動かない | → React Native検討 |
| Android版を早期に出したい | → React Native検討 |
| ジオフェンシング・Vision等を重視 | → Swift継続推奨 |

---

### 2.8 Phase J: スケール・拡張

```
┌─────────────────────────────────────────────────────────────────┐
│                    Phase J: スケール・拡張                        │
├─────────────────────────────────────────────────────────────────┤
│  ホスティング移行（Vercel Pro → Render / Cloudflare等）          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  選択肢A: Render ($7-14/月) - Docker対応、予測可能な料金 │   │
│  │  選択肢B: Cloudflare Pages ($0-20/月) - エッジ最速      │   │
│  │  選択肢C: Railway ($5-20/月) - シンプル・従量課金        │   │
│  └─────────────────────────────────────────────────────────┘   │
│  機能拡張: ジオフェンシング通知・Android版・多言語・ウィジェット  │
│  月額コスト: $58-65（移行後）                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. システムアーキテクチャ

### 3.1 全体構成図

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          OSHIATO システム構成                                │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │    ユーザー      │
                              └────────┬────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
           ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
           │   Web版       │  │   iOS版       │  │  Android版    │
           │   Next.js     │  │   Swift       │  │  (Phase 4)    │
           │               │  │   SwiftUI     │  │               │
           └───────┬───────┘  └───────┬───────┘  └───────┬───────┘
                   │                  │                  │
                   └──────────────────┼──────────────────┘
                                      │
                                      ▼
                        ┌─────────────────────────┐
                        │       Supabase          │
                        │  ┌─────────────────┐    │
                        │  │   PostgreSQL    │    │
                        │  │   + PostGIS     │    │
                        │  └─────────────────┘    │
                        │  ┌─────────────────┐    │
                        │  │     Auth        │    │
                        │  └─────────────────┘    │
                        │  ┌─────────────────┐    │
                        │  │    Storage      │    │
                        │  └─────────────────┘    │
                        │  ┌─────────────────┐    │
                        │  │    Realtime     │    │
                        │  └─────────────────┘    │
                        └─────────────────────────┘
                                      │
                        ┌─────────────┼─────────────┐
                        │             │             │
                        ▼             ▼             ▼
                 ┌───────────┐ ┌───────────┐ ┌───────────┐
                 │  Mapbox   │ │   APNs    │ │  Sentry   │
                 │  (地図)   │ │  (通知)   │ │  (監視)   │
                 └───────────┘ └───────────┘ └───────────┘
```

### 3.2 データフロー

```
┌─────────────────────────────────────────────────────────────────┐
│                      データフロー概要                            │
└─────────────────────────────────────────────────────────────────┘

  ユーザー操作              フロントエンド              バックエンド
       │                        │                        │
       │  地図を開く            │                        │
       │───────────────────────►│                        │
       │                        │  スポット取得          │
       │                        │───────────────────────►│
       │                        │◄───────────────────────│
       │◄───────────────────────│  ピン表示              │
       │                        │                        │
       │  写真を撮影            │                        │
       │───────────────────────►│                        │
       │                        │  画像アップロード      │
       │                        │───────────────────────►│ Storage
       │                        │  投稿データ保存        │
       │                        │───────────────────────►│ Database
       │                        │◄───────────────────────│
       │◄───────────────────────│  完了表示              │
       │                        │                        │
```

---

## 4. 技術スタック詳細

### 4.1 Web版（Next.js）

| カテゴリ | ライブラリ | バージョン | 用途 | Phase |
|----------|------------|------------|------|-------|
| **フレームワーク** | Next.js | 15.x | App Router | A〜 |
| | React | 19.x | UI | A〜 |
| | TypeScript | 5.x | 型安全 | A〜 |
| **スタイル** | CSS Modules | - | スコープ付きCSS | A〜 |
| **地図** | Mapbox GL JS | 3.x | 地図表示・レイヤー追加 | A〜 |
| | Mapbox Geocoding API | v5 | 住所検索→座標変換 | A〜 |
| **状態管理** | Zustand | 5.x | グローバル状態 | A〜 |
| | TanStack Query | 5.x | サーバー状態・キャッシュ | A〜 |
| **フォーム** | React Hook Form | 7.x | フォーム | A〜 |
| | Zod | 3.x | バリデーション | A〜 |
| **画像処理** | exifr | 7.x | EXIF/GPS・撮影日時抽出 | A〜 |
| | heic-decode | 2.x | HEIC形式デコード | A〜 |
| | Canvas API（ブラウザ標準） | - | テキスト合成・画像ダウンロード | **F〜** |
| **位置情報** | Web Geolocation API（ブラウザ標準） | - | `watchPosition()`でリアルタイム近接検知 | **F〜** |
| **Supabase** | @supabase/supabase-js | 2.x | バックエンド連携 | A〜 |
| **認証** | Supabase Auth | - | OAuth・JWT | **B〜** |

### 4.2 iOS版（Swift）

| カテゴリ | 技術 | 用途 | Phase |
|----------|------|------|-------|
| **言語** | Swift 5.x | 開発言語 | I〜 |
| **UI** | SwiftUI | 宣言的UI | I〜 |
| **地図** | MapKit | Apple地図 | I〜 |
| **位置** | Core Location | GPS・ジオフェンス | I〜 |
| **カメラ** | AVFoundation | 撮影 | I〜 |
| **写真** | PhotosUI | ギャラリー | I〜 |
| **EXIF処理** | Photos Framework | GPS・撮影日時抽出 | I〜 |
| **画像処理** | Core Image | EXIF削除・リサイズ | I〜 |
| **通知** | UserNotifications + APNs | プッシュ通知 | I〜 |
| **ローカルキャッシュ** | SwiftData | オフライン対応 | I〜 |
| **OCR ⭐** | Vision.framework `VNRecognizeTextRequest` | 写真内テキスト認識（On-Device） | I〜 |
| **AI処理 ⭐** | Apple Intelligence（On-Device） | プライバシー保護されたOCR処理 | I〜 |
| **リアルタイム** | Supabase Realtime | DM・タイムライン更新 | I〜 |
| **DB連携** | supabase-swift | バックエンド接続 | I〜 |

### 4.2.1 Next.js コンポーネント設計方針

#### `use client` の配置ルール

Next.js App Router では、すべてのコンポーネントはデフォルトで **Server Component（サーバー側で実行）** として扱われる。

**ルール: `page.tsx` に `'use client'` を直接書かない。**

`page.tsx` に `'use client'` を付けると、そのページ全体がクライアントサイドレンダリング（CSR）になる。
これにより、サーバーサイドレンダリング（SSR）の恩恵が失われ、**初回ページロードが著しく遅くなる**。

#### 正しい実装パターン

```
app/
└── map/
    └── page.tsx          ← 'use client' なし（Server Component のまま）

components/
└── map/
    └── MapView.tsx       ← 'use client' あり（クライアント処理をここに集約）
```

**page.tsx（Server Component）**:
```tsx
// 'use client' を書かない
import MapView from '@/components/map/MapView'

export default function MapPage() {
  return <MapView />
}
```

**MapView.tsx（Client Component）**:
```tsx
'use client'  // ← ここに書く

import { useEffect, useState } from 'react'

export default function MapView() {
  const [map, setMap] = useState(null)
  // ...クライアント処理
}
```

#### なぜこうするのか

| | page.tsx に `use client` | components/ に `use client` |
|---|---|---|
| **SSRの適用** | ページ全体がCSRになる（❌） | page.tsx はSSRのまま（✅） |
| **初回ロード** | 遅い | 速い |
| **SEO** | 不利 | 有利 |
| **再利用性** | 低い | 高い（コンポーネント単位） |

#### `use client` が必要になる処理

以下を使う場合は、必ず `components/` 配下のファイルに切り出す:

- `useState` / `useEffect` などの React Hooks
- ブラウザ API（`window`, `document`, `navigator` 等）
- イベントハンドラ（`onClick`, `onChange` 等）
- Mapbox GL JS などのブラウザ専用ライブラリ

---

### 4.3 バックエンド（Supabase）

| サービス | 用途 | 導入Phase |
|----------|------|-----------|
| **PostgreSQL + PostGIS** | メインDB・地理情報クエリ | A〜 |
| **Auth** | OAuth認証・JWT管理 | **B〜** |
| **Storage** | 画像保存・CDN配信 | A〜 |
| **Realtime** | DM・タイムライン更新（iOS Phase I〜） | I〜 |
| **Edge Functions** | 将来的なサーバーレス処理 | J〜（必要に応じて） |

**協調フィルタリング（Phase E）の実装方針:**
- 外部MLサービスは使わず、PostgreSQL上のSQL集計のみで完結
- `oshi_users` テーブルの JOIN と GROUP BY でスコアリング
- Supabase Free枠内で実現可能

---

## 5. ホスティング戦略

### 5.1 移行前提の設計

```
┌─────────────────────────────────────────────────────────────────┐
│                    ホスティング移行戦略                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Phase 1-3: Vercel                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  メリット:                                               │   │
│  │  • Next.js最適化（開発速度向上）                         │   │
│  │  • 無料枠で開発可能                                      │   │
│  │  • プレビュー環境が便利                                  │   │
│  │                                                         │   │
│  │  注意点:                                                 │   │
│  │  • Vercel固有機能は使わない                              │   │
│  │  • 環境変数で設定を外部化                                │   │
│  │  • 標準Next.js機能のみ使用                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                   │
│                            ▼                                   │
│  Phase 4: 移行（必要に応じて）                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  移行先候補:                                             │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │   │
│  │  │   Render    │ │ Cloudflare  │ │   Railway   │       │   │
│  │  │  $7-14/月   │ │  $0-20/月   │ │  $5-20/月   │       │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘       │   │
│  │                                                         │   │
│  │  移行作業:                                               │   │
│  │  • Dockerfile作成（1-2時間）                             │   │
│  │  • 環境変数移行（30分）                                  │   │
│  │  • DNS切り替え（即時）                                   │   │
│  │  • 動作確認（1-2時間）                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 移行先比較

| 項目 | Vercel | Render | Cloudflare | Railway |
|------|--------|--------|------------|---------|
| **月額** | $20〜 | $7〜 | $0〜20 | $5〜 |
| **Next.js対応** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Docker** | ❌ | ✅ | ❌ | ✅ |
| **予測可能性** | ⚠️ 従量制 | ✅ 固定 | ✅ 固定 | ⚠️ 従量制 |
| **移行難易度** | - | 簡単 | 中 | 簡単 |

### 5.3 Dockerfile（移行準備）

```dockerfile
# 移行時に使用するDockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 6. コスト計算

### 6.1 Phase別コスト詳細

#### Phase A〜H: Web版先行実装（開発期間）

| サービス | プラン | 月額 |
|----------|--------|------|
| Vercel | Free | $0 |
| Supabase | Free | $0 |
| Mapbox | Free tier | $0 |
| **合計** | | **$0** |

#### Phase I: iOS版開発期間

| サービス | プラン | 月額 | 備考 |
|----------|--------|------|------|
| Vercel | Free | $0 | Web版継続 |
| Supabase | Free | $0 | |
| Mapbox | Free tier | $0 | |
| Apple Developer | - | $8.25 | $99/年（実機テスト・TestFlight用） |
| **合計** | | **$8.25** | |

#### MVP本番リリース後

| サービス | プラン | 月額 | 備考 |
|----------|--------|------|------|
| Vercel | Pro | $20 | |
| Supabase | Pro | $25 | 8GB DB |
| Mapbox | Pay as you go | $0〜50 | 無料枠内想定 |
| Sentry | Team | $26 | 本番前に導入 |
| Apple Developer | - | $8.25 | $99/年 |
| **合計（Sentry前）** | | **$53** | |
| **合計（Sentry後）** | | **$79** | |

#### Phase J: スケール・移行後

| サービス | プラン | 月額 | 備考 |
|----------|--------|------|------|
| Render | Starter | $7〜14 | or Cloudflare $0〜20 |
| Supabase | Pro | $25〜50 | スケールに応じて |
| Mapbox | Pay as you go | $0〜50 | |
| Sentry | Team | $26 | |
| Apple Developer | - | $8.25 | |
| **合計** | | **$66〜148** | |

### 6.2 年間コスト見込み

| 期間 | 月数 | 月額 | 小計 |
|------|------|------|------|
| Web先行実装（Phase A〜H） | 〜5ヶ月 | $0 | $0 |
| iOS版開発（Phase I） | 〜2ヶ月 | $8.25 | $17 |
| MVP本番（Sentry導入後） | 〜4ヶ月 | $79 | $316 |
| スケール後運用 | 〜3ヶ月 | $66 | $198 |
| **1年目合計** | | | **約 $531** |

### 6.3 スケール時のコスト

| DAU | Vercel継続 | Render移行 | 差額 |
|-----|------------|------------|------|
| 1,000 | $79 | $66 | -$13/月 |
| 5,000 | $120 | $85 | -$35/月 |
| 10,000 | $200 | $110 | -$90/月 |
| 50,000 | $500+ | $200 | -$300/月 |

---

## 7. セキュリティ設計

### 7.1 認証・認可

| 項目 | 実装 |
|------|------|
| **認証方式** | OAuth 2.0 (Google/Apple/X) |
| **セッション** | JWT（Supabase Auth） |
| **認可** | Row Level Security (RLS) |

### 7.2 データ保護

| 項目 | 対策 |
|------|------|
| **通信** | HTTPS必須 |
| **画像** | EXIF抽出後に削除（公開画像はEXIF無し） |
| **撮影位置** | DBに保存、本人のみ閲覧可能（RLS） |
| **撮影日時** | DBに保存、投稿表示に使用 |
| **個人情報** | 匿名化、最小限収集 |

### 7.3 EXIF処理

```
写真選択 → EXIF抽出 → DB保存 + 画像処理（EXIF削除）→ Storage

抽出する情報:
- GPS座標（緯度・経度）→ taken_location, visit_logs.location
- 撮影日時 → taken_at, visit_logs.visited_at

公開される画像:
- EXIF情報なし（プライバシー保護）
- リサイズ + WebP変換（最適化）
```

### 7.4 画像仕様

| 項目 | 仕様 |
|------|------|
| **アップロード上限** | 5MB/枚 |
| **枚数上限** | 4枚/投稿 |
| **入力形式** | JPEG, PNG, HEIC |
| **出力形式** | WebP |
| **最大サイズ** | 1920px（長辺） |
| **圧縮品質** | 80% |
| **サムネイル** | 400px（長辺）、品質70% |

### 7.5 Supabase Storage構造

```
storage/
├── images/                     # 画像バケット（公開）
│   ├── posts/                  # 投稿画像
│   │   └── {post_id}/
│   │       ├── 1.webp          # メイン画像
│   │       ├── 2.webp
│   │       ├── 3.webp
│   │       ├── 4.webp
│   │       └── thumb/          # サムネイル
│   │           ├── 1.webp
│   │           ├── 2.webp
│   │           ├── 3.webp
│   │           └── 4.webp
│   │
│   └── avatars/                # ユーザーアバター（Phase 3）
│       └── {user_id}.webp
│
└── cards/                      # カード画像（Phase 3）
    └── {user_id}/
        └── {card_id}.webp
```

**バケット設定:**

| バケット | 公開 | 用途 |
|----------|------|------|
| images | 公開 | 投稿画像、アバター |
| cards | 公開 | 生成されたカード画像 |

### 7.6 RLSポリシー例

```sql
-- ユーザーは自分のデータのみ参照可能
CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (auth.uid() = id);

-- 投稿は全員が参照可能（アクティブなもののみ）
CREATE POLICY "Anyone can view active posts"
ON posts FOR SELECT
USING (status = 'active');

-- 投稿は本人のみ編集可能
CREATE POLICY "Users can update own posts"
ON posts FOR UPDATE
USING (auth.uid() = user_id);
```

---

## 8. 監視・運用

### 8.1 監視構成

| ツール | 用途 | 導入時期 |
|--------|------|----------|
| **Vercel Analytics** | Web Vitals | Phase A〜 |
| **Supabase Dashboard** | DB監視 | Phase A〜 |
| **Sentry** | エラー監視 | Phase I（本番前） |
| **PostHog** | アナリティクス | Phase J〜 |

### 8.2 バックアップ

| 対象 | 方式 | 頻度 |
|------|------|------|
| PostgreSQL | Supabase自動 | 日次 |
| Storage | Supabaseレプリケーション | リアルタイム |
| コード | Git | 継続的 |

---

## 9. 開発環境

### 9.1 必要ツール

| ツール | 用途 | Phase |
|--------|------|-------|
| **Node.js 20.x** | Web開発 | A〜 |
| **npm** | パッケージ管理 | A〜 |
| **VS Code** | エディタ | A〜 |
| **Supabase CLI** | DB管理・マイグレーション | A〜 |
| **Xcode 16.x** | iOS開発 | I〜 |

### 9.2 環境変数

```bash
# Web版 (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx

# iOS版 (Secrets.plist or Environment)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
```

---

## 10. リポジトリ構成

```
Oshiato/
├── apps/
│   ├── web/                    # Next.js Web版
│   │   ├── app/                # App Router
│   │   ├── components/
│   │   ├── lib/
│   │   └── package.json
│   │
│   └── ios/                    # Swift iOS版
│       ├── OSHIATO/
│       │   ├── Views/
│       │   ├── Models/
│       │   ├── Services/
│       │   └── OSHIATO.xcodeproj
│       └── README.md
│
├── supabase/
│   ├── migrations/             # DBマイグレーション
│   ├── seed.sql
│   └── config.toml
│
├── docs/                       # ドキュメント
│   ├── Requirements_v5_1.md
│   ├── Technical_Architecture_v5_1.md
│   ├── Sitemap_v5_1.md
│   ├── Database_Schema_v5_1.md
│   └── API_Specification_v5_1.md
│
├── Dockerfile                  # 移行用
├── docker-compose.yml
└── README.md
```

---

**OSHIATO 技術構成資料 v6.0**
