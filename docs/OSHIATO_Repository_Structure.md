# OSHIATO リポジトリ構造定義書

**地図であなたのOSHIの足跡を残す**

---

| 項目 | 内容 |
|------|------|
| バージョン | v1.0 |
| 作成日 | 2026年3月 |
| 対応CLAUDE.md | v1.0 |

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|------------|------|----------|
| v1.0 | 2026/03 | 初版作成 |
| v1.1 | 2026/03/22 | `.claude/`, ルート `package.json`, `tsconfig.json` を追加 |

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
├── app/                         # App Router（ページ）
│   ├── layout.tsx               # 共通レイアウト
│   ├── page.tsx                 # トップページ（マップ）
│   ├── globals.css              # グローバルCSS
│   │
│   ├── spot/
│   │   └── [id]/
│   │       └── page.tsx         # スポット詳細
│   │
│   ├── post/
│   │   └── new/
│   │       └── page.tsx         # 投稿作成
│   │
│   ├── timeline/
│   │   └── page.tsx             # タイムライン
│   │
│   ├── oshi/
│   │   └── page.tsx             # 推し管理
│   │
│   ├── visits/
│   │   └── page.tsx             # 訪問ログ
│   │
│   └── trajectory/
│       └── page.tsx             # 軌跡マップ
│
├── components/                  # 再利用可能なコンポーネント
│   ├── map/                     # 地図関連
│   │   ├── MapView.tsx
│   │   ├── MapView.module.css
│   │   ├── SpotPin.tsx
│   │   └── SpotPin.module.css
│   │
│   ├── post/                    # 投稿関連
│   │   ├── PostCard.tsx
│   │   ├── PostCard.module.css
│   │   ├── PostForm.tsx
│   │   └── PostForm.module.css
│   │
│   ├── oshi/                    # 推し関連
│   │   ├── OshiSelector.tsx
│   │   └── OshiSelector.module.css
│   │
│   └── ui/                      # 共通UI
│       ├── Button.tsx
│       ├── Button.module.css
│       ├── Input.tsx
│       ├── Input.module.css
│       ├── Modal.tsx
│       └── Modal.module.css
│
├── lib/                         # ユーティリティ・サービス
│   ├── supabase.ts              # Supabaseクライアント
│   ├── exif.ts                  # EXIF処理
│   ├── image.ts                 # 画像処理
│   └── utils.ts                 # 汎用ユーティリティ
│
├── hooks/                       # カスタムフック
│   ├── useSpots.ts              # スポット取得
│   ├── usePosts.ts              # 投稿取得
│   ├── useOshis.ts              # 推し取得
│   └── useGeolocation.ts        # 位置情報取得
│
├── types/                       # 型定義
│   ├── database.ts              # Supabase自動生成型
│   ├── spot.ts                  # スポット関連型
│   ├── post.ts                  # 投稿関連型
│   └── oshi.ts                  # 推し関連型
│
├── public/                      # 静的ファイル
│   ├── favicon.ico
│   └── images/
│       └── logo.svg
│
├── package.json
├── tsconfig.json
├── next.config.js
└── .env.local                   # 環境変数（Git管理外）
```

### 7.1 ディレクトリの役割

| ディレクトリ | 役割 |
|-------------|------|
| app/ | Next.js App Routerのページコンポーネント |
| components/ | 再利用可能なUIコンポーネント |
| lib/ | ユーティリティ関数、外部サービス連携 |
| hooks/ | カスタムReactフック |
| types/ | TypeScript型定義 |
| public/ | 静的ファイル（画像、フォントなど） |

### 7.2 ファイル配置ルール

#### ページ（app/）

- **1ページ = 1ディレクトリ**: `app/spot/[id]/page.tsx`
- **動的ルート**: `[id]`のようにブラケットで囲む
- **レイアウト**: 共通レイアウトは`layout.tsx`に配置

#### コンポーネント（components/）

- **機能別にグループ化**: `map/`, `post/`, `oshi/`, `ui/`
- **1コンポーネント = 1ファイル + 1CSSモジュール**:
  ```
  components/map/
  ├── MapView.tsx
  └── MapView.module.css
  ```
- **共通UI**: `ui/`に配置（Button, Input, Modalなど）

#### ライブラリ（lib/）

- **外部サービス連携**: `supabase.ts`, `mapbox.ts`
- **ユーティリティ**: `exif.ts`, `image.ts`, `utils.ts`
- **純粋関数のみ**: 副作用のない関数を配置

#### フック（hooks/）

- **命名**: `use{機能名}.ts`（例: useSpots.ts）
- **1フック = 1ファイル**
- **データ取得・状態管理**: Supabaseからのデータ取得など

#### 型定義（types/）

- **機能別に分割**: `spot.ts`, `post.ts`, `oshi.ts`
- **Supabase生成型**: `database.ts`（自動生成）

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
├── config.toml                  # Supabase CLI設定
│
├── migrations/                  # マイグレーションファイル
│   ├── 00001_initial.sql        # 初期テーブル作成
│   ├── 00002_add_visits.sql     # 訪問ログテーブル追加
│   └── ...
│
├── seed.sql                     # 初期データ
│
└── functions/                   # Edge Functions（Phase 3以降）
    └── ...
```

### 9.1 ディレクトリの役割

| ディレクトリ/ファイル | 役割 |
|----------------------|------|
| config.toml | Supabase CLIの設定ファイル |
| migrations/ | データベースマイグレーション |
| seed.sql | 開発用の初期データ |
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

**OSHIATO リポジトリ構造定義書 v1.0**
