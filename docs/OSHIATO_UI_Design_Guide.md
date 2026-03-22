# OSHIATO UI Design Guide

**推しの足跡を、地図に刻む**

---

| 項目 | 内容 |
|------|------|
| バージョン | v1.0 |
| 作成日 | 2026年3月 |
| 対応CLAUDE.md | v1.0 |

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|------------|------|----------|
| v1.0 | 2026/03 | 初版作成 |

---

## 1. デザインコンセプト

### 1.1 コアコンセプト

**「洗練されたダーク × 推し活のわくわく感」**

- **ダークテーマベース**: 写真が映える、目に優しい、高級感
- **Lavenderアクセント**: 柔らかく神秘的、推し活・ファン文化との親和性
- **差し色で特別感**: ショッキングピンク・イエローで祝福感・緊急性を表現
- **写真が主役**: UIは控えめに、ユーザーの推し活写真を引き立てる

### 1.2 デザインキーワード

| キーワード | 説明 |
|-----------|------|
| 洗練 | シンプルで無駄がない、プロフェッショナルな印象 |
| 余白 | 適切な空間で情報を整理、窮屈さを排除 |
| 大人可愛い | 子供っぽくない、落ち着いた中に遊び心 |
| 写真映え | ユーザーの写真が主役、UIは引き立て役 |

### 1.3 参考デザイン

- **Sway**: ダークテーマ、地図上のピン表現、写真サムネイル
- **HORTENSIA**: 余白の使い方、ランク・ポイント表示、洗練されたカード
- **Simple. Smart. Speedy.**: ダークベース、パキッとしたアクセントカラー

---

## 2. カラーパレット

### 2.1 ベースカラー

| 名前 | カラーコード | 用途 |
|------|-------------|------|
| **Black** | `#0D0D0D` | 最も暗い背景、端末フレーム |
| **Dark** | `#1A1A1A` | メイン背景 |
| **Dark Gray** | `#232323` | カード背景、入力フィールド |
| **Mid Gray** | `#333333` | ボーダー、区切り線 |
| **Gray** | `#444444` | 非アクティブアイコン |
| **Light Gray** | `#666666` | サブテキスト、ラベル |
| **Muted** | `#888888` | プレースホルダー |
| **White** | `#FFFFFF` | メインテキスト |

### 2.2 アクセントカラー

| 名前 | カラーコード | 用途 |
|------|-------------|------|
| **Lavender** | `#C4B5FD` | メインアクセント、アクティブ状態、ボタン、ロゴ |
| **Lavender Light** | `#DDD6FE` | ホバー状態、薄いハイライト |
| **Lavender Dark** | `#A78BFA` | 押下状態 |

### 2.3 差し色（特別な瞬間のみ使用）

| 名前 | カラーコード | 用途 |
|------|-------------|------|
| **Shocking Pink** | `#FF1493` | 通知バッジ、NEW表示、期間限定、緊急性 |
| **Yellow** | `#DFFF00` | ポイント獲得、ランクアップ、達成、祝福感 |

### 2.4 セマンティックカラー

| 名前 | カラーコード | 用途 |
|------|-------------|------|
| **Success** | `#22C55E` | 成功メッセージ、完了状態 |
| **Warning** | `#F59E0B` | 警告、注意喚起 |
| **Error** | `#EF4444` | エラーメッセージ、削除 |
| **Info** | `#3B82F6` | 情報、ヒント |

### 2.5 差し色の使用ルール

```
⚠️ 重要: 差し色は控えめに使用すること

【使用OK】
- 通知バッジの数字 → Shocking Pink
- 「NEW」「期間限定」バッジ → Shocking Pink
- ポイント獲得時のアニメーション → Yellow
- ランクアップ演出 → Yellow
- 達成バッジ → Yellow

【使用NG】
- 通常のボタン（Lavenderを使用）
- 通常のアイコン（Gray系を使用）
- 大きな面積への使用
- 1画面に3箇所以上の使用
```

---

## 3. タイポグラフィ

### 3.1 フォントファミリー

**Casual Friendly スタイル** - 丸みがあり親しみやすい、やわらかい印象

| 用途 | フォント | 備考 |
|------|---------|------|
| **欧文（ロゴ・数字）** | Nunito | 丸みのあるサンセリフ、親しみやすい |
| **日本語（本文）** | Zen Maru Gothic | 丸ゴシック、やわらかく可愛い |
| **iOS フォールバック** | SF Pro Rounded | Nunitoに近い丸みのある印象 |
| **Web フォールバック** | system-ui, sans-serif | システムフォント |

#### Google Fonts 読み込み

```html
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700&family=Zen+Maru+Gothic:wght@400;500;700&display=swap" rel="stylesheet">
```

#### CSS設定

```css
/* 欧文・数字 */
.font-display {
  font-family: 'Nunito', system-ui, sans-serif;
}

/* 日本語・本文 */
.font-body {
  font-family: 'Zen Maru Gothic', 'Nunito', system-ui, sans-serif;
}

/* 統合設定 */
body {
  font-family: 'Zen Maru Gothic', 'Nunito', system-ui, -apple-system, sans-serif;
}
```

#### フォントの特徴

| フォント | 特徴 |
|---------|------|
| **Nunito** | 丸みを帯びた角、均一な線幅、読みやすい、モダンだが温かみがある |
| **Zen Maru Gothic** | 日本語丸ゴシック、やわらかく可愛らしい、視認性が高い |

### 3.2 フォントサイズ

| 名前 | サイズ | 用途 |
|------|-------|------|
| **Display** | 36px | 大きな数字（ポイント表示など） |
| **H1** | 24px | ページタイトル（ほぼ使用しない） |
| **H2** | 18px | セクションタイトル |
| **H3** | 16px | カードタイトル |
| **Body** | 14px | 本文、通常テキスト |
| **Small** | 12px | 補足情報、日時 |
| **Caption** | 10px | ラベル、タブバーテキスト |
| **Micro** | 9px | バッジ内テキスト |

### 3.3 フォントウェイト

| 名前 | ウェイト | 用途 |
|------|---------|------|
| **Regular** | 400 | 本文 |
| **Medium** | 500 | 強調、ボタン |
| **Semibold** | 600 | タイトル、重要な数字 |

### 3.4 行間

| 用途 | line-height |
|------|-------------|
| 見出し | 1.2 |
| 本文 | 1.5 |
| 複数行テキスト | 1.6 |

---

## 4. スペーシング

### 4.1 基本単位

**4pxグリッドシステム**を採用。すべての余白は4の倍数で設定する。

| 名前 | サイズ | 用途 |
|------|-------|------|
| **xs** | 4px | 最小余白、アイコンとテキストの間 |
| **sm** | 8px | 要素内の小さな余白 |
| **md** | 12px | 要素間の標準余白 |
| **lg** | 16px | セクション内余白 |
| **xl** | 20px | カード内パディング |
| **2xl** | 24px | セクション間余白 |
| **3xl** | 32px | 大きなセクション間 |

### 4.2 画面マージン

| 要素 | マージン |
|------|---------|
| 画面左右 | 16px |
| カード内パディング | 14px - 16px |
| リストアイテム間 | 10px - 12px |
| セクション間 | 24px |

---

## 5. コンポーネント

### 5.1 ボタン

#### プライマリボタン

```css
background: #C4B5FD;
color: #0D0D0D;
border-radius: 8px;
padding: 12px 24px;
font-size: 13px;
font-weight: 600;
```

#### セカンダリボタン

```css
background: #232323;
color: #FFFFFF;
border: 1px solid #333333;
border-radius: 8px;
padding: 12px 24px;
font-size: 13px;
font-weight: 500;
```

#### ゴーストボタン

```css
background: transparent;
color: #C4B5FD;
border: none;
font-size: 13px;
font-weight: 500;
```

### 5.2 カード

```css
background: #232323;
border: 1px solid #333333;
border-radius: 14px;
padding: 14px;
```

### 5.3 入力フィールド

```css
background: #232323;
border: 1px solid #333333;
border-radius: 10px;
padding: 10px 12px;
color: #FFFFFF;
font-size: 14px;

/* プレースホルダー */
::placeholder {
  color: #666666;
}

/* フォーカス時 */
:focus {
  border-color: #C4B5FD;
}
```

### 5.4 バッジ

#### 通常バッジ（タグ）

```css
background: #333333;
color: #888888;
border-radius: 12px;
padding: 4px 10px;
font-size: 10px;
```

#### アクティブバッジ

```css
background: #C4B5FD;
color: #0D0D0D;
border-radius: 12px;
padding: 4px 10px;
font-size: 10px;
font-weight: 500;
```

#### 通知バッジ（差し色）

```css
background: #FF1493;
color: #FFFFFF;
border-radius: 50%;
min-width: 18px;
height: 18px;
font-size: 10px;
font-weight: 600;
```

#### NEWバッジ（差し色）

```css
background: #FF1493;
color: #FFFFFF;
border-radius: 4px;
padding: 2px 6px;
font-size: 9px;
font-weight: 600;
letter-spacing: 0.5px;
```

### 5.5 タブバー

```css
/* コンテナ */
background: #1A1A1A;
border-top: 1px solid #252525;
padding: 14px 10px 12px;

/* 非アクティブアイコン */
stroke: #444444;
font-size: 9px;
color: #444444;

/* アクティブアイコン */
stroke: #C4B5FD;
font-size: 9px;
color: #C4B5FD;
font-weight: 500;

/* 中央の追加ボタン */
background: #C4B5FD;
width: 38px;
height: 38px;
border-radius: 50%;
margin-top: -8px;
box-shadow: 0 4px 12px rgba(196, 181, 253, 0.3);
```

### 5.6 マップピン

```css
/* アクティブピン */
width: 48px;
height: 48px;
background: #C4B5FD;
border-radius: 50%;
border: 3px solid #0D0D0D;
box-shadow: 0 4px 16px rgba(196, 181, 253, 0.35);

/* 通常ピン */
width: 42px;
height: 42px;
background: #333333;
border-radius: 50%;
border: 3px solid #0D0D0D;

/* 現在地 */
width: 12px;
height: 12px;
background: #C4B5FD;
border-radius: 50%;
border: 2px solid #0D0D0D;
box-shadow: 0 0 0 6px rgba(196, 181, 253, 0.15);
```

---

## 6. アイコン

### 6.1 アイコンスタイル

- **スタイル**: 線画（Stroke）アイコン
- **線幅**: 1.5px（通常）、1.2px（小さいアイコン）
- **角**: 丸み（round cap, round join）

### 6.2 アイコンサイズ

| 用途 | サイズ |
|------|-------|
| タブバー | 20px |
| ヘッダーアクション | 18px |
| リストアイテム | 20px - 24px |
| カード内 | 16px - 20px |
| バッジ内 | 12px - 14px |

### 6.3 主要アイコン一覧

| 機能 | アイコン名（Lucide Icons） |
|------|---------------------------|
| マップ | `map-pin` |
| タイムライン | `grid-2x2` または `layout-grid` |
| 投稿追加 | `plus` |
| 軌跡 | `layers` |
| マイページ | `user` |
| 検索 | `search` |
| 通知 | `bell` |
| 設定 | `settings` |
| 戻る | `arrow-left` |
| 進む | `chevron-right` |
| 推し・お気に入り | `heart` |
| 写真 | `image` |
| カレンダー | `calendar` |
| フィルター | `filter` または `sliders` |

### 6.4 絵文字の使用

```
❌ 絵文字は使用しない

UIにはSVGアイコン（線画）を使用する。
絵文字はカジュアルすぎる印象を与え、
洗練されたデザインコンセプトに合わない。
```

---

## 7. 画面別ガイド

### 7.1 マップ画面

```
┌─────────────────────────────┐
│ [OSHIATO]      [🔍] [🔔]   │  ← ヘッダー: ロゴはLavender
├─────────────────────────────┤
│                             │
│        地図エリア           │  ← 背景: #252525 → #1A1A1A
│    ┌───┐                    │
│    │ 📷 │ ← ピン            │  ← アクティブピン: Lavender
│    └───┘                    │
│              ● ← 現在地     │  ← 現在地: Lavender + 波紋
│                             │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ [写真]  スポット名      │ │  ← カード: #232323
│ │         詳細...         │ │
│ │    [チェックイン]       │ │  ← ボタン: Lavender
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ 📍  ⊞  (+)  ◇  👤         │  ← タブバー
└─────────────────────────────┘
```

### 7.2 タイムライン画面

```
┌─────────────────────────────┐
│ タイムライン          [🔽] │  ← ヘッダー
├─────────────────────────────┤
│ 2026年3月                   │  ← 月ヘッダー: Lavender
├─────────────────────────────┤
│ ┌───┐ ┌───┐ ┌───┐          │
│ │   │ │   │ │   │          │  ← 正方形タイル
│ │03/│ │03/│ │03/│          │
│ │22 │ │20 │ │18 │          │  ← 日付 + 時間表示
│ └───┘ └───┘ └───┘          │
│ ┌───┐ ┌───┐ ┌───┐          │
│ │   │ │   │ │   │          │
│ └───┘ └───┘ └───┘          │
├─────────────────────────────┤
│ 📍  ⊞  (+)  ◇  👤         │
└─────────────────────────────┘
```

**タイルの仕様:**
- グリッド: 3列
- ギャップ: 3px
- 角丸: 4px
- 写真の上に日時オーバーレイ（グラデーション背景）

### 7.3 マイページ画面

```
┌─────────────────────────────┐
│ マイページ           [⚙️] │
├─────────────────────────────┤
│         [アバター]          │  ← 72px, 丸
│        ユーザー名           │
│         @username           │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │    RANK  シルバー       │ │  ← ランク: Lavender
│ │        200 pt           │ │  ← 大きな数字: 36px
│ │ ████░░░░░░░░░░░░░░░░░░  │ │  ← プログレスバー
│ │   次のランクまで 9,800pt │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ [推し管理] [訪問履歴] [カード]│
├─────────────────────────────┤
│ 📍  ⊞  (+)  ◇  👤         │
└─────────────────────────────┘
```

---

## 8. アニメーション・インタラクション

### 8.1 トランジション

| 対象 | duration | easing |
|------|----------|--------|
| ボタンホバー | 150ms | ease-out |
| ページ遷移 | 300ms | ease-in-out |
| モーダル表示 | 250ms | ease-out |
| カード展開 | 200ms | ease-out |

### 8.2 特別な演出（差し色を使用）

#### ポイント獲得時

```
1. Yellow (#DFFF00) のパーティクルが弾ける
2. ポイント数字が Yellow で表示
3. 0.5秒後に通常色（White）にフェード
```

#### ランクアップ時

```
1. Yellow (#DFFF00) のグロー効果
2. ランク名が Yellow → Lavender にフェード
3. 祝福アニメーション（キラキラ）
```

#### 新着通知

```
1. Shocking Pink (#FF1493) のバッジがバウンス
2. プルスアニメーション（縮小→拡大）
```

---

## 9. ダークモード対応

### 9.1 基本方針

OSHIATOは**ダークモードがデフォルト**。
ライトモードは現時点では未対応（Phase 3以降で検討）。

### 9.2 理由

1. 写真が映える
2. 推し活は夜間・ライブ会場での利用が多い
3. 目に優しい
4. 高級感・洗練された印象

---

## 10. レスポンシブ対応

### 10.1 ブレークポイント

| 名前 | サイズ | 対象 |
|------|-------|------|
| **Mobile** | 〜430px | iPhone（メイン） |
| **Tablet** | 431px〜768px | iPad mini |
| **Desktop** | 769px〜 | Web版 |

### 10.2 グリッド調整

| 画面サイズ | タイムラインカラム数 |
|-----------|-------------------|
| Mobile | 3列 |
| Tablet | 4列 |
| Desktop | 5〜6列 |

---

## 11. アクセシビリティ

### 11.1 コントラスト比

| 組み合わせ | コントラスト比 | 判定 |
|-----------|--------------|------|
| White (#FFF) on Dark (#1A1A1A) | 15.3:1 | ✅ AAA |
| Lavender (#C4B5FD) on Dark (#1A1A1A) | 8.2:1 | ✅ AAA |
| Light Gray (#666) on Dark (#1A1A1A) | 4.8:1 | ✅ AA |

### 11.2 タッチターゲット

- 最小タッチサイズ: 44px × 44px
- ボタン・アイコンは十分なパディングを確保

### 11.3 フォーカス表示

```css
:focus-visible {
  outline: 2px solid #C4B5FD;
  outline-offset: 2px;
}
```

---

## 12. CSS変数定義

```css
:root {
  /* Base Colors */
  --color-black: #0D0D0D;
  --color-dark: #1A1A1A;
  --color-dark-gray: #232323;
  --color-mid-gray: #333333;
  --color-gray: #444444;
  --color-light-gray: #666666;
  --color-muted: #888888;
  --color-white: #FFFFFF;
  
  /* Accent Colors */
  --color-lavender: #C4B5FD;
  --color-lavender-light: #DDD6FE;
  --color-lavender-dark: #A78BFA;
  
  /* Accent - Special (Use Sparingly) */
  --color-pink: #FF1493;
  --color-yellow: #DFFF00;
  
  /* Semantic Colors */
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;
  
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 20px;
  --space-2xl: 24px;
  --space-3xl: 32px;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 14px;
  --radius-full: 9999px;
  
  /* Typography */
  --font-display: 'Nunito', system-ui, sans-serif;
  --font-body: 'Zen Maru Gothic', 'Nunito', system-ui, sans-serif;
  --font-family: 'Zen Maru Gothic', 'Nunito', system-ui, -apple-system, sans-serif;
  --font-size-micro: 9px;
  --font-size-caption: 10px;
  --font-size-small: 12px;
  --font-size-body: 14px;
  --font-size-h3: 16px;
  --font-size-h2: 18px;
  --font-size-h1: 24px;
  --font-size-display: 36px;
  
  /* Transitions */
  --transition-fast: 150ms ease-out;
  --transition-normal: 250ms ease-out;
  --transition-slow: 300ms ease-in-out;
  
  /* Shadows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.25);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.3);
  --shadow-lavender: 0 4px 12px rgba(196, 181, 253, 0.3);
}
```

---

## 13. チェックリスト

### 新しいコンポーネント作成時

- [ ] ダークテーマのカラーパレットを使用しているか
- [ ] 4pxグリッドに従った余白か
- [ ] タッチターゲットは44px以上か
- [ ] 差し色は適切な場面のみか（通知、達成、緊急性）
- [ ] アイコンは線画スタイルか
- [ ] 絵文字を使用していないか
- [ ] フォントサイズは定義されたものか

### 画面作成時

- [ ] 写真が映えるデザインになっているか
- [ ] UIが控えめで主役を邪魔していないか
- [ ] アクティブ状態がLavenderで統一されているか
- [ ] 差し色は1画面に1〜2箇所以内か
- [ ] 適切な余白が確保されているか

---

**OSHIATO UI Design Guide v1.0**
