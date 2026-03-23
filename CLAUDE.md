# CLAUDE.md

このファイルは、Claude Codeがこのプロジェクトを理解するための指示書です。

---

## プロジェクト概要

**OSHIATO（オシアト）** は、アイドルファン向けの「推し活」支援アプリ。

**コンセプト**: 「推しの足跡を現実世界で見つけ、記録し、辿る」

**主な機能**: 推しスポットの地図共有 / チェックイン・訪問記録 / 軌跡マップ / 写真EXIFから位置・日時を自動抽出

---

## 開発者について

| スキル | レベル |
|--------|--------|
| HTML/CSS/JavaScript/PHP | 基本理解あり |
| React/Next.js/Swift | **未経験**（Claudeと学習しながら開発） |
| Git | add, commit, push, pull が可能 |

**重要**: 新しい技術・概念の導入時、設計判断時、エラー発生時は**都度解説**すること。簡潔に、必要に応じて例え話を交えて。

---

## 技術スタック

### Web版（Phase 1）
| カテゴリ | 技術 |
|----------|------|
| フレームワーク | Next.js 15.x (App Router) |
| 言語 | TypeScript |
| スタイル | CSS Modules |
| 地図 | Mapbox GL JS |
| バックエンド | Supabase (PostgreSQL + PostGIS) |
| ホスティング | Vercel |

### iOS版（Phase 2）
| カテゴリ | 技術 |
|----------|------|
| 言語 | Swift 5.x / SwiftUI |
| 地図 | MapKit |
| バックエンド | Supabase Swift SDK |

---

## ドキュメント構造

### 永続的ドキュメント (`docs/`)
設計・方針が変わった時だけ更新。変更が必要なら Claudeが提案すること。

| ファイル | 内容 |
|----------|------|
| Setup_Guide.md | 環境構築・コマンド・トラブルシューティング |
| UI_Design_Guide.md | カラー・フォント・コンポーネント規約 |
| Repository_Structure.md | フォルダ構成・命名規則 |
| Requirements_v5_1.md | 機能要件・非機能要件 |
| Technical_Architecture_v5_1.md | 技術スタック・アーキテクチャ |
| Sitemap_v5_1.md | 画面構成・ナビゲーション |
| Database_Schema_v5_1.md | テーブル定義・ER図・マイグレーション |
| API_Specification_v5_1.md | API仕様・実装例 |

### 作業単位ドキュメント (`.steering/YYYYMMDD-英語kebab-case/`)
作業ごとに新規作成。タイトルは英語のkebab-case（例: `setup`, `map-display`, `spot-post`）。
4ファイル構成: `requirements.md` / `design.md` / `decision.md` / `tasklist.md`

---

## 開発プロセスのルール

### 基本原則
1. 機能追加・修正時は`docs/`への影響を確認する
2. 基本設計に影響する変更は`docs/`を同時に更新する
3. **ファイルは1つずつ作成し、開発者の確認・承認を得てから次に進む**

### ファイル作成ルール（必須）
- 1ファイル作成 → 確認を求める → 「OK」をもらってから次へ
- 複数ファイルを一度に作成しない

### コミットルール（必須）
- **Claudeはコミットを実行しない**
- コミットメッセージの**提案のみ**行う
- 開発者がレビュー・修正してからコミット・プッシュを実行する

### Claudeが確認を取る場面
- 設計判断（複数の実装方法がある場合）
- 破壊的変更（既存コードの大幅な修正）
- 永続ドキュメント更新（要件・設計の変更）
- 新技術導入（未使用ライブラリの追加）

---

## コーディング規約

### 命名規則

| 対象 | 規則 | 例 |
|------|------|----|
| ファイル名（TS/CSS） | kebab-case | `spot-card.tsx` |
| コンポーネント名 | PascalCase | `SpotCard` |
| 関数・変数 | camelCase | `getSpots()` |
| 型・インターフェース | PascalCase | `SpotData` |
| 定数 | UPPER_SNAKE_CASE | `MAX_IMAGES` |
| CSSクラス | camelCase | `.spotTitle` |
| Swiftファイル・型 | PascalCase | `SpotCard.swift` |
| ドキュメント | PascalCase + バージョン | `Requirements_v5_1.md` |
| ステアリングディレクトリ | YYYYMMDD-kebab-case | `20260322-map-display` |

### コード品質（実装後に必ず確認）
- TypeScriptの型エラーがない
- ESLintの警告がない
- コンソールエラーがない

---

## Git運用

### ブランチ戦略
| プレフィックス | 用途 |
|---------------|------|
| `feature/` | 新機能開発 |
| `fix/` | バグ修正 |
| `refactor/` | リファクタリング |
| `docs/` | ドキュメント更新 |

`develop` ブランチをベースに作業し、完了後 `develop` にマージ。

### コミットメッセージ規約
```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
style: コードスタイル修正
refactor: リファクタリング
```

---

## 注意事項

### Vercel依存を避ける（将来の移行のため）
- ~~Vercel KV~~ → Supabase使用
- ~~Vercel Blob~~ → Supabase Storage使用
- ~~Vercel Edge Config~~ → 環境変数使用
- ~~@vercel/analytics~~ → PostHog使用（Phase 3〜）
- ~~@vercel/og~~ → 標準Canvas API使用

### 画像処理の順序
1. EXIFから GPS座標・撮影日時を抽出
2. 抽出データをDBに保存
3. 画像からEXIFを削除
4. WebPに変換（最大1920px、品質80%）
5. Supabase Storageにアップロード

### プライバシー
- 公開画像からEXIF情報を完全削除
- 撮影位置（`taken_location`）は本人のみ閲覧可能
- 匿名ネームで投稿（本名非公開）

---

## Phase構成

| Phase | 内容 | 現在 |
|-------|------|:----:|
| Phase 1 | Web版プロトタイプ | ← |
| Phase 2 | iOS版プロトタイプ | |
| Phase 3 | MVP完成・リリース | |
| Phase 4 | スケール・拡張 | |

---

## Claudeへのお願い

1. **解説を丁寧に**: 新概念・技術は「なぜそうするか」を含めて説明する
2. **段階的に進める**: 小さなステップで進め、一度に多くの変更をしない
3. **エラー時は原因から**: 原因を説明してから修正する
4. **選択肢を提示**: 複数の方法がある場合はメリット・デメリットを示して選んでもらう
5. **確認を取る**: 重要な判断や大きな変更の前には必ず確認する
6. **リント・型チェックを実施**: コード変更後は必ずESLintとTypeScriptチェックを実施する
7. **セキュリティを意識**: XSS対策・入力バリデーション・SQLインジェクション対策を行う
