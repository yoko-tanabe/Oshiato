-- ハロプロ（Hello! Project）シードデータ
-- 実行方法: Supabase Dashboard > SQL Editor で実行
-- ※ 事前に 20260409_add_oshi_unique_index.sql を実行しておくこと

-- ===========================================
-- モーニング娘。
-- ===========================================
INSERT INTO oshis (name, group_name, category) VALUES
  ('モーニング娘。', NULL, 'idol'),
  ('野中美希', 'モーニング娘。', 'idol'),
  ('牧野真莉愛', 'モーニング娘。', 'idol'),
  ('羽賀朱音', 'モーニング娘。', 'idol'),
  ('北川莉央', 'モーニング娘。', 'idol'),
  ('岡村ほまれ', 'モーニング娘。', 'idol'),
  ('山﨑愛生', 'モーニング娘。', 'idol'),
  ('櫻井梨央', 'モーニング娘。', 'idol'),
  ('弓桁朱琴', 'モーニング娘。', 'idol')
ON CONFLICT (name, COALESCE(group_name, '')) DO NOTHING;

-- ===========================================
-- アンジュルム
-- ===========================================
INSERT INTO oshis (name, group_name, category) VALUES
  ('アンジュルム', NULL, 'idol'),
  ('上國料萌衣', 'アンジュルム', 'idol'),
  ('川村文乃', 'アンジュルム', 'idol'),
  ('伊勢鈴蘭', 'アンジュルム', 'idol'),
  ('橋迫鈴', 'アンジュルム', 'idol'),
  ('川名凜', 'アンジュルム', 'idol'),
  ('為永幸音', 'アンジュルム', 'idol'),
  ('松本わかな', 'アンジュルム', 'idol'),
  ('平山遊季', 'アンジュルム', 'idol')
ON CONFLICT (name, COALESCE(group_name, '')) DO NOTHING;

-- ===========================================
-- Juice=Juice
-- ===========================================
INSERT INTO oshis (name, group_name, category) VALUES
  ('Juice=Juice', NULL, 'idol'),
  ('段原瑠々', 'Juice=Juice', 'idol'),
  ('井上玲音', 'Juice=Juice', 'idol'),
  ('工藤由愛', 'Juice=Juice', 'idol'),
  ('松永里愛', 'Juice=Juice', 'idol'),
  ('入江里咲', 'Juice=Juice', 'idol'),
  ('江端妃咲', 'Juice=Juice', 'idol'),
  ('遠藤彩加里', 'Juice=Juice', 'idol'),
  ('石山咲良', 'Juice=Juice', 'idol')
ON CONFLICT (name, COALESCE(group_name, '')) DO NOTHING;

-- ===========================================
-- つばきファクトリー
-- ===========================================
INSERT INTO oshis (name, group_name, category) VALUES
  ('つばきファクトリー', NULL, 'idol'),
  ('谷本安美', 'つばきファクトリー', 'idol'),
  ('岸本ゆめの', 'つばきファクトリー', 'idol'),
  ('浅倉樹々', 'つばきファクトリー', 'idol'),
  ('小野瑞歩', 'つばきファクトリー', 'idol'),
  ('秋山眞緒', 'つばきファクトリー', 'idol'),
  ('河西結心', 'つばきファクトリー', 'idol'),
  ('八木栞', 'つばきファクトリー', 'idol'),
  ('福田真琳', 'つばきファクトリー', 'idol'),
  ('豫風瑠乃', 'つばきファクトリー', 'idol')
ON CONFLICT (name, COALESCE(group_name, '')) DO NOTHING;

-- ===========================================
-- BEYOOOOONDS
-- ===========================================
INSERT INTO oshis (name, group_name, category) VALUES
  ('BEYOOOOONDS', NULL, 'idol'),
  ('一岡伶奈', 'BEYOOOOONDS', 'idol'),
  ('島倉りか', 'BEYOOOOONDS', 'idol'),
  ('西田汐里', 'BEYOOOOONDS', 'idol'),
  ('江口紗耶', 'BEYOOOOONDS', 'idol'),
  ('高瀬くるみ', 'BEYOOOOONDS', 'idol'),
  ('前田こころ', 'BEYOOOOONDS', 'idol'),
  ('山﨑夢羽', 'BEYOOOOONDS', 'idol'),
  ('岡村美波', 'BEYOOOOONDS', 'idol'),
  ('清野桃々姫', 'BEYOOOOONDS', 'idol'),
  ('平井美葉', 'BEYOOOOONDS', 'idol'),
  ('小林萌花', 'BEYOOOOONDS', 'idol'),
  ('里吉うたの', 'BEYOOOOONDS', 'idol')
ON CONFLICT (name, COALESCE(group_name, '')) DO NOTHING;

-- ===========================================
-- OCHA NORMA
-- ===========================================
INSERT INTO oshis (name, group_name, category) VALUES
  ('OCHA NORMA', NULL, 'idol'),
  ('斉藤円香', 'OCHA NORMA', 'idol'),
  ('広本瑠璃', 'OCHA NORMA', 'idol'),
  ('石栗奏美', 'OCHA NORMA', 'idol'),
  ('西﨑美空', 'OCHA NORMA', 'idol'),
  ('田代すみれ', 'OCHA NORMA', 'idol'),
  ('中山夏月姫', 'OCHA NORMA', 'idol'),
  ('窪田七海', 'OCHA NORMA', 'idol'),
  ('北原もも', 'OCHA NORMA', 'idol'),
  ('筒井澪心', 'OCHA NORMA', 'idol'),
  ('田辺奈菜美', 'OCHA NORMA', 'idol')
ON CONFLICT (name, COALESCE(group_name, '')) DO NOTHING;

-- ===========================================
-- ロージークロニクル
-- ===========================================
INSERT INTO oshis (name, group_name, category) VALUES
  ('ロージークロニクル', NULL, 'idol')
ON CONFLICT (name, COALESCE(group_name, '')) DO NOTHING;
-- ※ メンバーは公式サイトで確認後、追加してください
