# design.md — Phase C: マイページ・投稿管理

## ファイル構成

### 新規作成ファイル

```
apps/web/
├── app/
│   ├── mypage/
│   │   ├── page.tsx                        ← C-1: マイページ（ページ本体）
│   │   └── profile/
│   │       └── page.tsx                    ← C-2: プロフィール編集ページ
│   └── spot/[id]/
│       └── page.tsx                        ← 既存（変更なし）
│
└── components/
    ├── mypage/
    │   ├── MyPageClient/
    │   │   ├── MyPageClient.tsx            ← C-1: ダッシュボード UI（Client Component）
    │   │   └── my-page-client.module.css
    │   └── ProfileEditForm/
    │       ├── ProfileEditForm.tsx         ← C-2: プロフィール編集フォーム（Client Component）
    │       └── profile-edit-form.module.css
    └── spot/
        └── SpotEditForm/
            ├── SpotEditForm.tsx            ← C-3: 投稿編集フォーム（Client Component）
            └── spot-edit-form.module.css
```

### 変更するファイル

| ファイル | 変更内容 |
|----------|---------|
| `components/ui/TabBar/TabBar.tsx` | 「マイページ」タブのhrefを `/oshi` → `/mypage` に変更 |
| `components/spot/SpotDetail/SpotDetail.tsx` | C-3/C-4: 自分の投稿に編集・削除ボタンを追加 |
| `lib/supabase/spots.ts` | C-3/C-4: `updatePost()` / `deletePost()` 関数を追加 |
| `lib/user/useCurrentUser.ts` | `display_name` も返すよう拡張 |

---

## 各ファイルの実装ロジック

### C-1: マイページ

#### `app/mypage/page.tsx`

```
- `'use client'` は書かない（Server Component）
- MyPageClient を import して返すだけ
```

#### `components/mypage/MyPageClient/MyPageClient.tsx`

```
'use client'

① useCurrentUser() で userId・display_name を取得
② useEffect で以下を並行取得（Promise.all）:
   - posts テーブル: user_id=userId の COUNT（投稿数）
   - visit_logs テーブル: user_id=userId の COUNT（訪問数）
   - posts + oshis JOIN: oshi_id ごとのグループ集計（推し別投稿数）
③ 表示:
   - 表示名 + 「プロフィールを編集」リンク → /mypage/profile
   - 統計カード（投稿数 / 訪問数）
   - 推し別集計リスト（推しアイコン・色付き + 投稿数）
   - 「推し管理」ボタン → /oshi（既存ページへ）
   - LogoutButton（既存コンポーネントを移設）
```

#### `useCurrentUser.ts` の拡張

現在は `userId` のみ返している。`display_name` も同時に取得して返すよう変更。

```ts
// 変更前
return { userId, isLoading }

// 変更後
return { userId, displayName, isLoading }
```

取得方法: `auth.getUser()` でユーザーを取得後、`users` テーブルから `display_name` を SELECT。

---

### C-2: プロフィール編集

#### `app/mypage/profile/page.tsx`

```
- Server Component、ProfileEditForm を import して返すだけ
```

#### `components/mypage/ProfileEditForm/ProfileEditForm.tsx`

```
'use client'

① useCurrentUser() で userId, displayName を取得
② フォーム項目:
   - 表示名（display_name）: 必須、1〜30文字
   - 自己紹介（bio）: 任意、100文字以内
③ 保存処理:
   supabase.from('users').update({ display_name, bio }).eq('id', userId)
④ 保存後: Toast で「保存しました」→ /mypage に戻る
```

> **注意**: `users` テーブルに `bio` カラムがない場合は今回追加しない（display_name のみ編集対象とする）。Supabase ダッシュボードで確認が必要。

---

### C-3: 投稿の編集機能

#### `components/spot/SpotDetail/SpotDetail.tsx` の変更

```
① 投稿取得時に post の user_id も取得する
② 各写真タイルに、post.user_id === userId の場合のみ「編集」ボタンを表示
③ 「編集」ボタン押下 → SpotEditForm をモーダルまたはインライン展開
```

#### `components/spot/SpotEditForm/SpotEditForm.tsx`

```
'use client'

props: { postId, initialTitle, initialDescription, initialCategory, onSave, onCancel }

① フォーム項目:
   - タイトル（title）
   - 説明（description）
   - カテゴリ（category）
② 保存処理:
   lib/supabase/spots.ts の updatePost() を呼ぶ
③ 保存後: onSave() → 親の再取得をトリガー
```

#### `lib/supabase/spots.ts` に追加

```ts
export async function updatePost(postId: string, data: {
  title?: string;
  description?: string;
  category?: string;
}): Promise<boolean>
```

---

### C-4: 投稿の削除機能

#### `components/spot/SpotDetail/SpotDetail.tsx` の変更（C-3 に追記）

```
① 写真タイルに「削除」ボタンも追加（自分の投稿のみ）
② 削除フロー:
   確認ダイアログ（window.confirm）
   → lib/supabase/spots.ts の deletePost() を呼ぶ
   → 成功後: 一覧から該当アイテムを除去（state 更新）
   → Toast「削除しました」
```

#### `lib/supabase/spots.ts` に追加

```ts
export async function deletePost(postId: string, imageUrls: string[]): Promise<boolean>

// 処理順:
// 1. Supabase Storage から画像ファイルを削除
// 2. post_images レコードを削除
// 3. posts レコードを削除（CASCADE で関連データも削除）
```

> Storage のファイルパスは `image_url` から抽出する。URL形式: `https://<project>.supabase.co/storage/v1/object/public/post-images/<path>`

---

## TabBar の変更

```tsx
// 変更前
{ href: '/oshi', icon: User, label: 'マイページ' }

// 変更後
{ href: '/mypage', icon: User, label: 'マイページ' }
```

---

## データ取得クエリ設計

### 推し別投稿数（マイページ統計）

```sql
SELECT
  oshis.id,
  oshis.name,
  user_oshis.theme_color,
  COUNT(posts.id) AS post_count
FROM posts
JOIN oshis ON posts.oshi_id = oshis.id
LEFT JOIN user_oshis ON user_oshis.oshi_id = oshis.id AND user_oshis.user_id = :userId
WHERE posts.user_id = :userId
  AND posts.status = 'active'
GROUP BY oshis.id, oshis.name, user_oshis.theme_color
ORDER BY post_count DESC
```

Supabase JS では `.select()` チェーンで表現するか、この程度の集計なら posts を取得してクライアント側で集計する（ユーザー1人分のデータ量は少ないため）。

---

## 進め方（1ファイルずつ）

1. `useCurrentUser.ts` を `displayName` 返却対応に変更
2. `TabBar.tsx` の href を `/mypage` に変更
3. `app/mypage/page.tsx` を作成
4. `MyPageClient.tsx` を作成
5. `my-page-client.module.css` を作成
6. `app/mypage/profile/page.tsx` を作成
7. `ProfileEditForm.tsx` を作成
8. `profile-edit-form.module.css` を作成
9. `lib/supabase/spots.ts` に `updatePost` / `deletePost` を追加
10. `SpotEditForm.tsx` を作成
11. `spot-edit-form.module.css` を作成
12. `SpotDetail.tsx` に編集・削除ボタンを追加
