# decision.md — 20260323-supabase-setup

## 決定事項

### 1. クライアント/サーバー共用ではなく、2ファイルに分ける

**理由:**
- Next.js App Routerでは「サーバー側」と「クライアント側」でSupabaseの初期化方法が異なる
- サーバーでは `createClient()` を毎リクエストごとに呼ぶ必要がある
- ブラウザでは1インスタンスをシングルトンとして使い回す

---

### 2. `@supabase/ssr` は使わない（Phase 1-2）

**理由:**
- Phase 1-2は認証なし（端末識別のみ）
- `@supabase/ssr` は主にCookieベースのセッション管理（認証）に必要
- Phase 3でSupabase Auth導入時に追加する

**代わりに:**
- `@supabase/supabase-js` のみ使用

---

### 3. 型定義は手動で書く（Phase 1-2）

**理由:**
- Supabase CLIによる自動生成はCLIインストールが必要で手順が複雑
- Phase 1-2のテーブル数は9つと少なく、手動管理が現実的
- Phase 3以降でSupabase CLIを導入し自動生成に移行する

---

### 4. PostGIS拡張を有効化する

**理由:**
- `spots.location` カラムに `geometry(Point, 4326)` 型を使用
- 将来的に「半径Nkm以内のスポットを検索」するために必要
- Supabase は PostGIS をサポートしており、拡張の有効化のみで使用可能
