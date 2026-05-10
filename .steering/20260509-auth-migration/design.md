# Phase B 設計: 認証基盤

---

## 1. 全体の認証フロー

```
未認証ユーザー
  │
  ├─ /（任意のページ）──→ middleware.ts が検知
  │                          │
  │                          ▼
  │                    /auth/login
  │                          │ メール/パスワードを入力
  │                          ▼
  │                    supabase.auth.signInWithPassword()
  │                          │ 成功
  │                          ▼
  │                    /auth/callback（セッション確定）
  │                          │
  │                    初回ログイン？
  │                    ├─ YES → /setup-profile（匿名ネーム設定）
  │                    └─ NO  → /（ホーム・マップ画面）
  │
認証済みユーザー
  └─ どのページでも通常アクセス可能
```

---

## 2. 新しいパッケージ（1つだけ追加）

```bash
npm install @supabase/ssr
```

### `@supabase/ssr` を使う理由

> **背景**: Next.js はページをサーバーとクライアントの両方でレンダリングする（SSR）。
> 通常の `@supabase/supabase-js` は Cookie を自動で扱えないため、サーバー側でログイン状態が取得できない。
> `@supabase/ssr` はサーバー/クライアントの両方で Cookie を正しく読み書きするためのヘルパーライブラリ。

| 役割 | 使うクリエーター |
|------|---------------|
| ブラウザ上のコンポーネント | `createBrowserClient` |
| サーバー（Server Component・middleware） | `createServerClient` + `cookies()` |

---

## 3. ファイル別の変更設計

### 3.1 `lib/supabase/client.ts`（変更）

```typescript
// 変更前
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient<Database>(url, key);

// 変更後
import { createBrowserClient } from '@supabase/ssr';
export function createClient() {
  return createBrowserClient<Database>(url, key);
}
// ※ シングルトンから関数呼び出しに変わる点に注意
```

> **なぜ関数にするか?**: `@supabase/ssr` の `createBrowserClient` はブラウザ環境でのみ呼び出せる。
> Next.js はサーバーでもファイルを評価するため、モジュール読み込み時点で実行されるシングルトンは壊れる。

---

### 3.2 `lib/supabase/server.ts`（変更）

```typescript
// 変更後
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
      },
    },
  });
}
```

---

### 3.3 `lib/user/useCurrentUser.ts`（全面改修）

```typescript
// 変更後（戻り値の型は既存コンポーネントと互換を保つ）
'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useCurrentUser(): { userId: string | null; isLoading: boolean } {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // 初回取得
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setIsLoading(false);
    });

    // セッション変化の監視（ログイン・ログアウト時に自動更新）
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { userId, isLoading };
}
```

> **互換性**: `userId` という名前・`isLoading` という名前を維持するため、
> 既存の `PostForm`, `CheckInButton`, `VisitList`, `TimelineGrid`, `SpotDetail` は
> **型の変更なしにそのまま動く**。

---

### 3.4 `lib/user/getOrCreateUser.ts`（廃止）

このファイルを削除する。以下 2 コンポーネントが直接 `getOrCreateUser` を呼んでいるため、`useCurrentUser` フックに切り替える：

| ファイル | 現在の呼び出し | 変更後 |
|----------|-------------|--------|
| `MapView.tsx` | 3 か所で `await getOrCreateUser()` | `useCurrentUser()` フックに統一 |
| `TrajectoryMap.tsx` | 1 か所で `await getOrCreateUser()` | 同上 |

---

### 3.5 `middleware.ts`（新規作成）

**場所**: `apps/web/middleware.ts`（`app/` の外、プロジェクトルート直下）

```typescript
// 役割: すべてのリクエストでセッションを更新し、未認証ユーザーをログイン画面へ転送する
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // 認証ページ・静的ファイルは除外
    '/((?!_next/static|_next/image|favicon.ico|auth).*)',
  ],
};
```

ミドルウェアのセッション更新ロジックは `lib/supabase/middleware.ts` に分離する（テストしやすいため）。

---

### 3.6 新規ページ・コンポーネント

#### `/auth/login/page.tsx`

```
app/auth/login/
  └── page.tsx        ← Server Component（タイトルのみ。処理は LoginForm に委譲）

components/auth/LoginForm/
  ├── LoginForm.tsx   ← 'use client'。フォーム・送信処理
  └── login-form.module.css
```

LoginForm の送信処理:
```typescript
const { error } = await supabase.auth.signInWithPassword({ email, password });
// 成功 → router.push('/') or router.push('/setup-profile')
// 失敗 → エラーメッセージ表示
```

#### `/auth/register/page.tsx`

```
app/auth/register/
  └── page.tsx

components/auth/RegisterForm/
  ├── RegisterForm.tsx
  └── register-form.module.css
```

RegisterForm の送信処理:
```typescript
const { error } = await supabase.auth.signUp({ email, password });
// 成功 → /setup-profile へリダイレクト
```

#### `/auth/callback/route.ts`（Route Handler）

```typescript
// OAuth コールバック・メール確認リンクを処理する骨格
// Phase B では Email/Password 使用時にも経由する
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(`${origin}${next}`);
}
```

#### `/setup-profile/page.tsx`

初回ログイン後にのみ表示。匿名ネームを設定し `users` テーブルの `display_name` を更新する。

---

## 4. DB 変更設計

### 4.1 既存データの破棄

Phase B 着手時に Supabase ダッシュボードで以下を実行：

```sql
-- 既存データをすべて削除（開発中のため破棄）
TRUNCATE TABLE checkins, post_images, spots, user_oshis, users CASCADE;
```

### 4.2 `users` テーブルの再設計

```sql
-- device_id カラムを削除し、id を auth.users への外部キーとして再定義
ALTER TABLE users DROP COLUMN IF EXISTS device_id;
ALTER TABLE users DROP COLUMN IF EXISTS id; -- 一旦削除して再追加

ALTER TABLE users
  ADD COLUMN id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;
```

> **`profile_completed`**: `/setup-profile` が完了したかを記録するフラグ。
> `middleware.ts` でこのフラグが `false` なら `/setup-profile` に転送する。

### 4.3 RLS ポリシー

各テーブルに以下のパターンでポリシーを設定する：

```sql
-- spots テーブルの例
ALTER TABLE spots ENABLE ROW LEVEL SECURITY;

-- 読み取りは全員可（Phase D で is_public フィルタを追加）
CREATE POLICY "spots_select" ON spots FOR SELECT USING (true);

-- 作成・更新・削除は本人のみ
CREATE POLICY "spots_insert" ON spots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "spots_update" ON spots FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "spots_delete" ON spots FOR DELETE
  USING (auth.uid() = user_id);
```

同様のポリシーを `checkins`, `post_images`, `user_oshis`, `users` にも設定する。

---

## 5. ファイル作成・変更の順序

依存関係を考慮した作業順：

```
STEP 1: パッケージ追加
  └── npm install @supabase/ssr

STEP 2: Supabase クライアント更新（基盤）
  ├── lib/supabase/client.ts        （変更）
  ├── lib/supabase/server.ts        （変更）
  └── lib/supabase/middleware.ts    （新規）

STEP 3: 認証フック統一（既存コンポーネントの呼び出しが変わる前に）
  ├── lib/user/useCurrentUser.ts    （全面改修）
  └── lib/user/getOrCreateUser.ts   （削除）

STEP 4: ミドルウェア
  └── middleware.ts                 （新規）

STEP 5: 認証ページ
  ├── app/auth/login/page.tsx
  ├── components/auth/LoginForm/LoginForm.tsx
  ├── app/auth/register/page.tsx
  ├── components/auth/RegisterForm/RegisterForm.tsx
  ├── app/auth/callback/route.ts
  └── app/setup-profile/page.tsx

STEP 6: getOrCreateUser を使っているコンポーネントの修正
  ├── components/map/MapView/MapView.tsx
  └── components/trajectory/TrajectoryMap/TrajectoryMap.tsx

STEP 7: DB 変更（Supabase ダッシュボード or マイグレーション）
  ├── 既存データ TRUNCATE
  ├── users テーブル再設計
  └── RLS ポリシー設定

STEP 8: ビルド確認
  └── npx next build
```
