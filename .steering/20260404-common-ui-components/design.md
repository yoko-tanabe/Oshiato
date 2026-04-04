# 共通UIコンポーネント整備 - 設計

## ファイル構成

```
apps/web/components/ui/
├── EmptyState/
│   ├── EmptyState.tsx
│   └── EmptyState.module.css
├── LoadingSpinner/
│   ├── LoadingSpinner.tsx
│   └── LoadingSpinner.module.css
└── Toast/
    ├── Toast.tsx
    ├── Toast.module.css
    └── ToastProvider.tsx
```

---

## 1. EmptyState

### Props

```typescript
interface EmptyStateProps {
  icon: React.ReactNode;     // Lucide アイコン等
  message: string;           // メインメッセージ
  description?: string;      // サブメッセージ（任意）
  actionLabel?: string;      // CTAボタンのラベル（任意）
  onAction?: () => void;     // CTAボタンのクリックハンドラ
}
```

### レイアウト
- 縦中央寄せ（flexbox column, align-items center）
- アイコン: 48px, color: #666666
- メッセージ: 16px, #FFFFFF, weight 500
- サブメッセージ: 14px, #888888
- CTAボタン: Lavender プライマリボタンスタイル
- 各要素間: 12px（--space-md）

---

## 2. LoadingSpinner

### Props

```typescript
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';  // デフォルト: 'medium'
}
```

### サイズ
- small: 20px（インライン用）
- medium: 32px（セクション用）
- large: 48px（ページ全体用）

### スタイル
- Lavender (#C4B5FD) のボーダーリング
- 上部のみ透明（回転するスピナー）
- animation: spin 0.8s linear infinite

---

## 3. Toast

### 設計方針
- React Context + Provider パターン
- `ToastProvider` を layout.tsx で一度ラップ
- `useToast()` フックで任意のコンポーネントから呼び出し

### Toast の型

```typescript
type ToastType = 'success' | 'error' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string) => void;
}
```

### 表示位置・挙動
- 画面上部中央（top: 60px）
- フェードイン → 3秒後にフェードアウト → 削除
- 複数Toastは縦に積む

### カラー
- success: #22C55E（背景は rgba 10% + 左ボーダー）
- error: #EF4444
- warning: #F59E0B
- 背景: #232323 + 左3px色付きボーダー
- テキスト: #FFFFFF

---

## CSS変数の使用

すべてのコンポーネントで `globals.css` に定義済みのCSS変数を使用する:
- `--color-*` カラー系
- `--space-*` スペーシング系
- `--radius-*` 角丸系
- `--transition-*` アニメーション系
