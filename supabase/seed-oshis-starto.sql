-- STARTO ENTERTAINMENT シードデータ
-- 実行方法: Supabase Dashboard > SQL Editor で実行
-- ※ 事前に 20260409_add_oshi_unique_index.sql を実行しておくこと

-- ===========================================
-- 嵐（活動休止中）
-- ===========================================
INSERT INTO oshis (name, group_name, category) VALUES
  ('嵐', NULL, 'idol'),
  ('大野智', '嵐', 'idol'),
  ('櫻井翔', '嵐', 'idol'),
  ('相葉雅紀', '嵐', 'idol'),
  ('二宮和也', '嵐', 'idol'),
  ('松本潤', '嵐', 'idol')
ON CONFLICT (name, COALESCE(group_name, '')) DO NOTHING;

-- ===========================================
-- TOKIO
-- ===========================================
INSERT INTO oshis (name, group_name, category) VALUES
  ('TOKIO', NULL, 'idol'),
  ('城島茂', 'TOKIO', 'idol'),
  ('国分太一', 'TOKIO', 'idol'),
  ('松岡昌宏', 'TOKIO', 'idol')
ON CONFLICT (name, COALESCE(group_name, '')) DO NOTHING;

-- ===========================================
-- KinKi Kids
-- ===========================================
INSERT INTO oshis (name, group_name, category) VALUES
  ('KinKi Kids', NULL, 'idol'),
  ('堂本光一', 'KinKi Kids', 'idol'),
  ('堂本剛', 'KinKi Kids', 'idol')
ON CONFLICT (name, COALESCE(group_name, '')) DO NOTHING;

-- ===========================================
-- SUPER EIGHT（旧 関ジャニ∞）
-- ===========================================
INSERT INTO oshis (name, group_name, category) VALUES
  ('SUPER EIGHT', NULL, 'idol'),
  ('横山裕', 'SUPER EIGHT', 'idol'),
  ('村上信五', 'SUPER EIGHT', 'idol'),
  ('丸山隆平', 'SUPER EIGHT', 'idol'),
  ('安田章大', 'SUPER EIGHT', 'idol'),
  ('大倉忠義', 'SUPER EIGHT', 'idol')
ON CONFLICT (name, COALESCE(group_name, '')) DO NOTHING;

-- ===========================================
-- KAT-TUN
-- ===========================================
INSERT INTO oshis (name, group_name, category) VALUES
  ('KAT-TUN', NULL, 'idol'),
  ('亀梨和也', 'KAT-TUN', 'idol'),
  ('上田竜也', 'KAT-TUN', 'idol'),
  ('中丸雄一', 'KAT-TUN', 'idol')
ON CONFLICT (name, COALESCE(group_name, '')) DO NOTHING;

-- ===========================================
-- Hey! Say! JUMP
-- ===========================================
INSERT INTO oshis (name, group_name, category) VALUES
  ('Hey! Say! JUMP', NULL, 'idol'),
  ('山田涼介', 'Hey! Say! JUMP', 'idol'),
  ('知念侑李', 'Hey! Say! JUMP', 'idol'),
  ('中島裕翔', 'Hey! Say! JUMP', 'idol'),
  ('有岡大貴', 'Hey! Say! JUMP', 'idol'),
  ('高木雄也', 'Hey! Say! JUMP', 'idol'),
  ('伊野尾慧', 'Hey! Say! JUMP', 'idol'),
  ('八乙女光', 'Hey! Say! JUMP', 'idol'),
  ('薮宏太', 'Hey! Say! JUMP', 'idol')
ON CONFLICT (name, COALESCE(group_name, '')) DO NOTHING;

-- ===========================================
-- Kis-My-Ft2
-- ===========================================
INSERT INTO oshis (name, group_name, category) VALUES
  ('Kis-My-Ft2', NULL, 'idol'),
  ('藤ヶ谷太輔', 'Kis-My-Ft2', 'idol'),
  ('玉森裕太', 'Kis-My-Ft2', 'idol'),
  ('宮田俊哉', 'Kis-My-Ft2', 'idol'),
  ('横尾渉', 'Kis-My-Ft2', 'idol'),
  ('二階堂高嗣', 'Kis-My-Ft2', 'idol'),
  ('千賀健永', 'Kis-My-Ft2', 'idol')
ON CONFLICT (name, COALESCE(group_name, '')) DO NOTHING;

-- ===========================================
-- timelesz（旧 Sexy Zone）
-- ===========================================
INSERT INTO oshis (name, group_name, category) VALUES
  ('timelesz', NULL, 'idol'),
  ('菊池風磨', 'timelesz', 'idol'),
  ('松島聡', 'timelesz', 'idol')
ON CONFLICT (name, COALESCE(group_name, '')) DO NOTHING;

-- ===========================================
-- A.B.C-Z
-- ===========================================
INSERT INTO oshis (name, group_name, category) VALUES
  ('A.B.C-Z', NULL, 'idol'),
  ('橋本良亮', 'A.B.C-Z', 'idol'),
  ('戸塚祥太', 'A.B.C-Z', 'idol'),
  ('五関晃一', 'A.B.C-Z', 'idol'),
  ('塚田僚一', 'A.B.C-Z', 'idol')
ON CONFLICT (name, COALESCE(group_name, '')) DO NOTHING;

-- ===========================================
-- King & Prince
-- ===========================================
INSERT INTO oshis (name, group_name, category) VALUES
  ('King & Prince', NULL, 'idol'),
  ('永瀬廉', 'King & Prince', 'idol'),
  ('髙橋海人', 'King & Prince', 'idol')
ON CONFLICT (name, COALESCE(group_name, '')) DO NOTHING;

-- ===========================================
-- SixTONES
-- ===========================================
INSERT INTO oshis (name, group_name, category) VALUES
  ('SixTONES', NULL, 'idol'),
  ('ジェシー', 'SixTONES', 'idol'),
  ('京本大我', 'SixTONES', 'idol'),
  ('松村北斗', 'SixTONES', 'idol'),
  ('髙地優吾', 'SixTONES', 'idol'),
  ('森本慎太郎', 'SixTONES', 'idol'),
  ('田中樹', 'SixTONES', 'idol')
ON CONFLICT (name, COALESCE(group_name, '')) DO NOTHING;

-- ===========================================
-- Snow Man
-- ===========================================
INSERT INTO oshis (name, group_name, category) VALUES
  ('Snow Man', NULL, 'idol'),
  ('岩本照', 'Snow Man', 'idol'),
  ('深澤辰哉', 'Snow Man', 'idol'),
  ('ラウール', 'Snow Man', 'idol'),
  ('渡辺翔太', 'Snow Man', 'idol'),
  ('向井康二', 'Snow Man', 'idol'),
  ('阿部亮平', 'Snow Man', 'idol'),
  ('目黒蓮', 'Snow Man', 'idol'),
  ('宮舘涼太', 'Snow Man', 'idol'),
  ('佐久間大介', 'Snow Man', 'idol')
ON CONFLICT (name, COALESCE(group_name, '')) DO NOTHING;

-- ===========================================
-- なにわ男子
-- ===========================================
INSERT INTO oshis (name, group_name, category) VALUES
  ('なにわ男子', NULL, 'idol'),
  ('西畑大吾', 'なにわ男子', 'idol'),
  ('大西流星', 'なにわ男子', 'idol'),
  ('道枝駿佑', 'なにわ男子', 'idol'),
  ('高橋恭平', 'なにわ男子', 'idol'),
  ('長尾謙杜', 'なにわ男子', 'idol'),
  ('藤原丈一郎', 'なにわ男子', 'idol'),
  ('大橋和也', 'なにわ男子', 'idol')
ON CONFLICT (name, COALESCE(group_name, '')) DO NOTHING;

-- ===========================================
-- Travis Japan
-- ===========================================
INSERT INTO oshis (name, group_name, category) VALUES
  ('Travis Japan', NULL, 'idol'),
  ('宮近海斗', 'Travis Japan', 'idol'),
  ('中村海人', 'Travis Japan', 'idol'),
  ('七五三掛龍也', 'Travis Japan', 'idol'),
  ('川島如恵留', 'Travis Japan', 'idol'),
  ('吉澤閑也', 'Travis Japan', 'idol'),
  ('松田元太', 'Travis Japan', 'idol'),
  ('松倉海斗', 'Travis Japan', 'idol')
ON CONFLICT (name, COALESCE(group_name, '')) DO NOTHING;

-- ===========================================
-- Aぇ! group
-- ===========================================
INSERT INTO oshis (name, group_name, category) VALUES
  ('Aぇ! group', NULL, 'idol'),
  ('小島健', 'Aぇ! group', 'idol'),
  ('草間リチャード敬太', 'Aぇ! group', 'idol'),
  ('福本大晴', 'Aぇ! group', 'idol'),
  ('佐野晶哉', 'Aぇ! group', 'idol'),
  ('末澤誠也', 'Aぇ! group', 'idol'),
  ('正門良規', 'Aぇ! group', 'idol')
ON CONFLICT (name, COALESCE(group_name, '')) DO NOTHING;
