# OSHIATO

## 概要
OSHIATO は、EXIF/GPS 付きの現場写真をもとに、推し活の「現場ログ」を地図上に可視化するサービスです。  
Phase 1–2 で Web / iOS MVP を実装し、将来的に Android や OOH 連携まで拡張します。


## ターゲット / ユースケース
- K-POP / 2.5 次元 / ジャニーズなどのファンが、現場写真を地図に残したい。
- OOH（ポスター・広告）やロケ地を記録し、他のファンと共有したい。
- 自分の遠征・現場履歴を振り返りたい。

## フェーズとスコープ
- Phase 1: Web MVP（Next.js + Supabase + Mapbox）
- Phase 2: iOS MVP（SwiftUI + Supabase + MapKit）
- Phase 3: 本番運用・DM など拡張
- Phase 4: Android / Apple Watch / その他拡張

※詳細な要件は `docs/OSHIATO_Requirements_v5_1.md` を参照してください。

## アーキテクチャ概要
- Web: Next.js, React, Supabase (Auth/DB/Storage/RLS), Mapbox, Vercel
- iOS: Swift, SwiftUI, MapKit, Core Location, AVFoundation
- 画像: iPhone からアップロードした JPEG/HEIC を WebP 変換し、EXIF/GPS 情報を抽出して Supabase Storage + DB に保存します。


## 機能（MVP）
- 写真アップロードと EXIF/GPS 抽出
- マップ上での投稿表示・クラスタリング
- 認証（Email + OAuth2: Google / Apple / X）
- プロフィール・簡易なユーザー設定

## 開発環境セットアップ
1. Node.js / pnpm をインストール
2. Supabase プロジェクトを作成し、`.env.local` に接続情報を設定
3. Mapbox のアクセストークンを取得し、環境変数に設定
4. Web
   - `cd apps/web`
   - `pnpm install`
   - `pnpm dev`
5. iOS
   - `cd apps/ios`
   - Xcode で `OSHIATO.xcodeproj` を開き、ターゲット `OSHIATO` をビルド・実行

## Claude Code での利用ガイド
- 最初に `docs/OSHIATO_Requirements_v5_1.md` を読み、現在の Phase と対象機能を確認してください。
- 変更依頼があった場合は、まず影響範囲のディレクトリとファイル一覧、作業プランを Markdown で出力してください。
- 実装では既存のコンポーネント・ユーティリティを優先的に再利用してください。
- Supabase の RLS ポリシーを壊さないよう、DB スキーマ変更やクエリ追加の前に `db` 関連ファイルを確認してください。

## コーディング規約・テスト
- 詳細なルールは `CLAUDE.md` および `.claude/rules/` 以下のファイルを参照してください。
