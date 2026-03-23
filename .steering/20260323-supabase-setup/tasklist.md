# tasklist.md — 20260323-supabase-setup

## 作業日
2026-03-23

## 作業タイトル
Supabase接続基盤の構築

---

## タスク一覧

| # | タスク | 担当 | 状態 |
|---|--------|------|------|
| 1 | `.steering/` の4ファイルを作成 | Claude | ✅ 完了 |
| 2 | `@supabase/supabase-js` をインストール | Claude | ✅ 完了 |
| 3 | `.env.local` に環境変数を設定 | **あなた** | ✅ 完了 |
| 4 | `lib/supabase/client.ts` を作成 | Claude | ✅ 完了 |
| 5 | `lib/supabase/server.ts` を作成 | Claude | ✅ 完了 |
| 6 | `lib/supabase/database.types.ts` を作成 | Claude | ✅ 完了 |
| 7 | SupabaseでPostGIS拡張を有効化 | **あなた** | ✅ 完了 |
| 8 | SupabaseでSQL Migrationを実行（テーブル作成） | **あなた** | ✅ 完了 |
| 9 | `npm run type-check` でエラーなしを確認 | Claude | ✅ 完了 |

---

## 完了条件

- [ ] アプリからSupabaseへの接続が確立されている
- [ ] Phase 1-2の9テーブルがSupabaseに存在する
- [ ] TypeScript型エラーがない
- [ ] `.env.local` がgitignoreされている
- [ ] 変更内容がコミットされている（開発者が実行）
