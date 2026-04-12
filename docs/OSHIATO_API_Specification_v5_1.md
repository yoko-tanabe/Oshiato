# OSHIATO API定義書

**地図であなたのOSHIの足跡を残す**

---

| 項目 | 内容 |
|------|------|
| バージョン | v5.1 |
| 作成日 | 2026年3月 |
| 対応要件定義書 | v5.1 |

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|------------|------|----------|
| v5.1 | 2026/03 | 初版作成 |

---

## 1. API概要

### 1.1 基本仕様

| 項目 | 仕様 |
|------|------|
| **プロトコル** | HTTPS |
| **ベースURL** | `https://<project>.supabase.co` |
| **認証** | Supabase Auth (JWT) |
| **データ形式** | JSON |
| **文字コード** | UTF-8 |

### 1.2 Supabase クライアント

OSHIATOはSupabaseをバックエンドとして使用するため、REST APIではなくSupabaseクライアントSDKを使用します。

```typescript
// Web版 (JavaScript/TypeScript)
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

```swift
// iOS版 (Swift)
import Supabase

let supabase = SupabaseClient(
  supabaseURL: URL(string: "https://<project>.supabase.co")!,
  supabaseKey: "<anon-key>"
)
```

### 1.3 Phase別API

| Phase | 認証 | 主要API |
|-------|------|---------|
| **Phase 1-2** | 端末識別（簡易） | スポット、投稿、推し管理、チェックイン、訪問ログ |
| **Phase 3** | Supabase Auth | 上記 + 返信、DM、通知、カード |
| **Phase 4** | 同上 | 上記 + ジオフェンシング、物理カード |

---

## 2. 認証API

### 2.1 Phase 1-2: 端末識別（簡易認証）

Phase 1-2では本格的な認証は行わず、端末IDでユーザーを識別します。

#### ユーザー登録/取得

```typescript
// 端末IDでユーザーを取得または作成
async function getOrCreateUser(deviceId: string) {
  // 既存ユーザーを検索
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('device_id', deviceId)
    .single()

  if (existingUser) {
    return existingUser
  }

  // 新規作成
  const { data: newUser, error } = await supabase
    .from('users')
    .insert({ device_id: deviceId })
    .select()
    .single()

  return newUser
}
```

### 2.2 Phase 3: Supabase Auth

#### OAuth認証（Google/Apple/X）

```typescript
// Googleログイン
async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
}

// Appleログイン
async function signInWithApple() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
}

// ログアウト
async function signOut() {
  const { error } = await supabase.auth.signOut()
}

// 現在のユーザー取得
async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
```

---

## 3. スポットAPI

### 3.1 スポット一覧取得

指定範囲内のスポットを取得します。

**リクエスト:**

```typescript
interface GetSpotsParams {
  minLat: number    // 最小緯度
  maxLat: number    // 最大緯度
  minLng: number    // 最小経度
  maxLng: number    // 最大経度
  oshiId?: string   // 推しでフィルター（オプション）
}
```

**実装:**

```typescript
async function getSpots(params: GetSpotsParams) {
  let query = supabase
    .from('v_active_posts')
    .select(`
      id,
      spot_id,
      latitude,
      longitude,
      oshi_id,
      oshi_name,
      category,
      start_date,
      end_date,
      area_name
    `)
    .gte('latitude', params.minLat)
    .lte('latitude', params.maxLat)
    .gte('longitude', params.minLng)
    .lte('longitude', params.maxLng)

  if (params.oshiId) {
    query = query.eq('oshi_id', params.oshiId)
  }

  const { data, error } = await query

  return { data, error }
}
```

**レスポンス:**

```json
{
  "data": [
    {
      "id": "uuid",
      "spot_id": "uuid",
      "latitude": 35.6812,
      "longitude": 139.7671,
      "oshi_id": "uuid",
      "oshi_name": "推しA",
      "category": "ooh",
      "start_date": "2026-03-01",
      "end_date": "2026-03-31",
      "area_name": "渋谷"
    }
  ],
  "error": null
}
```

### 3.2 スポット詳細取得

**実装:**

```typescript
async function getSpotDetail(spotId: string) {
  const { data, error } = await supabase
    .from('spots')
    .select(`
      id,
      address,
      area:areas(id, name, prefecture),
      posts(
        id,
        oshi:oshis(id, name, group_name),
        category,
        comment,
        start_date,
        end_date,
        taken_at,
        created_at,
        post_images(id, image_url, display_order)
      )
    `)
    .eq('id', spotId)
    .single()

  return { data, error }
}
```

### 3.3 近接スポット検索

指定位置から指定距離内のスポットを検索します。

**実装:**

```typescript
async function findNearbySpots(lat: number, lng: number, radiusMeters: number = 500) {
  const { data, error } = await supabase
    .rpc('find_nearby_spots', {
      user_lat: lat,
      user_lng: lng,
      radius_meters: radiusMeters
    })

  return { data, error }
}
```

**レスポンス:**

```json
{
  "data": [
    {
      "spot_id": "uuid",
      "distance_meters": 150.5,
      "post_id": "uuid",
      "oshi_name": "推しA",
      "category": "ooh"
    }
  ],
  "error": null
}
```

---

## 4. 投稿API

### 4.1 投稿作成

**リクエスト:**

```typescript
interface CreatePostParams {
  userId: string
  oshiId: string
  category: 'ooh' | 'popup' | 'event' | 'other'
  comment?: string
  startDate: string      // YYYY-MM-DD
  endDate: string        // YYYY-MM-DD
  takenAt?: string       // ISO8601（EXIFから）
  takenLocation?: {      // EXIFから
    latitude: number
    longitude: number
  }
  images: File[]         // 画像ファイル（1〜4枚）
  spotId?: string        // 既存スポットの場合
  newSpotLocation?: {    // 新規スポットの場合
    latitude: number
    longitude: number
    address?: string
  }
}
```

**実装:**

```typescript
async function createPost(params: CreatePostParams) {
  // 1. スポットを作成または取得
  let spotId = params.spotId
  
  if (!spotId && params.newSpotLocation) {
    const { data: spot, error: spotError } = await supabase
      .from('spots')
      .insert({
        location: `POINT(${params.newSpotLocation.longitude} ${params.newSpotLocation.latitude})`,
        address: params.newSpotLocation.address
      })
      .select()
      .single()

    if (spotError) throw spotError
    spotId = spot.id
  }

  // 2. 投稿を作成
  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      spot_id: spotId,
      user_id: params.userId,
      oshi_id: params.oshiId,
      category: params.category,
      comment: params.comment,
      start_date: params.startDate,
      end_date: params.endDate,
      taken_at: params.takenAt,
      taken_location: params.takenLocation 
        ? `POINT(${params.takenLocation.longitude} ${params.takenLocation.latitude})`
        : null
    })
    .select()
    .single()

  if (postError) throw postError

  // 3. 画像をアップロード
  const imageUrls: string[] = []
  for (let i = 0; i < params.images.length; i++) {
    const file = params.images[i]
    const filePath = `posts/${post.id}/${i + 1}.webp`
    
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)

    imageUrls.push(publicUrl)
  }

  // 4. 画像レコードを作成
  const { error: imageError } = await supabase
    .from('post_images')
    .insert(
      imageUrls.map((url, index) => ({
        post_id: post.id,
        image_url: url,
        display_order: index + 1
      }))
    )

  if (imageError) throw imageError

  // 5. 訪問ログを作成（EXIFがある場合）
  if (params.takenAt && params.takenLocation) {
    await supabase
      .from('visit_logs')
      .insert({
        user_id: params.userId,
        spot_id: spotId,
        oshi_id: params.oshiId,
        location: `POINT(${params.takenLocation.longitude} ${params.takenLocation.latitude})`,
        visited_at: params.takenAt,
        source: 'exif'
      })
  }

  return { data: post, error: null }
}
```

### 4.2 投稿一覧取得（タイムライン）

**実装:**

```typescript
interface GetPostsParams {
  limit?: number
  offset?: number
  oshiId?: string
}

async function getPosts(params: GetPostsParams = {}) {
  const limit = params.limit || 20
  const offset = params.offset || 0

  let query = supabase
    .from('posts')
    .select(`
      id,
      category,
      comment,
      start_date,
      end_date,
      taken_at,
      reply_count,
      created_at,
      user:users(id, display_name),
      oshi:oshis(id, name, group_name),
      spot:spots(id, address, area:areas(name)),
      post_images(id, image_url, display_order)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (params.oshiId) {
    query = query.eq('oshi_id', params.oshiId)
  }

  const { data, error } = await query

  return { data, error }
}
```

### 4.3 投稿詳細取得

**実装:**

```typescript
async function getPostDetail(postId: string) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      category,
      comment,
      start_date,
      end_date,
      taken_at,
      reply_count,
      created_at,
      user:users(id, display_name),
      oshi:oshis(id, name, group_name),
      spot:spots(
        id, 
        address,
        area:areas(name)
      ),
      post_images(id, image_url, display_order)
    `)
    .eq('id', postId)
    .single()

  return { data, error }
}
```

---

## 5. 推し管理API

### 5.1 推しマスタ検索（サジェスト）

AddOshiFormのオートコンプリートUIで使用。2文字以上の入力で検索を開始し、300msのデバウンスで呼び出す。

**実装:**

```typescript
async function searchOshis(keyword: string) {
  const { data, error } = await supabase
    .from('oshis')
    .select('id, name, group_name')
    .or(`name.ilike.%${keyword}%,group_name.ilike.%${keyword}%`)
    .limit(10)

  return { data, error }
}
```

**サジェスト表示フォーマット:**
- メンバー: `「譜久村聖（モーニング娘。）」`
- 箱推し（group_nameがNULL）: `「モーニング娘。（グループ）」`
- 最下部: `「{入力テキスト}を新しく登録する」`（新規登録オプション）

### 5.2 推しマスタ追加（重複チェック付き）

新規登録時は、まず同名＋同グループの既存レコードを検索し、存在すればそのIDを返す。存在しなければ新規作成する。`(name, COALESCE(group_name, ''))` のユニークインデックスでDB側でも重複を防止。

**実装:**

```typescript
interface CreateOshiParams {
  name: string
  groupName?: string | null
  category: 'idol' | 'kpop' | 'anime' | 'voice_actor' | 'other'
}

async function findOrCreateOshi(params: CreateOshiParams): Promise<string> {
  // まず同名＋同グループの既存レコードを検索
  let query = supabase
    .from('oshis')
    .select('id')
    .eq('name', params.name)

  if (params.groupName) {
    query = query.eq('group_name', params.groupName)
  } else {
    query = query.is('group_name', null)
  }

  const { data: existing } = await query.maybeSingle()

  if (existing) {
    return existing.id  // 既存のIDを返す
  }

  // 存在しなければ新規作成
  const { data, error } = await supabase
    .from('oshis')
    .insert({
      name: params.name,
      group_name: params.groupName ?? null,
      category: params.category
    })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}
```

### 5.3 ユーザーの推し一覧取得

**実装:**

```typescript
async function getUserOshis(userId: string) {
  const { data, error } = await supabase
    .from('user_oshis')
    .select(`
      id,
      theme_color,
      is_primary,
      display_order,
      oshi:oshis(id, name, group_name, category)
    `)
    .eq('user_id', userId)
    .order('display_order', { ascending: true })

  return { data, error }
}
```

### 5.4 推しを追加

**実装:**

```typescript
interface AddUserOshiParams {
  userId: string
  oshiId: string
  themeColor?: string
  isPrimary?: boolean
}

async function addUserOshi(params: AddUserOshiParams) {
  // 既存の推し数を取得して表示順を決定
  const { count } = await supabase
    .from('user_oshis')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', params.userId)

  const { data, error } = await supabase
    .from('user_oshis')
    .insert({
      user_id: params.userId,
      oshi_id: params.oshiId,
      theme_color: params.themeColor || '#FF6B9D',
      is_primary: params.isPrimary || false,
      display_order: (count || 0) + 1
    })
    .select(`
      id,
      theme_color,
      is_primary,
      oshi:oshis(id, name, group_name)
    `)
    .single()

  return { data, error }
}
```

### 5.5 推しのテーマカラー更新

**実装:**

```typescript
async function updateUserOshiColor(userOshiId: string, themeColor: string) {
  const { data, error } = await supabase
    .from('user_oshis')
    .update({ theme_color: themeColor })
    .eq('id', userOshiId)
    .select()
    .single()

  return { data, error }
}
```

### 5.6 推しを削除

**実装:**

```typescript
async function removeUserOshi(userOshiId: string) {
  const { error } = await supabase
    .from('user_oshis')
    .delete()
    .eq('id', userOshiId)

  return { error }
}
```

---

## 6. チェックインAPI

### 6.1 チェックイン実行

**実装:**

```typescript
interface CheckInParams {
  userId: string
  spotId: string
  oshiId: string
  location: {
    latitude: number
    longitude: number
  }
}

async function checkIn(params: CheckInParams) {
  // チェックインを記録
  const { data: checkIn, error: checkInError } = await supabase
    .from('check_ins')
    .insert({
      user_id: params.userId,
      spot_id: params.spotId,
      checked_at: new Date().toISOString()
    })
    .select()
    .single()

  if (checkInError) {
    // 重複チェックイン（同日同スポット）の場合
    if (checkInError.code === '23505') {
      return { data: null, error: { message: '本日すでにチェックイン済みです' } }
    }
    throw checkInError
  }

  // 訪問ログを記録
  const { error: visitError } = await supabase
    .from('visit_logs')
    .insert({
      user_id: params.userId,
      spot_id: params.spotId,
      oshi_id: params.oshiId,
      location: `POINT(${params.location.longitude} ${params.location.latitude})`,
      visited_at: new Date().toISOString(),
      source: 'checkin'
    })

  if (visitError) throw visitError

  // ユーザーの訪問数を更新
  await supabase.rpc('increment_user_visits', { user_id: params.userId })

  return { data: checkIn, error: null }
}
```

### 6.2 チェックイン履歴取得

**実装:**

```typescript
async function getCheckInHistory(userId: string, limit: number = 50) {
  const { data, error } = await supabase
    .from('check_ins')
    .select(`
      id,
      checked_at,
      spot:spots(
        id,
        address,
        area:areas(name)
      )
    `)
    .eq('user_id', userId)
    .order('checked_at', { ascending: false })
    .limit(limit)

  return { data, error }
}
```

---

## 7. 訪問ログ・軌跡API

### 7.1 訪問ログ一覧取得

**実装:**

```typescript
interface GetVisitLogsParams {
  userId: string
  oshiId?: string
  startDate?: string
  endDate?: string
  limit?: number
}

async function getVisitLogs(params: GetVisitLogsParams) {
  let query = supabase
    .from('visit_logs')
    .select(`
      id,
      visited_at,
      source,
      spot:spots(id, address, area:areas(name)),
      oshi:oshis(id, name, group_name)
    `)
    .eq('user_id', params.userId)
    .order('visited_at', { ascending: false })

  if (params.oshiId) {
    query = query.eq('oshi_id', params.oshiId)
  }

  if (params.startDate) {
    query = query.gte('visited_at', params.startDate)
  }

  if (params.endDate) {
    query = query.lte('visited_at', params.endDate)
  }

  if (params.limit) {
    query = query.limit(params.limit)
  }

  const { data, error } = await query

  return { data, error }
}
```

### 7.2 軌跡マップデータ取得

軌跡マップ（足跡・糸）を描画するためのデータを取得します。

**実装:**

```typescript
interface GetTrajectoryParams {
  userId: string
  oshiId?: string
}

async function getTrajectory(params: GetTrajectoryParams) {
  let query = supabase
    .from('v_user_trajectory')
    .select(`
      visit_log_id,
      longitude,
      latitude,
      visited_at,
      oshi_id,
      theme_color,
      oshi_name
    `)
    .eq('user_id', params.userId)
    .order('visited_at', { ascending: true })

  if (params.oshiId) {
    query = query.eq('oshi_id', params.oshiId)
  }

  const { data, error } = await query

  return { data, error }
}
```

**レスポンス:**

```json
{
  "data": [
    {
      "visit_log_id": "uuid",
      "longitude": 139.7671,
      "latitude": 35.6812,
      "visited_at": "2026-03-01T14:30:00Z",
      "oshi_id": "uuid",
      "theme_color": "#FF6B9D",
      "oshi_name": "推しA"
    },
    {
      "visit_log_id": "uuid",
      "longitude": 139.7005,
      "latitude": 35.6895,
      "visited_at": "2026-03-02T10:00:00Z",
      "oshi_id": "uuid",
      "theme_color": "#FF6B9D",
      "oshi_name": "推しA"
    }
  ],
  "error": null
}
```

### 7.3 訪問統計取得

**実装:**

```typescript
async function getVisitStats(userId: string) {
  // 総訪問数
  const { count: totalVisits } = await supabase
    .from('visit_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // 推し別訪問数
  const { data: visitsByOshi } = await supabase
    .from('visit_logs')
    .select(`
      oshi_id,
      oshi:oshis(name)
    `)
    .eq('user_id', userId)

  // 集計
  const oshiCounts: Record<string, { name: string; count: number }> = {}
  visitsByOshi?.forEach(v => {
    const key = v.oshi_id
    if (!oshiCounts[key]) {
      oshiCounts[key] = { name: v.oshi.name, count: 0 }
    }
    oshiCounts[key].count++
  })

  // エリア別訪問数
  const { data: visitsByArea } = await supabase
    .from('visit_logs')
    .select(`
      spot:spots(area:areas(name))
    `)
    .eq('user_id', userId)

  const areaCounts: Record<string, number> = {}
  visitsByArea?.forEach(v => {
    const areaName = v.spot?.area?.name || '不明'
    areaCounts[areaName] = (areaCounts[areaName] || 0) + 1
  })

  return {
    totalVisits,
    visitsByOshi: Object.values(oshiCounts),
    visitsByArea: Object.entries(areaCounts).map(([name, count]) => ({ name, count }))
  }
}
```

---

## 8. 返信API（Phase 3）

### 8.1 返信一覧取得

**実装:**

```typescript
async function getReplies(postId: string) {
  const { data, error } = await supabase
    .from('replies')
    .select(`
      id,
      content,
      created_at,
      user:users(id, anonymous_name, avatar_url)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  return { data, error }
}
```

### 8.2 返信投稿

**実装:**

```typescript
async function createReply(postId: string, userId: string, content: string) {
  const { data, error } = await supabase
    .from('replies')
    .insert({
      post_id: postId,
      user_id: userId,
      content: content
    })
    .select()
    .single()

  if (!error) {
    // 投稿の返信数をインクリメント
    await supabase.rpc('increment_reply_count', { post_id: postId })
  }

  return { data, error }
}
```

---

## 9. DM API（Phase 3）

### 9.1 DMリクエスト送信

**実装:**

```typescript
async function sendDmRequest(fromUserId: string, toUserId: string, message?: string) {
  const { data, error } = await supabase
    .from('dm_requests')
    .insert({
      from_user_id: fromUserId,
      to_user_id: toUserId,
      message: message,
      status: 'pending'
    })
    .select()
    .single()

  return { data, error }
}
```

### 9.2 DMリクエスト承認/拒否

**実装:**

```typescript
async function respondToDmRequest(requestId: string, accept: boolean) {
  const { data: request, error: fetchError } = await supabase
    .from('dm_requests')
    .select('from_user_id, to_user_id')
    .eq('id', requestId)
    .single()

  if (fetchError) throw fetchError

  // リクエストのステータスを更新
  const { error: updateError } = await supabase
    .from('dm_requests')
    .update({
      status: accept ? 'accepted' : 'rejected',
      responded_at: new Date().toISOString()
    })
    .eq('id', requestId)

  if (updateError) throw updateError

  // 承認された場合、DMルームを作成
  if (accept) {
    const { data: room, error: roomError } = await supabase
      .from('dm_rooms')
      .insert({
        user1_id: request.from_user_id,
        user2_id: request.to_user_id
      })
      .select()
      .single()

    return { data: room, error: roomError }
  }

  return { data: null, error: null }
}
```

### 9.3 DMルーム一覧取得

**実装:**

```typescript
async function getDmRooms(userId: string) {
  const { data, error } = await supabase
    .from('dm_rooms')
    .select(`
      id,
      last_message_at,
      user1:users!dm_rooms_user1_id_fkey(id, anonymous_name, avatar_url),
      user2:users!dm_rooms_user2_id_fkey(id, anonymous_name, avatar_url)
    `)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order('last_message_at', { ascending: false, nullsFirst: false })

  return { data, error }
}
```

### 9.4 DMメッセージ取得

**実装:**

```typescript
async function getDmMessages(roomId: string, limit: number = 50) {
  const { data, error } = await supabase
    .from('dm_messages')
    .select(`
      id,
      content,
      is_read,
      created_at,
      sender:users(id, anonymous_name, avatar_url)
    `)
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data, error }
}
```

### 9.5 DMメッセージ送信

**実装:**

```typescript
async function sendDmMessage(roomId: string, senderId: string, content: string) {
  const { data, error } = await supabase
    .from('dm_messages')
    .insert({
      room_id: roomId,
      sender_id: senderId,
      content: content
    })
    .select()
    .single()

  if (!error) {
    // ルームの最終メッセージ日時を更新
    await supabase
      .from('dm_rooms')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', roomId)
  }

  return { data, error }
}
```

### 9.6 DMリアルタイム購読

**実装:**

```typescript
function subscribeToDmMessages(roomId: string, onMessage: (message: any) => void) {
  const subscription = supabase
    .channel(`dm:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'dm_messages',
        filter: `room_id=eq.${roomId}`
      },
      (payload) => {
        onMessage(payload.new)
      }
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}
```

---

## 10. 画像API

### 10.1 画像アップロード

**実装:**

```typescript
async function uploadImage(
  file: File,
  bucket: string,
  path: string
): Promise<string> {
  // 画像を処理（EXIF削除、リサイズ、WebP変換）
  const processedImage = await processImage(file)

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, processedImage, {
      contentType: 'image/webp',
      upsert: false
    })

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return publicUrl
}
```

### 10.2 EXIF抽出

**実装（Web版）:**

```typescript
import exifr from 'exifr'

interface ExifData {
  latitude: number | null
  longitude: number | null
  takenAt: Date | null
}

async function extractExif(file: File): Promise<ExifData> {
  try {
    const exif = await exifr.parse(file, {
      pick: ['GPSLatitude', 'GPSLongitude', 'DateTimeOriginal']
    })

    return {
      latitude: exif?.latitude ?? null,
      longitude: exif?.longitude ?? null,
      takenAt: exif?.DateTimeOriginal ?? null
    }
  } catch {
    return {
      latitude: null,
      longitude: null,
      takenAt: null
    }
  }
}
```

**実装（iOS版）:**

```swift
import Photos

func extractExifData(from asset: PHAsset) -> (location: CLLocationCoordinate2D?, takenAt: Date?) {
    let location = asset.location?.coordinate
    let takenAt = asset.creationDate
    
    return (location, takenAt)
}
```

---

## 11. エラーハンドリング

### 11.1 エラーコード

| コード | 説明 |
|--------|------|
| `PGRST116` | レコードが見つからない |
| `23505` | ユニーク制約違反（重複） |
| `23503` | 外部キー制約違反 |
| `42501` | RLS権限エラー |
| `AUTH_INVALID` | 認証エラー |

### 11.2 エラーハンドリング例

```typescript
async function safeApiCall<T>(
  apiCall: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: string | null }> {
  try {
    const { data, error } = await apiCall()

    if (error) {
      // エラーコードに応じたメッセージ
      switch (error.code) {
        case 'PGRST116':
          return { data: null, error: 'データが見つかりませんでした' }
        case '23505':
          return { data: null, error: 'すでに登録されています' }
        case '42501':
          return { data: null, error: 'アクセス権限がありません' }
        default:
          return { data: null, error: 'エラーが発生しました' }
      }
    }

    return { data, error: null }
  } catch (e) {
    return { data: null, error: '通信エラーが発生しました' }
  }
}
```

---

## 12. レート制限

Supabaseのデフォルトレート制限：

| プラン | リクエスト/秒 |
|--------|--------------|
| Free | 100 |
| Pro | 1000 |

### クライアント側での対策

```typescript
// リトライ付きAPI呼び出し
async function apiCallWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error: any) {
      if (error.status === 429 && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
        continue
      }
      throw error
    }
  }
  throw new Error('Max retries exceeded')
}
```

---

## 13. セキュリティ

### 13.1 RLSポリシー

すべてのテーブルでRow Level Securityを有効化し、適切なポリシーを設定します。

```sql
-- 例: 投稿は誰でも閲覧可能、作成・更新は本人のみ
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active posts"
ON posts FOR SELECT
USING (status = 'active');

CREATE POLICY "Users can create own posts"
ON posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
ON posts FOR UPDATE
USING (auth.uid() = user_id);
```

### 13.2 入力バリデーション

```typescript
import { z } from 'zod'

const createPostSchema = z.object({
  oshiId: z.string().uuid(),
  category: z.enum(['ooh', 'popup', 'event', 'other']),
  comment: z.string().max(140).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

function validateCreatePost(data: unknown) {
  return createPostSchema.safeParse(data)
}
```

---

## 14. エラーレスポンス具体例

### 14.1 Supabaseエラーの形式

```typescript
// Supabaseのエラーオブジェクト
interface PostgrestError {
  message: string    // エラーメッセージ
  details: string    // 詳細情報
  hint: string       // ヒント
  code: string       // PostgreSQLエラーコード
}
```

### 14.2 よくあるエラーと対処

#### レコードが見つからない

```typescript
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('id', 'non-existent-id')
  .single()

// error の内容
{
  "code": "PGRST116",
  "message": "JSON object requested, multiple (or no) rows returned",
  "details": "The result contains 0 rows",
  "hint": null
}

// ユーザー向けメッセージ
"投稿が見つかりませんでした"
```

#### ユニーク制約違反（重複）

```typescript
const { data, error } = await supabase
  .from('user_oshis')
  .insert({ user_id: 'xxx', oshi_id: 'yyy' })

// error の内容（同じ推しを2回登録した場合）
{
  "code": "23505",
  "message": "duplicate key value violates unique constraint \"uq_user_oshi\"",
  "details": "Key (user_id, oshi_id)=(xxx, yyy) already exists.",
  "hint": null
}

// ユーザー向けメッセージ
"この推しはすでに登録されています"
```

#### 外部キー制約違反

```typescript
const { data, error } = await supabase
  .from('posts')
  .insert({ spot_id: 'non-existent-spot', ... })

// error の内容
{
  "code": "23503",
  "message": "insert or update on table \"posts\" violates foreign key constraint \"posts_spot_id_fkey\"",
  "details": "Key (spot_id)=(xxx) is not present in table \"spots\".",
  "hint": null
}

// ユーザー向けメッセージ
"指定されたスポットが存在しません"
```

### 14.3 エラーメッセージ変換ユーティリティ

```typescript
/**
 * Supabaseエラーをユーザー向けメッセージに変換
 */
function getErrorMessage(error: PostgrestError): string {
  const errorMessages: Record<string, string> = {
    'PGRST116': 'データが見つかりませんでした',
    '23505': 'すでに登録されています',
    '23503': '関連するデータが存在しません',
    '42501': 'この操作を行う権限がありません',
    '22P02': '入力形式が正しくありません',
  }

  return errorMessages[error.code] || 'エラーが発生しました'
}
```

---

## 15. ページネーション

### 15.1 オフセットベース（シンプル）

タイムラインなど、通常のリスト表示に使用します。

```typescript
interface PaginationParams {
  page: number      // ページ番号（1始まり）
  limit: number     // 1ページあたりの件数
}

async function getPostsWithPagination(params: PaginationParams) {
  const { page, limit } = params
  const offset = (page - 1) * limit

  // データ取得
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // 総件数取得
  const { count } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  return {
    data,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      hasNext: offset + limit < (count || 0),
      hasPrev: page > 1,
    }
  }
}
```

### 15.2 カーソルベース（無限スクロール）

スムーズな無限スクロールに使用します。

```typescript
interface CursorParams {
  cursor?: string   // 最後のアイテムのcreated_at
  limit: number
}

async function getPostsWithCursor(params: CursorParams) {
  const { cursor, limit } = params

  let query = supabase
    .from('posts')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit + 1)  // 次のページがあるか確認用に1件多く取得

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data, error } = await query

  const hasNext = data && data.length > limit
  const items = hasNext ? data.slice(0, limit) : data
  const nextCursor = hasNext ? items[items.length - 1].created_at : null

  return {
    data: items,
    nextCursor,
    hasNext,
  }
}
```

### 15.3 使い分けの指針

| 方式 | 用途 | メリット | デメリット |
|------|------|----------|------------|
| **オフセット** | ページ番号表示 | 任意のページにジャンプ可能 | 大量データで遅くなる |
| **カーソル** | 無限スクロール | 高速、リアルタイム追加に強い | ページ番号が出せない |

**OSHIATOでの使い分け:**
- タイムライン → カーソルベース（無限スクロール）
- 訪問ログ → オフセットベース（ページ番号表示）
- 検索結果 → オフセットベース（「10件中1-10件」表示）

---

## 16. 外部API連携

### 16.1 Mapbox Geocoding API（住所検索→座標変換）

投稿時にEXIF GPS情報がない写真をアップロードした場合、ユーザーが住所・場所名から位置を指定するために使用。

#### エンドポイント

```
GET https://api.mapbox.com/geocoding/v5/mapbox.places/{query}.json
```

#### パラメータ

| パラメータ | 値 | 説明 |
|-----------|-----|------|
| `access_token` | `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox GL JSと共通のトークン |
| `language` | `ja` | 日本語で結果を返す |
| `country` | `jp` | 日本国内に限定 |
| `limit` | `5` | 候補数の上限 |
| `types` | `poi,address,place` | スポット・住所・地名に絞る |

#### レスポンス（使用するフィールド）

```typescript
interface GeocodingFeature {
  place_name: string;        // 表示用の住所文字列
  center: [number, number];  // [経度, 緯度]
}
```

#### 使用箇所

- `components/post/LocationPicker/LocationPicker.tsx`
- 入力から300msのデバウンス後にリクエスト

#### 料金

- 月10万リクエストまで無料（Mapbox Free tier）

---

**OSHIATO API定義書 v5.1**

