# 创业决策引擎 - Founder Decision Engine

基于YC和中文投资视角的创业项目评估工具

## 技术栈

- **前端**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: Supabase (PostgreSQL + Auth)
- **部署**: Vercel
- **AI模型**: Kimi (Moonshot AI)

## 功能特性

- [x] 创业项目快速评估
- [x] YC投资框架评估（市场规模、团队契合、护城河、问题紧迫性）
- [x] 中文投资视角补充（政策风险、本土化、流量获取、竞争格局）
- [x] 3档决策建议：继续推进 / 需要优化 / 建议放弃
- [x] 机会评分与信心指数
- [x] 优势、风险、行动建议
- [x] 7天验证计划
- [ ] 用户历史记录（Supabase）
- [ ] 付费高级评估

## 本地开发

```bash
# 克隆项目
git clone https://github.com/yourusername/founder-decision-cn.git
cd founder-decision-cn

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入你的 API keys

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

## 环境变量

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI API (Kimi)
KIMI_API_KEY=your_kimi_api_key

# 或者使用 OpenAI
# OPENAI_API_KEY=your_openai_api_key
```

## 部署到 Vercel

1. Fork 这个仓库到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 部署

## 数据库表结构

```sql
-- 评估历史
CREATE TABLE evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  idea TEXT NOT NULL,
  stage TEXT,
  need TEXT,
  result JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 用户反馈
CREATE TABLE feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  evaluation_id UUID REFERENCES evaluations(id),
  helpful BOOLEAN,
  feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 评估框架

### YC视角
1. **市场规模 (Market Size)**: 能否支撑10亿美元公司
2. **创始人-市场契合 (Founder-Market Fit)**: 团队是否有独特优势
3. **护城河 (Defensibility)**: 凭什么能赢，壁垒是什么
4. **问题紧迫性 (Problem Urgency)**: 用户现在就要解决，还是可以等

### 中文投资视角
1. **政策风险**: 监管环境、合规要求
2. **本土化需求**: 相比海外方案，是否需要重做
3. **流量获取**: 中国市场的获客成本和渠道
4. **竞争格局**: BAT/字节/美团等巨头是否在做
5. **变现路径**: 中国用户的付费意愿和习惯

## 许可证

MIT
