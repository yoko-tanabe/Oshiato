# design.md

## 作業日
2026-03-22

## 作業タイトル
プロジェクト基盤構造の整備

---

## 実装アプローチ

### .claude/ ディレクトリ

Claude Code のプロジェクトレベル設定を格納するディレクトリ。
Git で追跡できるよう、各サブディレクトリに `.gitkeep` を配置する。

```
.claude/
├── commands/   → /コマンド名 で呼び出すプロンプト（.md ファイル）
├── skills/     → 繰り返し作業のスキル定義（.md ファイル）
└── agents/     → 専門タスク用エージェント定義（.md ファイル）
```

### package.json（ルート）

npm workspaces を使ったモノレポ構成。
`apps/web` を workspace として登録し、ルートから各種コマンドを実行できるようにする。

```json
{
  "workspaces": ["apps/web"],
  "scripts": {
    "dev": "npm run dev --workspace=apps/web"
  }
}
```

### tsconfig.json（ルート）

`apps/web/tsconfig.json` が継承できる基底設定。
`strict: true` を有効にして型安全性を確保する。

---

## 変更するファイル

| ファイル | 変更種別 | 内容 |
|----------|----------|------|
| `docs/OSHIATO_Repository_Structure.md` | 更新 | 新ディレクトリ・ファイルの追記、セクション番号整合 |

## 新規作成するファイル

| ファイル | 内容 |
|----------|------|
| `.claude/commands/.gitkeep` | ディレクトリ保持用 |
| `.claude/skills/.gitkeep` | ディレクトリ保持用 |
| `.claude/agents/.gitkeep` | ディレクトリ保持用 |
| `package.json` | モノレポ設定 |
| `tsconfig.json` | TypeScript 基底設定 |

---

## 影響範囲

- `apps/web/` の既存コードへの影響：**なし**
- Supabase 設定への影響：**なし**
- CI/CD への影響：**なし**（Vercel は `apps/web` を直接参照するため）
