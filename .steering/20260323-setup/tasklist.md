# tasklist.md — 20260323-setup

## タスクリスト

| # | タスク | 状態 |
|---|--------|------|
| 1 | apps/ ディレクトリ作成 | ✅ 完了 |
| 2 | create-next-app で apps/web/ を初期化 | ✅ 完了 |
| 3 | 不要ファイル削除（page.module.css） | ✅ 完了 |
| 4 | フォルダ構造作成（components/, lib/, hooks/, types/, 各ルート）| ✅ 完了 |
| 5 | layout.tsx を更新（フォント・メタデータ・lang） | ✅ 完了 |
| 6 | globals.css をデザイントークンに置換 | ✅ 完了 |
| 7 | page.tsx をプレースホルダーに置換 | ✅ 完了 |
| 8 | 各ルートのプレースホルダーページを作成 | ✅ 完了 |
| 9 | .env.local.example を作成 | ✅ 完了 |
| 10 | package.json に type-check / lint スクリプトを追加 | ✅ 完了 |
| 11 | TypeScript チェック（エラーなし） | ✅ 完了 |
| 12 | ESLint チェック（警告なし） | ✅ 完了 |

## 次のセッションに向けて

次は Step 2: UIデザイン基盤 または Step 3: Supabase DB構築 に進む。

**前提確認**:
- Mapbox アクセストークンはまだ取得していない（Step 4 の前に必要）
- Supabase URL と ANON KEY を `.env.local` に設定してから DB 接続を行う

## 作業ログ

- 2026-03-23: Step 1 完了。Next.js 16.2.1（15.x相当）で骨格作成完了。
