# Phase B 設計判断記録

各判断について「何を選んだか」「なぜか」「捨てた選択肢」を記録する。

---

## ADR-001: `@supabase/ssr` を導入する

**決定**: `@supabase/supabase-js` の直接利用をやめ、`@supabase/ssr` 経由で クライアントを生成する。

**理由**:
- Next.js の Server Components / middleware ではリクエストごとの Cookie を読み書きする必要がある
- `@supabase/supabase-js` の `createClient` は Cookie を自動管理しないため、サーバー側でセッションが取得できない
- `@supabase/ssr` は Supabase が公式に提供する Next.js 対応ラッパーで、Cookie 管理を内包している

**捨てた選択肢**:
- `@supabase/auth-helpers-nextjs`（旧パッケージ）→ deprecated。`@supabase/ssr` が後継

---

## ADR-002: `createClient()` をシングルトンから関数呼び出しに変える

**決定**: `export const supabase = createClient(...)` から `export function createClient() { return createBrowserClient(...) }` に変更する。

**理由**:
- Next.js はサーバーサイドレンダリング時にも全モジュールを評価する
- `createBrowserClient` はブラウザ環境でのみ正常に動作する
- モジュール読み込み時点（= サーバー）で実行されるシングルトンはエラーになる恐れがある
- 関数呼び出しにすることで「コンポーネントが実行されるとき（ = ブラウザ）」にのみ生成される

**影響**:
- 既存コードで `import { supabase } from '@/lib/supabase/client'` と書いていた箇所は `const supabase = createClient()` に書き直す必要がある

---

## ADR-003: `useCurrentUser` の戻り値型を維持する

**決定**: 改修後の `useCurrentUser` でも `{ userId: string | null; isLoading: boolean }` という型・名前を変えない。

**理由**:
- 現時点で 6 コンポーネント（`PostForm`, `CheckInButton`, `VisitList`, `TimelineGrid`, `SpotDetail`, `AppShell`）が `useCurrentUser` を使っている
- 型を変えると全コンポーネントの修正が必要になり、デグレのリスクが高まる
- `userId` は `session.user.id` を返せば意味は同じなので、名前を変える必要がない

**将来の拡張**:
- Phase C 以降で `email` や `displayName` が必要になった場合は、後から戻り値に追加する（既存の `userId` は残す）

---

## ADR-004: 既存データを破棄する（移行しない）

**決定**: `device_id` ベースで作成した既存の投稿・推し・チェックインデータはすべて TRUNCATE し、移行スクリプトを書かない。

**理由**:
- 現在は開発中のダミーデータであり、本番ユーザーのデータではない
- `device_id`（ランダム UUID）と `auth.uid()` を紐付けるには「このデバイスがこのアカウント」という証明が不可能
- 移行スクリプトの作成・テストにかかるコストが、得られる価値（ダミーデータの保持）を上回る

**リスク**:
- 開発中に作成したテスト投稿が消える → 開発ツールとして割り切る

---

## ADR-005: ミドルウェアのセッション更新ロジックを `lib/supabase/middleware.ts` に分離する

**決定**: `middleware.ts` 本体は薄いラッパーとし、Cookie 更新ロジックを `lib/supabase/middleware.ts` に切り出す。

**理由**:
- `middleware.ts` は Next.js の特殊ファイルで、テストしにくい
- ロジックを `lib/` に置くことでユニットテストが書きやすくなる
- Supabase 公式ドキュメントが推奨するパターン

---

## ADR-006: `users` テーブルの `id` を `auth.users.id` と一致させる

**決定**: `users.id` を `auth.users(id)` への外部キー兼主キーとして定義する。

**理由**:
- Supabase Auth が管理する `auth.users.id` は UUID で一意性が保証されている
- アプリ側で別途 UUID を生成する必要がなくなる
- `auth.uid()` = `users.id` となるため、RLS ポリシーがシンプルに書ける（`WHERE user_id = auth.uid()`）

**テーブル名について**:
- Supabase のドキュメントでは `profiles` という名前を推奨しているが、すでに `users` で実装が進んでいるため名前は維持する

---

## ADR-007: `profile_completed` フラグでプロフィール設定を強制する

**決定**: `users.profile_completed` カラム（boolean）を追加し、`false` の場合は middleware で `/setup-profile` に転送する。

**理由**:
- 認証直後に匿名ネームを設定させないと、ユーザーが「名無し」のまま投稿できてしまう
- middleware でチェックすることで、どのページ経由でアクセスしても漏れなく設定画面に誘導できる

**フロー**:
```
ログイン成功
  → middleware が profile_completed をチェック
  → false なら /setup-profile へリダイレクト
  → 設定完了後 profile_completed = true に更新
  → / へリダイレクト
```

---

## ADR-008: メール確認を開発中はスキップする

**決定**: Supabase ダッシュボードで "Confirm email" を無効化したまま開発を進める。

**理由**:
- 開発中に毎回メール確認を行うと作業効率が大幅に落ちる
- Supabase 無料プランはメール送信に 1 時間あたり数通の制限があり、`over_email_send_rate_limit` エラーが発生する
- ローカル・ステージング環境では確認不要が標準的

**設定場所**: Authentication → Providers → Email → `Confirm email` を OFF

**本番リリース前にやること**:
- Supabase ダッシュボードで "Confirm email" を有効化する
- `/auth/register` に「確認メールを送りました」の案内 UI を追加する

---

## ADR-009: OAuth のコールバックルート骨格のみ用意する

**決定**: `/auth/callback/route.ts` に `code` を使ったセッション交換ロジックを実装するが、OAuth プロバイダーの設定は行わない。

**理由**:
- Email/Password でも `/auth/callback` を経由するため、ルート自体は Phase B で必要
- OAuth プロバイダー追加は iOS 版（Phase I）で行うため、ここでは接続しない
- 骨格を用意しておくことで、Phase I での追加がコールバック URL の変更なしに済む

---

## ADR-010: `posts` / `visit_logs` テーブルの RLS も必要（当初リストから漏れ）

**決定**: 当初の STEP 7 チェックリストに含まれていなかった `posts` テーブルと `visit_logs` テーブルにも RLS ポリシーを設定する。

**理由**:
- 投稿時に `new row violates row-level security policy` エラーが発生して発覚
- RLS が有効だがポリシーがないテーブルは、全アクセスが拒否される
- チェックリストに `post_images` は記載があったが `posts` 本体が漏れていた

**設定したポリシー**:
- `posts`: SELECT ALL / INSERT・UPDATE・DELETE は `auth.uid() = user_id`
- `visit_logs`: SELECT・INSERT は `auth.uid() = user_id`
- `post_images`: SELECT ALL / INSERT・DELETE は posts テーブルとの JOIN で `auth.uid() = posts.user_id` を確認

---

## ADR-011: Supabase Storage にも独立した RLS ポリシーが必要

**決定**: テーブルの RLS とは別に、`storage.objects` テーブルに対してもポリシーを設定する。

**理由**:
- テーブル RLS と Storage RLS は完全に独立している
- Storage ポリシーが未設定だと「new row violates row-level security policy」が出るが、エラー文がテーブル RLS と同一のため混乱しやすい
- `Allow anon uploads` という自動生成ポリシーが残っていると誰でもアップロード可能になるため削除が必要

**設定したポリシー（`post-images` バケット）**:
- SELECT: 誰でも閲覧可能（公開バケット）
- INSERT: `auth.uid()::text = storage.foldername(name)[1]`（自分のフォルダにのみアップロード）
- DELETE: 同上

**教訓**: RLS 設定作業ではテーブルと Storage の両方をチェックリストに含めること。

---

## ADR-012: HEIC 判定はファイルの拡張子だけでなくマジックバイトで行う

**決定**: `isHeic()` 関数を拡張子・MIME タイプによる判定（`isHeicByName`）とマジックバイトによる判定（`isHeicByMagicBytes`）に分離し、両方を使う。

**理由**:
- LINE 経由で共有された iPhone 写真は `.jpg` 拡張子だが中身が HEIC の場合がある
- 拡張子だけで判定すると JPEG として処理しようとして `createImageBitmap` が失敗する
- HEIC ファイルは先頭12バイトに `ftyp` ボックスとブランド名を持つため、読み取ることで確実に判定できる

**実装**:
```typescript
// offset 4-7: 'ftyp', offset 8-11: ブランド名（heic/heix/hevc/hevx/mif1/msf1）
const ftyp = String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]);
if (ftyp !== 'ftyp') return false;
```

**フォールバック順序**（processImage）:
1. `createImageBitmap(file)` で直接デコードを試みる
2. 失敗 → マジックバイトで HEIC か確認 → HEIC なら `convertHeicToImageBitmap` で変換
3. それ以外 → `<img>` 要素経由で読み込み（特殊な color profile の JPEG に対応）

---

## ADR-013: MapView のスポット色はユーザーID確定後に再描画する

**決定**: `map.on('load')` コールバックとは別に、`userId` と `isMapLoaded` を監視する `useEffect` を追加して、userId 確定後にスポットを再読み込みする。

**理由**:
- `map.on('load')` は Mapbox の非同期イベント。`useCurrentUser()` の `getUser()` も非同期
- マップのロードが先に完了した場合、`userIdRef.current` が null のまま `loadSpots` が呼ばれ `user_oshis` クエリが空ユーザーIDで実行される
- `oshiColorMap` が空になるため全スポットがデフォルトのグレーで描画される

**修正**:
```typescript
useEffect(() => {
  if (!isMapLoaded || !mapRef.current || !userId) return;
  loadSpots(mapRef.current, filterRange, selectedOshiIds, showToast);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [userId, isMapLoaded]);
```

**注意**: `filterRange` / `selectedOshiIds` の変更時は各ハンドラー（`handleFilterChange` / `handleOshiFilterChange`）が `loadSpots` を呼ぶため、この `useEffect` の deps からは意図的に除外する。
