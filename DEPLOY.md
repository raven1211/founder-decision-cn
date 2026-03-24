# Vercel 部署指南

## 1. 准备 Supabase

1. 访问 [supabase.com](https://supabase.com) 创建项目
2. 在 SQL Editor 中执行 `supabase/schema.sql` 创建表
3. 获取 `Project URL` 和 `anon public` API Key

## 2. 准备 Kimi API Key

1. 访问 [platform.moonshot.cn](https://platform.moonshot.cn)
2. 创建 API Key

## 3. 部署到 Vercel

### 方式A：一键部署（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### 方式B：命令行

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

## 4. 配置环境变量

在 Vercel Dashboard → Project Settings → Environment Variables 中添加：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
KIMI_API_KEY=your_kimi_api_key
```

## 5. 重新部署

添加环境变量后，Vercel 会自动重新部署。

或者手动触发：
```bash
vercel --prod
```

## 6. 验证部署

访问部署后的 URL，测试：
1. 首页是否正常显示
2. 输入创业想法是否能获得评估
3. 登录后历史记录是否正常
