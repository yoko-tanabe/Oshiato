# 技術設計: 推しマスタデータ & 検索選択UI

## 1. シードデータ

### 形式
- `supabase/seed-oshis.sql` にINSERT文として管理
- `ON CONFLICT` で冪等性を確保（何度実行しても重複しない）

### データ構造
```sql
INSERT INTO oshis (name, group_name, category) VALUES
  -- 箱推し用（グループ単位）
  ('モーニング娘。', NULL, 'idol'),
  -- メンバー個人
  ('譜久村聖', 'モーニング娘。', 'idol'),
  ...
ON CONFLICT (name, group_name) DO NOTHING;
```

### ユニーク制約の追加
`oshis`テーブルに `(name, group_name)` のユニーク制約を追加。
- 箱推し: `name='モーニング娘。', group_name=NULL`
- メンバー: `name='譜久村聖', group_name='モーニング娘。'`

※ PostgreSQLでNULLを含むユニーク制約は `COALESCE` またはユニークインデックスで対応。

```sql
CREATE UNIQUE INDEX IF NOT EXISTS idx_oshis_name_group
  ON oshis (name, COALESCE(group_name, ''));
```

## 2. AddOshiForm 改修

### UI フロー
```
[推しの名前 入力欄] ← テキスト入力
    ↓ 2文字以上で検索開始
[サジェストドロップダウン]
  ├─ 「道枝駿佑（なにわ男子）」 ← 候補タップで選択
  ├─ 「道枝...」
  └─ 「"道枝" で新規登録する」 ← 最下部に常に表示
    ↓ 候補選択時
[グループ名] ← 自動入力（読み取り専用）
[テーマカラー選択] ← 従来通り
[追加する] ボタン
```

### 選択時の挙動
- **既存候補を選択**: `oshi_id` を保持、`oshis`へのINSERTは不要
- **新規登録**: 従来通り`oshis`にINSERT → `user_oshis`に紐付け
  - INSERT前に `(name, group_name)` で既存チェック（ユニーク制約で担保）

### 検索クエリ
```typescript
const { data } = await supabase
  .from('oshis')
  .select('id, name, group_name')
  .or(`name.ilike.%${keyword}%, group_name.ilike.%${keyword}%`)
  .limit(10);
```

### デバウンス
- 入力から300msのデバウンスで検索実行（API呼びすぎ防止）

## 3. 変更対象ファイル

| ファイル | 変更内容 |
|---------|---------|
| `supabase/seed-oshis.sql` | **新規** シードデータ（ハロプロ＋STARTO） |
| `supabase/migrations/` | ユニーク制約の追加マイグレーション |
| `components/oshi/AddOshiForm/AddOshiForm.tsx` | サジェストUI実装、登録ロジック変更 |
| `components/oshi/AddOshiForm/AddOshiForm.module.css` | サジェストUI用スタイル追加 |

## 4. 箱推し対応

シードデータにグループ名のみの推しも含める：
- `name='モーニング娘。', group_name=NULL` → 箱推し用
- `name='譜久村聖', group_name='モーニング娘。'` → メンバー個人用

サジェストの表示：
- メンバー: `「譜久村聖（モーニング娘。）」`
- 箱推し: `「モーニング娘。（グループ）」`
