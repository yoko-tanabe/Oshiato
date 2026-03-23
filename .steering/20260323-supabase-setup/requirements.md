# requirements.md — 20260323-supabase-setup

## 要求内容

Next.jsアプリからSupabaseに接続できる状態を作る。
Phase 1-2で必要な9テーブルをSupabaseに作成し、アプリからデータの読み書きができる基盤を整える。

## ユーザーストーリー

- 開発者として、Next.jsからSupabaseに接続できる状態にしたい
- 開発者として、Phase 1-2の全テーブルがSupabaseに存在する状態にしたい
- 開発者として、TypeScriptの型でDBのカラム構造を安全に扱えるようにしたい

## 受け入れ条件

- [ ] `@supabase/supabase-js` がインストールされている
- [ ] `.env.local` に `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` が設定されている
- [ ] `lib/supabase/client.ts` でブラウザ用クライアントが作成できる
- [ ] `lib/supabase/server.ts` でサーバー用クライアントが作成できる
- [ ] `lib/supabase/database.types.ts` にPhase 1-2テーブルの型定義がある
- [ ] SupabaseダッシュボードにPhase 1-2の9テーブルが作成されている
- [ ] `npm run type-check` でエラーが出ない
- [ ] `.env.local` が `.gitignore` に含まれている（シークレット漏洩防止）
