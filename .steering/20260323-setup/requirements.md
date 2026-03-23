# requirements.md — 20260323-setup

## 要求内容

Phase 1 Web版開発の土台となるNext.jsアプリケーションの骨格を作成する。

## ユーザーストーリー

- 開発者として、Next.js 15のアプリが起動できる状態にしたい
- 開発者として、全ページの共通デザイントークン（カラー・フォント）が用意されている状態にしたい
- 開発者として、Phase 1の全ルート（URL）がプレースホルダーとして存在する状態にしたい

## 受け入れ条件

- [ ] `npm run dev` でローカルサーバーが起動する
- [ ] `npm run type-check` でエラーが出ない
- [ ] `npm run lint` で警告が出ない
- [ ] `apps/web/` 以下に Repository_Structure.md のフォルダ構造が存在する
- [ ] デザイントークンが `globals.css` に定義されている
- [ ] 全ルート（/spot/[id], /post/new, /timeline, /oshi, /visits, /trajectory）にアクセスできる
