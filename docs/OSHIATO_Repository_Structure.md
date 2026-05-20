# OSHIATO リポジトリ構造定義書

**地図であなたのOSHIの足跡を残す**

---

| 項目 | 内容 |
|------|------|
| バージョン | v1.3 |
| 作成日 | 2026年3月 |
| 対応CLAUDE.md | v1.0 |

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|------------|------|----------|
| v1.0 | 2026/03 | 初版作成 |
| v1.1 | 2026/03/22 | `.claude/`, ルート `package.json`, `tsconfig.json` を追加 |
| v1.2 | 2026/04/04 | `apps/web/` の components / lib 構造を実態に合わせて更新 |
| v1.3 | 2026/05/10 | Phase B・C 実装完了。`app/auth/`・`app/mypage/`・`components/auth/`・`components/mypage/`・`SpotEditForm/`・`LogoutButton/` 追加。`lib/supabase/middleware.ts`・`middleware.ts` 追加。`getOrCreateUser.ts` 削除。 |

---

## 1. 概要

このドキュメントは、OSHIATOプロジェクトのフォルダ・ファイル構成、各ディレクトリの役割、ファイル配置のルールを定義します。

### 1.1 基本方針

- **明確な責務分離**: 各ディレクトリは単一の責務を持つ
- **予測可能な配置**: ファイルの場所が推測しやすい構造
- **スケーラビリティ**: 機能追加時も構造が破綻しない設計

---

## 2. ルートディレクトリ構造

```
Oshiato/
├── CLAUDE.md                   # Claude Code用指示書
├── README.md                   # プロジェクト説明
├── package.json                # モノレポワークスペース設定
├── tsconfig.json               # TypeScript基底設定
├── .gitignore                  # Git除外設定
├── .env.example                # 環境変数サンプル
│
├── .claude/                    # Claude Code プロジェクト設定
├── docs/                       # 永続的ドキュメント
├── .steering/                  # 作業単位のドキュメント
├── apps/                       # アプリケーション
└── supabase/                   # データベース関連
```

### 2.1 ルートファイルの役割

| ファイル | 役割 |
|----------|------|
| CLAUDE.md | Claude Codeへの指示書。プロジェクトのルール・方針を記載 |
| README.md | プロジェクトの概要、セットアップ手順、貢献ガイド |
| package.json | npmワークスペースのルート設定。`apps/web`を管理 |
| tsconfig.json | TypeScriptの基底設定。各アプリはこれを継承する |
| .gitignore | Gitで追跡しないファイル・フォルダを指定 |
| .env.example | 環境変数のサンプル。実際の値は含めない |

---

## 3. docs/ - 永続的ドキュメント

アプリケーション全体の設計・方針を定義する恒久的なドキュメントを格納します。

```
docs/
├── Setup_Guide.md               # 環境構築手順
├── UI_Design_Guide.md           # UIデザインルール
├── Repository_Structure.md      # このファイル
│
├── Requirements_v5_1.md         # 要件定義
├── Technical_Architecture_v5_1.md # 技術構成
├── Sitemap_v5_1.md              # サイトマップ
├── Database_Schema_v5_1.md      # DB定義
└── API_Specification_v5_1.md    # API定義
```

### 3.1 ファイルの役割

| ファイル | 役割 | 更新タイミング |
|----------|------|---------------|
| Setup_Guide.md | 環境構築手順、初回セットアップ | 環境変更時 |
| UI_Design_Guide.md | カラー、フォント、コンポーネント規約 | デザイン変更時 |
| Repository_Structure.md | フォルダ構成、配置ルール | 構造変更時 |
| Requirements_v5_1.md | 機能要件、非機能要件 | 要件変更時 |
| Technical_Architecture_v5_1.md | 技術スタック、アーキテクチャ | 技術方針変更時 |
| Sitemap_v5_1.md | 画面構成、ナビゲーション | 画面追加・変更時 |
| Database_Schema_v5_1.md | テーブル定義、ER図 | DB設計変更時 |
| API_Specification_v5_1.md | API仕様、実装例 | API追加・変更時 |

### 3.2 命名規則

- **ガイド系**: `{名前}_Guide.md`（例: Setup_Guide.md）
- **定義系**: `{名前}_v{メジャー}_{マイナー}.md`（例: Requirements_v5_1.md）

---

## 4. .claude/ - Claude Code プロジェクト設定

Claude Code のプロジェクトレベルのカスタマイズを格納します。

```
.claude/
├── commands/                    # プロジェクト専用スラッシュコマンド
│   └── *.md                     # /コマンド名 で呼び出せるプロンプト
│
├── skills/                      # プロジェクト専用スキル定義
│   └── *.md                     # 特定の作業パターンを定義
│
└── agents/                      # プロジェクト専用サブエージェント定義
    └── *.md                     # 専門タスク用エージェントを定義
```

### 4.1 ディレクトリの役割

| ディレクトリ | 役割 |
|-------------|------|
| commands/ | `/コマンド名` で呼び出せるプロジェクト固有のスラッシュコマンド |
| skills/ | 繰り返し使う作業パターンをスキルとして定義 |
| agents/ | 地図・投稿など機能別の専門エージェント定義 |

### 4.2 ファイル形式

各ファイルはMarkdown形式で記述し、Claude Codeが自動的に認識します。

```
.claude/commands/start-steering.md  → /start-steering コマンド
.claude/agents/map-agent.md         → 地図機能専門エージェント
```

---

## 5. .steering/ - 作業単位のドキュメント

日次の作業記録を格納する隠しディレクトリです。

```
.steering/
├── 20260322-setup/
│   ├── requirements.md          # 今日の要求内容
│   ├── design.md                # 設計・アプローチ
│   ├── decision.md              # 重要な決定事項
│   └── tasklist.md              # タスクリスト・進捗
│
├── 20260323-map-display/
│   ├── requirements.md
│   ├── design.md
│   ├── decision.md
│   └── tasklist.md
│
└── 20260324-spot-post/
    ├── requirements.md
    ├── design.md
    ├── decision.md
    └── tasklist.md
```

### 4.1 命名規則

```
.steering/[YYYYMMDD]-[開発タイトル]/
```

- **YYYYMMDD**: 作業日（例: 20260322）
- **開発タイトル**: 作業内容を英語kebab-caseで（例: map-display, spot-post）

### 4.2 ファイルの役割

| ファイル | 役割 |
|----------|------|
| requirements.md | 今日の要求内容、ユーザーストーリー、受け入れ条件 |
| design.md | 実装アプローチ、変更コンポーネント、影響範囲 |
| decision.md | 重要な決定事項、決定の背景・理由、検討した選択肢 |
| tasklist.md | タスク一覧、進捗状況、作業ログ、問題と解決策 |

---

## 6. apps/ - アプリケーション

Web版とiOS版のソースコードを格納します。

```
apps/
├── web/                         # Next.js Web版
└── ios/                         # Swift iOS版
```

---

## 7. apps/web/ - Next.js Web版

```
apps/web/
├── middleware.ts                # ルート保護（未認証 → /auth/login にリダイレクト）
│
├── app/                         # App Router（ページ）
│   ├── layout.tsx               # 共通レイアウト（ToastProvider含む）
│   ├── page.tsx                 # トップページ（マップ）
│   ├── globals.css              # グローバルCSS + Mapboxポップアップスタイル
│   │
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx         # ログイン → LoginForm
│   │   ├── register/
│   │   │   └── page.tsx         # 新規登録 → RegisterForm
│   │   └── callback/
│   │       └── route.ts         # OAuth コールバック（骨格）
│   │
│   ├── setup-profile/
│   │   └── page.tsx             # 初回プロフィール設定 → SetupProfileForm
│   │
│   ├── mypage/
│   │   ├── page.tsx             # マイページ → MyPageClient
│   │   └── profile/
│   │       └── page.tsx         # プロフィール編集 → ProfileEditForm
│   │
│   ├── spot/
│   │   └── [id]/
│   │       └── page.tsx         # スポット詳細 → SpotDetail
│   │
│   ├── post/
│   │   └── new/
│   │       └── page.tsx         # 投稿作成 → PostForm
│   │
│   ├── timeline/
│   │   └── page.tsx             # タイムライン → TimelineGrid
│   │
│   ├── oshi/
│   │   ├── page.tsx             # 推し管理（OshiCard + AddOshiForm）
│   │   ├── page.module.css
│   │   └── [id]/
│   │       └── spots/
│   │           └── page.tsx     # 推し別スポット一覧 → OshiSpotList（Phase E）
│   │
│   ├── visits/
│   │   └── page.tsx             # 訪問ログ → VisitList
│   │
│   └── trajectory/
│       └── page.tsx             # 軌跡マップ → TrajectoryMap
│
├── components/                  # 再利用可能なコンポーネント
│   ├── layout/                  # レイアウト
│   │   └── AppShell/            #   アプリ骨格（TabBar含む）
│   │
│   ├── auth/                    # 認証関連（Phase B〜）
│   │   ├── LoginForm/           #   ログインフォーム
│   │   ├── RegisterForm/        #   新規登録フォーム
│   │   └── SetupProfileForm/    #   初回プロフィール設定フォーム
│   │
│   ├── mypage/                  # マイページ関連（Phase C〜）
│   │   ├── MyPageClient/        #   統計ダッシュボード（投稿数・訪問数・推し別集計）
│   │   └── ProfileEditForm/     #   表示名編集フォーム
│   │
│   ├── map/                     # 地図関連
│   │   ├── MapView/             #   Mapbox地図 + スポットピン + チェックイン
│   │   ├── MapFilter/           #   期間フィルターバー（今日/明日/今週/カスタム）
│   │   ├── OshiFilter/          #   推しフィルター（ドロップダウン複数選択）
│   │   └── SearchResultSheet/   #   検索結果パネル（下からスライド）（Phase E）
│   │
│   ├── search/                  # 検索関連（Phase E〜）
│   │   ├── MapSearchBar/        #   マップ上部の常時表示検索バー
│   │   └── SearchResultCard/    #   検索結果カード（OshiSpotList でも再利用）
│   │
│   ├── post/                    # 投稿関連
│   │   ├── PostForm/            #   投稿フォーム
│   │   ├── ImagePicker/         #   画像選択
│   │   └── LocationPicker/      #   手動位置指定（住所検索 + 地図タップ）
│   │
│   ├── spot/                    # スポット関連
│   │   ├── SpotDetail/          #   スポット詳細ページ本体（編集・削除ボタン含む）
│   │   ├── SpotEditForm/        #   投稿編集フォーム（カテゴリ・コメント）
│   │   └── CheckInButton/       #   チェックインボタン
│   │
│   ├── timeline/                # タイムライン関連
│   │   └── TimelineGrid/        #   月別写真グリッド
│   │
│   ├── trajectory/              # 軌跡関連
│   │   ├── TrajectoryMap/       #   軌跡マップ本体
│   │   └── TrajectoryTabs/      #   軌跡マップ/訪問ログ切り替えタブ
│   │
│   ├── oshi/                    # 推し関連
│   │   ├── OshiCard/            #   推しカード表示（Phase E でスポットリンク追加）
│   │   ├── AddOshiForm/         #   推し追加フォーム（サジェスト検索＋HSLカラーピッカー）
│   │   └── OshiSpotList/        #   推し別スポット一覧（Phase E）
│   │
│   ├── visits/                  # 訪問ログ関連
│   │   └── VisitList/           #   訪問ログ一覧
│   │
│   └── ui/                      # 共通UI
│       ├── TabBar/              #   タブバー（5タブ。マイページタブは /mypage を指す）
│       ├── LogoutButton/        #   ログアウトボタン
│       ├── EmptyState/          #   空状態表示（アイコン+メッセージ+CTA）
│       ├── LoadingSpinner/      #   ローディングスピナー（S/M/L）
│       └── Toast/               #   Toast通知（success/error/warning）
│                                #     + ToastProvider（Context）
│
├── lib/                         # ユーティリティ・サービス
│   ├── supabase/                # Supabase関連
│   │   ├── client.ts            #   ブラウザ用クライアント（createBrowserClient）
│   │   ├── server.ts            #   サーバー用クライアント（createServerClient + Cookie）
│   │   ├── middleware.ts        #   ミドルウェア用セッション更新ロジック
│   │   ├── database.types.ts    #   DB型定義（手動管理。Phase 3以降自動生成予定）
│   │   ├── spots.ts             #   スポット検索・作成・投稿更新・投稿削除
│   │   ├── checkins.ts          #   チェックイン実行・距離計算
│   │   └── search.ts            #   検索クエリ（searchSpots / findNearbySpotsForDisplay / getSpotsByOshi / getRecommendedSpots）（Phase E）
│   │
│   ├── exif/
│   │   └── extractExif.ts       #   EXIF抽出（GPS・撮影日時）
│   │
│   ├── image/
│   │   └── processImage.ts      #   画像処理（WebP変換・リサイズ・HEICプレビュー）
│   │
│   ├── date/
│   │   └── periodHelper.ts      #   期間計算（週の月曜/日曜・カテゴリ別デフォルト）
│   │
│   └── user/
│       ├── useCurrentUser.ts    #   現在ユーザーフック（userId + displayName を返す）
│       └── index.ts             #   re-export
│
├── public/                      # 静的ファイル
│
├── package.json
├── tsconfig.json
├── next.config.ts
└── .env.local                   # 環境変数（Git管理外）
```

### 7.1 ディレクトリの役割

| ディレクトリ | 役割 |
|-------------|------|
| app/ | Next.js App Routerのページコンポーネント |
| components/ | 再利用可能なUIコンポーネント（機能別にグループ化） |
| lib/ | ユーティリティ関数、外部サービス連携（機能別にサブディレクトリ） |
| public/ | 静的ファイル（画像、フォントなど） |

### 7.2 ファイル配置ルール

#### ページ（app/）

- **1ページ = 1ディレクトリ**: `app/spot/[id]/page.tsx`
- **動的ルート**: `[id]`のようにブラケットで囲む
- **レイアウト**: 共通レイアウトは`layout.tsx`に配置

#### コンポーネント（components/）

- **機能別にグループ化**: `map/`, `post/`, `spot/`, `oshi/`, `timeline/`, `trajectory/`, `visits/`, `ui/`, `layout/`
- **1コンポーネント = 1ディレクトリ（tsx + module.css）**:
  ```
  components/map/MapView/
  ├── MapView.tsx
  ├── MapView.module.css
  └── MapView_dynamic.tsx    # （SSR無効ラッパー、必要な場合のみ）
  ```
- **共通UI**: `ui/`に配置（TabBar, EmptyState, LoadingSpinner, Toast）
- **レイアウト**: `layout/`に配置（AppShell）

#### ライブラリ（lib/）

- **機能別にサブディレクトリ**: `supabase/`, `exif/`, `image/`, `date/`, `user/`
- **カスタムフックもlib内に配置**: `lib/user/useCurrentUser.ts`
- **外部サービス連携**: `supabase/client.ts`, `supabase/checkins.ts`

---

## 8. apps/ios/ - Swift iOS版

```
apps/ios/
└── OSHIATO/
    ├── OSHIATO.xcodeproj        # Xcodeプロジェクト
    │
    ├── App/
    │   ├── OSHIATOApp.swift     # アプリエントリポイント
    │   └── ContentView.swift    # ルートビュー
    │
    ├── Views/                   # SwiftUIビュー
    │   ├── Map/
    │   │   ├── MapView.swift
    │   │   └── SpotAnnotation.swift
    │   │
    │   ├── Post/
    │   │   ├── PostCard.swift
    │   │   └── PostForm.swift
    │   │
    │   ├── Oshi/
    │   │   └── OshiSelector.swift
    │   │
    │   ├── Timeline/
    │   │   └── TimelineView.swift
    │   │
    │   └── Common/
    │       ├── CustomButton.swift
    │       └── LoadingView.swift
    │
    ├── Models/                  # データモデル
    │   ├── Spot.swift
    │   ├── Post.swift
    │   ├── Oshi.swift
    │   └── User.swift
    │
    ├── Services/                # サービス層
    │   ├── SupabaseService.swift
    │   ├── LocationService.swift
    │   └── ImageService.swift
    │
    ├── ViewModels/              # ビューモデル（MVVM）
    │   ├── MapViewModel.swift
    │   ├── PostViewModel.swift
    │   └── OshiViewModel.swift
    │
    ├── Utilities/               # ユーティリティ
    │   ├── Extensions.swift
    │   └── Constants.swift
    │
    ├── Resources/               # リソース
    │   ├── Assets.xcassets
    │   └── Localizable.strings
    │
    └── Config/
        └── Secrets.plist        # 環境変数（Git管理外）
```

### 8.1 ディレクトリの役割

| ディレクトリ | 役割 |
|-------------|------|
| App/ | アプリのエントリポイント |
| Views/ | SwiftUIビューコンポーネント |
| Models/ | データモデル（構造体） |
| Services/ | 外部サービス連携（Supabase、位置情報など） |
| ViewModels/ | ビューのロジック（MVVM） |
| Utilities/ | 拡張、定数、ヘルパー |
| Resources/ | アセット、ローカライズファイル |
| Config/ | 設定ファイル |

### 8.2 ファイル配置ルール

#### ビュー（Views/）

- **機能別にグループ化**: `Map/`, `Post/`, `Oshi/`, `Common/`
- **1ビュー = 1ファイル**: `MapView.swift`
- **共通コンポーネント**: `Common/`に配置

#### モデル（Models/）

- **1モデル = 1ファイル**: `Spot.swift`
- **Codableプロトコル準拠**: JSON変換用

#### サービス（Services/）

- **外部連携ごとに分割**: `SupabaseService.swift`, `LocationService.swift`
- **シングルトンまたはDI**: 依存注入可能な設計

#### ビューモデル（ViewModels/）

- **ビューに対応**: `MapView.swift` → `MapViewModel.swift`
- **ObservableObject準拠**: SwiftUIのデータバインディング用

---

## 9. supabase/ - データベース関連

```
supabase/
├── config.toml                          # Supabase CLI設定
│
├── migrations/                          # マイグレーションファイル
│   ├── 00001_initial.sql                # 初期テーブル作成
│   ├── 00002_add_visits.sql             # 訪問ログテーブル追加
│   ├── 20260409_add_oshi_unique_index.sql # oshis テーブルのユニーク制約追加
│   └── ...
│
├── seed.sql                             # 初期データ
├── seed-oshis-hello-project.sql         # ハロプロ シードデータ（グループ＋メンバー）
├── seed-oshis-starto.sql                # STARTO シードデータ（グループ＋メンバー）
│
└── functions/                           # Edge Functions（Phase 3以降）
    └── ...
```

### 9.1 ディレクトリの役割

| ディレクトリ/ファイル | 役割 |
|----------------------|------|
| config.toml | Supabase CLIの設定ファイル |
| migrations/ | データベースマイグレーション |
| seed.sql | 開発用の初期データ |
| seed-oshis-hello-project.sql | ハロプロの推しマスタデータ（グループ＋メンバー） |
| seed-oshis-starto.sql | STARTOの推しマスタデータ（グループ＋メンバー） |
| functions/ | Supabase Edge Functions（Phase 3以降） |

### 9.2 マイグレーションの命名規則

```
[番号5桁]_[変更内容].sql
```

例:
- `00001_initial.sql` - 初期テーブル作成
- `00002_add_visits.sql` - 訪問ログテーブル追加
- `00003_add_indexes.sql` - インデックス追加

---

## 10. ファイル命名規則まとめ

### 10.1 一般ルール

| 対象 | 規則 | 例 |
|------|------|-----|
| ディレクトリ | kebab-case | `map-display/`, `spot-post/` |
| TypeScriptファイル | PascalCase（コンポーネント） | `MapView.tsx`, `SpotCard.tsx` |
| TypeScriptファイル | camelCase（ユーティリティ） | `supabase.ts`, `useSpots.ts` |
| CSSモジュール | コンポーネント名.module.css | `MapView.module.css` |
| Swiftファイル | PascalCase | `MapView.swift`, `Spot.swift` |
| SQLファイル | 番号_内容.sql | `00001_initial.sql` |
| ドキュメント | PascalCase_バージョン.md | `Requirements_v5_1.md` |

### 10.2 プレフィックス・サフィックス

| 種類 | パターン | 例 |
|------|----------|-----|
| カスタムフック | `use{名前}.ts` | `useSpots.ts` |
| 型定義 | `{名前}.ts` または `types/{名前}.ts` | `types/spot.ts` |
| テスト | `{名前}.test.ts` | `MapView.test.tsx` |
| スタイル | `{名前}.module.css` | `MapView.module.css` |

---

## 11. Git管理除外ファイル

以下のファイル・ディレクトリはGitで追跡しません（.gitignore）。

```gitignore
# 環境変数
.env.local
.env*.local
apps/ios/OSHIATO/Config/Secrets.plist

# 依存関係
node_modules/
.pnpm-store/

# ビルド成果物
.next/
out/
build/
dist/

# iOS
*.xcuserstate
DerivedData/
Pods/

# IDE
.idea/
.vscode/
*.swp

# OS
.DS_Store
Thumbs.db

# Supabase
.supabase/
```

---

## 12. 新規ファイル追加時のチェックリスト

新しいファイルを追加する際は、以下を確認してください。

### 12.1 コンポーネント追加時

- [ ] 適切なディレクトリに配置したか（`components/{機能名}/`）
- [ ] 命名規則に従っているか（PascalCase）
- [ ] CSSモジュールを同じディレクトリに配置したか
- [ ] 必要な型定義を追加したか

### 12.2 ページ追加時

- [ ] `app/`配下に適切なディレクトリ構造を作成したか
- [ ] `page.tsx`ファイルを作成したか
- [ ] `page.tsx` に `'use client'` を直接書いていないか（Client Componentは `components/` に切り出す）
- [ ] Sitemap_v5_1.mdを更新したか

### 12.3 API追加時

- [ ] `lib/`に適切な関数を追加したか
- [ ] 型定義を追加したか
- [ ] API_Specification_v5_1.mdを更新したか

### 12.4 DBテーブル追加時

- [ ] `supabase/migrations/`にマイグレーションを追加したか
- [ ] Database_Schema_v5_1.mdを更新したか
- [ ] 型定義（`types/database.ts`）を再生成したか

---

**OSHIATO リポジトリ構造定義書 v1.2**
