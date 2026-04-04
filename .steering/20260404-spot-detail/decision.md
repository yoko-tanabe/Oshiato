# スポット詳細ページ - 決定事項

## D1: スポット座標の取得方法

**決定**: 既存RPC `get_spots_with_coords` を呼び出し、返ってきた全件から該当IDでフィルタ

**理由**: 個別スポット用のRPCを新たに作成するよりも、既存RPCを再利用する方がシンプル。スポット数が数百件程度のPhase 1では性能問題なし。

## D2: page.tsx の構成

**決定**: `page.tsx` は Server Component のまま、`params` から `id` を取得して `SpotDetail` に渡す

**理由**: CLAUDE.md ルール「page.tsx に 'use client' を書かない」に準拠。SpotDetail 側に 'use client' を記載。
