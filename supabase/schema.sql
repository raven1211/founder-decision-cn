-- Supabase 数据库表结构

-- 评估历史表
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  idea TEXT NOT NULL,
  stage TEXT,
  need TEXT,
  verdict TEXT NOT NULL,
  confidence INTEGER,
  opportunity_score INTEGER,
  result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS (Row Level Security)
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能看到自己的评估
CREATE POLICY "Users can only see own evaluations" ON evaluations
  FOR ALL USING (auth.uid() = user_id);

-- 反馈表
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE,
  helpful BOOLEAN,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see own feedback" ON feedback
  FOR ALL USING (auth.uid() IN (
    SELECT user_id FROM evaluations WHERE id = evaluation_id
  ));

-- 预约咨询表
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  amount INTEGER DEFAULT 0,
  message TEXT,
  status TEXT DEFAULT 'pending',
  google_event_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 只有管理员可以查看预约（通过 service role）
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert" ON bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select for authenticated" ON bookings
  FOR SELECT USING (auth.role() = 'authenticated');
