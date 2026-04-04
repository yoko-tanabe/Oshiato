# 既存ページUI改善 - 設計

## 変更方針

既存コンポーネントのインラインなローディング・空状態表示を、Step 3 で作った共通コンポーネントに置き換える。機能変更はなく、見た目と一貫性の改善のみ。

## 2-1. TabBar

```css
/* 変更前 */
.label { font-size: 9px; color: #444444; }

/* 変更後 */
.label { font-size: 11px; color: #808080; }
.tabActive に下線インジケーター追加（::after 擬似要素、Lavender 2px）
```

アイコン色も `#444444` → `#808080` に統一。

## 2-2. MapView

- 地図コンテナ初期状態で `<LoadingSpinner size="large" />` を表示
- `map.on('load')` 完了後にスピナーを非表示にする state 追加
- console.log を削除
- 位置情報エラー時に Toast で通知

## 2-3. TimelineGrid

- `<Loader2>` インラインスピナー → `<LoadingSpinner size="large" />`
- 空状態の `<div className={styles.empty}>` → `<EmptyState icon={<Camera />} message="..." />`
- grid gap: 3px → 4px
- 月ヘッダーに下ボーダー追加
- `<img>` に `onError` でフォールバック背景表示

## 2-4. PostForm

- `router.push('/')` の前に `showToast('success', '投稿しました')` を追加
- ただしページ遷移で Toast が消えるため、遷移先で表示する仕組みが必要
  → シンプルに router.push のクエリパラメータ `?posted=1` でマップ側で検知する方式を採用

## 2-5. OshiPage

- `if (isLoading) return null` → `<LoadingSpinner size="large" />`
- 空状態 → `<EmptyState icon={<Heart />} message="..." actionLabel="推しを追加" />`
- AddOshiForm の成功時に Toast 表示
