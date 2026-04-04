# OSHIATO Setup Guide

**環境構築手順書**

---

| 項目 | 内容 |
|------|------|
| バージョン | v1.0 |
| 作成日 | 2026年3月 |
| 対応Phase | Phase 1（Week 1） |

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|------------|------|----------|
| v1.0 | 2026/03 | 初版作成 |
| v1.1 | 2026/04 | Storage RLSポリシー設定手順を追加（4.1.4） |

---

## 1. 前提条件

### 1.1 必須環境

| 項目 | バージョン | 確認コマンド |
|------|-----------|-------------|
| **macOS** | 13.0以上 | `sw_vers` |
| **Node.js** | 20.x LTS | `node -v` |
| **npm** | 10.x以上 | `npm -v` |
| **Git** | 2.x以上 | `git --version` |

### 1.2 推奨ツール

| ツール | 用途 |
|-------|------|
| **VS Code** | コードエディタ |
| **Cursor** | AI搭載エディタ（VS Code互換） |
| **Warp** または **iTerm2** | ターミナル |

### 1.3 アカウント（事前に作成）

| サービス | 用途 | URL |
|---------|------|-----|
| **GitHub** | ソースコード管理 | https://github.com |
| **Supabase** | バックエンド（DB/Auth/Storage） | https://supabase.com |
| **Mapbox** | 地図表示 | https://www.mapbox.com |
| **Vercel** | ホスティング | https://vercel.com |

---

## 2. 開発ツールのインストール

### 2.1 Homebrew（未インストールの場合）

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2.2 Node.js

```bash
# Homebrewでインストール
brew install node@20

# または nvm を使用（推奨）
brew install nvm
nvm install 20
nvm use 20
```

**確認:**
```bash
node -v  # v20.x.x
npm -v   # 10.x.x
```

### 2.3 Git

```bash
brew install git
```

**初期設定:**
```bash
git config --global user.name "あなたの名前"
git config --global user.email "your-email@example.com"
```

### 2.4 VS Code（推奨拡張機能）

VS Codeをインストール後、以下の拡張機能を追加:

| 拡張機能 | 用途 |
|---------|------|
| ESLint | コード品質チェック |
| Prettier | コードフォーマット |
| TypeScript Vue Plugin (Volar) | TypeScript支援 |
| Tailwind CSS IntelliSense | ※使用しないが類似のCSS支援 |
| GitLens | Git履歴・差分表示 |
| Error Lens | エラー表示強化 |

---

## 3. プロジェクトのセットアップ

### 3.1 リポジトリのクローン

```bash
# GitHubからクローン
git clone https://github.com/YOUR_USERNAME/Oshiato.git
cd Oshiato
```

### 3.2 ディレクトリ構造の確認

```bash
ls -la
```

期待される構造:
```
Oshiato/
├── CLAUDE.md
├── README.md
├── docs/
├── apps/
│   └── web/
└── supabase/
```

### 3.3 Web版の依存関係インストール

```bash
cd apps/web
npm install
```

**トラブルシューティング:**

依存関係の競合が発生した場合:
```bash
npm install --legacy-peer-deps
```

node_modulesを削除して再インストール:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 4. 外部サービスのセットアップ

### 4.1 Supabase

#### 4.1.1 プロジェクト作成

1. https://supabase.com にログイン
2. 「New Project」をクリック
3. 以下を設定:
   - **Name**: `oshiato` または `oshiato-dev`
   - **Database Password**: 強力なパスワードを設定（メモしておく）
   - **Region**: `Northeast Asia (Tokyo)` を選択
4. 「Create new project」をクリック

#### 4.1.2 APIキーの取得

1. プロジェクトダッシュボード → 「Settings」 → 「API」
2. 以下をメモ:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6...`（秘密）

#### 4.1.3 データベースのセットアップ

1. 「SQL Editor」を開く
2. `supabase/migrations/00001_initial.sql` の内容をコピー＆実行
3. 「Run」をクリック

#### 4.1.4 Storage バケットのRLSポリシー設定

投稿画像のアップロードを許可するため、以下のSQLを「SQL Editor」で実行する。

```sql
-- post-images バケットへの匿名アップロードを許可
CREATE POLICY "Allow anon uploads"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'post-images');
```

> **補足**: このアプリはPhase 1ではSupabase Auth（公式認証）を使わず、
> device_idによる独自ユーザー管理を行っている。そのため `anon` ロールに
> アップロード権限を付与する必要がある。Phase 3で本認証に移行する際は
> このポリシーを `auth.uid()` ベースに変更する。

### 4.2 Mapbox

#### 4.2.1 アクセストークンの取得

1. https://www.mapbox.com にログイン
2. 「Account」 → 「Access tokens」
3. 「Create a token」をクリック
4. 以下を設定:
   - **Name**: `oshiato-dev`
   - **Scopes**: デフォルトのまま（public scopes）
5. トークンをコピー: `pk.xxxxx...`

### 4.3 Vercel（Phase 1では任意）

1. https://vercel.com にログイン
2. GitHubアカウントと連携
3. 「Add New」 → 「Project」
4. Oshiatoリポジトリをインポート
5. 環境変数を設定（後述）

---

## 5. 環境変数の設定

### 5.1 ローカル環境変数ファイルの作成

```bash
cd apps/web
cp .env.example .env.local
```

### 5.2 .env.local の編集

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxxxx...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5.3 環境変数の説明

| 変数名 | 説明 | 公開 |
|-------|------|:----:|
| `NEXT_PUBLIC_SUPABASE_URL` | SupabaseプロジェクトのURL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase匿名キー（公開可） | ✅ |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapboxアクセストークン | ✅ |
| `NEXT_PUBLIC_APP_URL` | アプリのURL | ✅ |

**注意:** `NEXT_PUBLIC_` プレフィックスがついた変数はクライアントサイドで使用可能（公開される）

---

## 6. 開発サーバーの起動

### 6.1 起動コマンド

```bash
cd apps/web
npm run dev
```

### 6.2 ブラウザで確認

http://localhost:3000 にアクセス

### 6.3 正常起動の確認

ターミナルに以下が表示されればOK:
```
▲ Next.js 15.x.x
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in xxxms
```

---

## 7. 動作確認

### 7.1 チェックリスト

- [ ] http://localhost:3000 が表示される
- [ ] コンソールにエラーがない
- [ ] 地図が表示される（Mapbox連携確認）
- [ ] Supabaseに接続できる（開発者ツールでネットワーク確認）

### 7.2 よくある問題

#### ポート3000が使用中

```bash
# 使用中のプロセスを確認
lsof -i :3000

# プロセスを終了
kill -9 <PID>
```

または別のポートで起動:
```bash
npm run dev -- -p 3001
```

#### 地図が表示されない

1. `.env.local` の `NEXT_PUBLIC_MAPBOX_TOKEN` を確認
2. Mapboxダッシュボードでトークンが有効か確認
3. ブラウザの開発者ツール → Consoleでエラーを確認

#### Supabaseに接続できない

1. `.env.local` の `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を確認
2. Supabaseダッシュボードでプロジェクトが「Active」か確認
3. RLS（Row Level Security）ポリシーを確認

---

## 8. Git初期設定

### 8.1 .gitignore の確認

以下が含まれていることを確認:
```gitignore
# 環境変数
.env.local
.env*.local

# 依存関係
node_modules/

# ビルド成果物
.next/
out/

# OS
.DS_Store
```

### 8.2 初回コミット（新規プロジェクトの場合）

```bash
git add .
git commit -m "feat: initial project setup"
git push origin main
```

### 8.3 developブランチの作成

```bash
git checkout -b develop
git push -u origin develop
```

---

## 9. Supabase CLI（オプション）

ローカルでSupabaseを動かす場合に使用。Phase 1では任意。

### 9.1 インストール

```bash
brew install supabase/tap/supabase
```

### 9.2 初期化

```bash
cd Oshiato
supabase init
```

### 9.3 ローカル起動

```bash
supabase start
```

### 9.4 マイグレーション適用

```bash
supabase db push
```

---

## 10. 便利なコマンド一覧

### 開発

```bash
# 開発サーバー起動
npm run dev

# 型チェック
npm run type-check

# リント
npm run lint

# リント（自動修正）
npm run lint:fix

# フォーマット
npm run format
```

### ビルド

```bash
# プロダクションビルド
npm run build

# ビルド結果をローカルで確認
npm run start
```

### Git

```bash
# 状態確認
git status

# 差分確認
git diff

# ブランチ一覧
git branch -a

# ブランチ切り替え
git checkout <branch-name>

# 新規ブランチ作成
git checkout -b feature/xxx
```

---

## 11. 次のステップ

セットアップが完了したら、以下のドキュメントを参照:

| ドキュメント | 内容 |
|-------------|------|
| CLAUDE.md | プロジェクトルール、開発プロセス |
| UI_Design_Guide.md | カラー、フォント、コンポーネント |
| Requirements_v5_1.md | 機能要件 |
| Technical_Architecture_v5_1.md | 技術構成 |

### Phase 1 Week 1 の作業

1. ✅ 環境構築（このドキュメント）
2. 🔲 Next.jsプロジェクト作成
3. 🔲 Supabase連携
4. 🔲 Mapbox地図表示
5. 🔲 基本レイアウト実装

---

## 12. トラブルシューティング

### npm install が失敗する

```bash
# キャッシュをクリア
npm cache clean --force

# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

### M1/M2 Macで問題が発生する

```bash
# Rosettaを使用してターミナルを開く
# または、arm64ネイティブのNode.jsを使用

# アーキテクチャ確認
node -p "process.arch"  # arm64 が期待値
```

### VS Codeで型エラーが表示される

1. TypeScriptサーバーを再起動: `Cmd + Shift + P` → 「TypeScript: Restart TS Server」
2. VS Codeを再起動
3. `node_modules/.cache` を削除

### Gitでコンフリクトが発生した

```bash
# 現在の変更を一時退避
git stash

# 最新を取得
git pull origin develop

# 退避した変更を戻す
git stash pop

# コンフリクトを解決してコミット
```

---

## 13. サポート

問題が解決しない場合:

1. エラーメッセージをコピー
2. Claudeに相談:「このエラーが出ました：[エラーメッセージ]」
3. 必要に応じて関連ファイルの内容も共有

---

**OSHIATO Setup Guide v1.0**
