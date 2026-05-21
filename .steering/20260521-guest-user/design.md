# ゲストユーザー機能 設計書

## 全体方針

ログイン強制の核心は [middleware.ts](../../apps/web/lib/supabase/middleware.ts)。ここで「未ログインなら匿名サインインしてそのまま通す」ように変えることで、未ログインユーザーにも本物の `auth.uid()` を与え、既存機能（`user_id` 必須）を無改修で動かす。

撤去容易性のため、匿名サインインのロジックは新規ファイル `lib/supabase/guest-mode.ts` に集約し、既存ファイルの変更には `// GUEST-MODE` マーカーを付ける。

---

## ファイル一覧

```
apps/web/
├── lib/
│   ├── supabase/
│   │   ├── guest-mode.ts        ← 新規: 匿名サインイン + ゲスト行upsert（集約）
│   │   └── middleware.ts        ← 変更: signInAsGuest 呼び出し（GUEST-MODE）
│   └── user/
│       └── useCurrentUser.ts    ← 変更: isAnonymous 追加（GUEST-MODE）
└── components/
    └── mypage/
        └── MyPageClient/
            └── MyPageClient.tsx ← 変更: ゲスト時のCTA出し分け（GUEST-MODE）

supabase/
└── 20260521_guest_user_rls.sql ← 条件付き新規（RLSで弾かれた場合のみ）
```

---

## 各ファイルの設計

### `lib/supabase/guest-mode.ts`（新規・ロジック集約）

```typescript
// 匿名ユーザーを発行し、users テーブルにゲスト行を作る。
// 撤去時はこのファイルごと削除する。
export async function signInAsGuest(supabase): Promise<User | null> {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) return null;

  // display_name 表示・プロフィール強制回避のためゲスト行を作成（失敗は無視）
  await supabase.from('users').upsert({
    id: data.user.id,
    display_name: 'ゲスト',
    profile_completed: true,
  });

  return data.user;
}
```

- `users` の upsert パターンは `SetupProfileForm.tsx` を踏襲。
- エラーは握り潰し、ログインフロー自体は壊さない。

### `lib/supabase/middleware.ts`（変更・GUEST-MODE マーカー）

変更は3点。すべて `// GUEST-MODE` コメントで囲う。

1. **未ログイン分岐（現 L37-41）**: `/auth/login` への強制リダイレクトを、
   - `!user` のとき `signInAsGuest(supabase)` を実行
   - 成功 → Cookie を載せた `supabaseResponse` をそのまま return（再帰リダイレクト回避）
   - 失敗（匿名認証 OFF 等） → 従来どおり `/auth/login` へフォールバック（`/auth/*` は除外）
2. **`/auth/*` ガード（現 L44）**: `user && isAuthPage` → `user && !user.is_anonymous && isAuthPage`。匿名ユーザーはログイン/登録画面に行ける。
3. **profile_completed ガード（現 L52）**: 条件に `!user.is_anonymous` を追加。匿名ユーザーは `/setup-profile` 強制の対象外。

### `lib/user/useCurrentUser.ts`（変更・GUEST-MODE マーカー）

- `CurrentUser` 型に `isAnonymous: boolean` を追加。
- `getUser()` / `onAuthStateChange` から `user.is_anonymous` を反映。
- 既存呼び出し（AppShell / PostForm / MyPageClient）は分割代入なので非破壊。

### `components/mypage/MyPageClient/MyPageClient.tsx`（変更・GUEST-MODE マーカー）

- `isAnonymous === true` のとき:
  - `LogoutButton` を非表示（ゲストのログアウト＝データへアクセス不能になるため）
  - 「会員登録する」`<Link href="/auth/register">` ＋「ログイン」`<Link href="/auth/login">` を表示
- 必要なら CSS を追加。

### `supabase/20260521_guest_user_rls.sql`（条件付き）

- 動作確認で匿名ユーザーの INSERT/SELECT が弾かれた場合のみ作成。
- 対象候補: `users` / `check_ins` / `visit_logs` / `post_images`。
- ポリシーを `auth.uid()` ベース（匿名 authenticated でも通る形）に整える。

---

## 認証フロー（変更後）

```
未ログインでアクセス
  └─ middleware: getUser() → null
       └─ signInAsGuest()
            ├─ 成功 → 匿名セッションCookie発行 → users にゲスト行 → そのままページ表示
            └─ 失敗 → /auth/login へ（従来フォールバック）

ゲスト（匿名）でアクセス
  └─ getUser() → user(is_anonymous=true)
       ├─ /auth/* → アクセス許可（会員登録/ログイン可能）
       ├─ /setup-profile 強制 → 対象外
       └─ 通常ページ → 全機能利用可

正規ログイン済み（従来どおり）
  └─ /auth/* → / へリダイレクト、profile未設定 → /setup-profile
```

---

## 実装順序

```
1. lib/supabase/guest-mode.ts
2. lib/supabase/middleware.ts
3. lib/user/useCurrentUser.ts
4. components/mypage/MyPageClient/MyPageClient.tsx
5. lint / type-check / build → 手動動作確認
6. （必要時）supabase/20260521_guest_user_rls.sql
```
