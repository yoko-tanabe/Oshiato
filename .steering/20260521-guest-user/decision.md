# ゲストユーザー機能 設計判断記録

## D-001: ゲスト機能は「匿名認証（Anonymous Sign-in）」で実現する

**判断**: ログインを単に外すのではなく、Supabase の匿名認証で“名無しの一時アカウント”を自動発行する。

**理由**: 投稿・チェックイン・推し登録・マイページは全て `user_id`（=`auth.uid()`）が必須。匿名認証なら本物の `auth.uid()` が割り当たるため、これらの既存機能を**無改修**で動かせる。「ログインユーザーと同じ全機能を使える」という要件に最も合致する。

---

## D-002: 後でコードごと撤去できる設計にする（フィーチャーフラグは持たない）

**判断**: 環境変数フラグでの ON/OFF は採用せず、撤去容易性を最優先する。
- ゲスト専用ロジックは新規ファイル `lib/supabase/guest-mode.ts` に集約。
- 既存ファイルの変更箇所は全て `// GUEST-MODE` マーカーコメントを付ける。
- 永続ドキュメント（`docs/`）は変更しない。

**理由**: ユーザー指定で「後でこの機能はやめる前提」。フラグは恒久運用向けで、暫定機能には不要。`grep -rn "GUEST-MODE" apps/web` で全変更箇所を機械的に特定でき、撤去漏れを防げる。

---

## D-003: 匿名サインインは middleware で実行する

**判断**: クライアント側（useCurrentUser 等）ではなく middleware で `signInAnonymously()` を呼ぶ。

**理由**: ログイン強制の核心が middleware の「未ログイン → /auth/login リダイレクト」にある。ここで匿名ユーザーを作らないとリダイレクトを回避できない。クライアント側で作る案は、middleware が先にリダイレクトするため到達できず破綻する。`@supabase/ssr` の `setAll` が response への Cookie 反映に対応済みで技術的にも成立する。重複サインインは「`getUser()` が null のときだけ呼ぶ」ことで防ぐ（成功後はセッション Cookie が残る）。

---

## D-004: 匿名ユーザーにも users 行（display_name='ゲスト'）を作る

**判断**: 匿名サインイン成功時に `users` テーブルへ `upsert({ id, display_name:'ゲスト', profile_completed:true })` する。

**理由**: マイページ等が `users.display_name` を参照する。また `profile_completed=true` にすることで `/setup-profile` 強制を自然に回避できる（加えて middleware 側でも `!user.is_anonymous` で二重に除外）。upsert 失敗はログインフローを壊さないよう握り潰す。

---

## D-005: 匿名ユーザーは /auth/* にアクセスできるようにする

**判断**: middleware の「認証済みが /auth/* に来たら / へ」ガードに `!user.is_anonymous` を加え、匿名ユーザーはログイン/登録画面に行けるようにする。

**理由**: 「既存のログイン・会員登録を残す」「後から会員登録できる」要件のため。匿名でも `user` は存在するので、条件を加えないとログイン画面に入れなくなる。正規ログイン済みユーザーは従来どおり `/` に弾く。

---

## 撤去手順

1. `apps/web/lib/supabase/guest-mode.ts` を削除。
2. `grep -rn "GUEST-MODE" apps/web` で全変更箇所を特定し、元に戻す:
   - `middleware.ts`: 匿名サインインブロックを削除し、元の `if (!user && !isAuthPage)` リダイレクトに戻す。`&& !user.is_anonymous` を2箇所削除。
   - `useCurrentUser.ts`: `isAnonymous` 関連を削除。
   - `MyPageClient.tsx`: ゲスト CTA を削除し `LogoutButton` を常時表示に戻す。
3. `supabase/20260521_guest_user_rls.sql`（作成した場合）の扱いを判断。
4. `.steering/20260521-guest-user/` を削除（任意）。
5. Supabase ダッシュボードで Anonymous sign-ins を OFF に戻す。
- もしくはゲスト機能のコミット群を `git revert` する。
