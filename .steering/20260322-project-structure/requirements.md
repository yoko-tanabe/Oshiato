# requirements.md

## 作業日
2026-03-22

## 作業タイトル
プロジェクト基盤構造の整備

---

## 要求内容

プロジェクトフォルダ直下に、開発に必要な以下のディレクトリ・ファイルを追加する。

### 追加対象

| 追加物 | 説明 |
|--------|------|
| `.claude/commands/` | Claude Code プロジェクト専用スラッシュコマンド置き場 |
| `.claude/skills/` | Claude Code プロジェクト専用スキル置き場 |
| `.claude/agents/` | Claude Code プロジェクト専用エージェント置き場 |
| `package.json` | モノレポのワークスペースルート設定 |
| `tsconfig.json` | TypeScript の基底設定ファイル |

※ 当初 `src/` も候補にあがったが、不要と判断し対象外とした。

---

## ユーザーストーリー

- 開発者として、Claude Code のカスタムコマンド・スキル・エージェントをプロジェクト内で管理したい
- 開発者として、モノレポのルートから `npm run dev` などのコマンドを実行したい
- 開発者として、TypeScript の共通設定を一箇所で管理したい

---

## 受け入れ条件

- [ ] `.claude/commands/`, `.claude/skills/`, `.claude/agents/` が存在する
- [ ] ルートの `package.json` に `workspaces` 設定がある
- [ ] ルートの `tsconfig.json` が基底設定として機能する
- [ ] `docs/OSHIATO_Repository_Structure.md` に上記構造が反映されている

---

## 制約事項

- `src/` は追加しない
- `apps/web/` の既存構造は変更しない
