import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { idea, stage, need } = await request.json();

    if (!idea || idea.trim().length < 10) {
      return NextResponse.json(
        { error: '请至少输入10个字的描述' },
        { status: 400 }
      );
    }

    const apiKey = process.env.KIMI_API_KEY;
    if (!apiKey) {
      console.error('KIMI_API_KEY not configured');
      return NextResponse.json(
        { error: '服务配置错误，请联系管理员' },
        { status: 500 }
      );
    }

    const prompt = `你是一位资深创业投资人和 YC 合伙人。请基于以下框架评估这个创业想法：

## YC 核心评估标准
1. 市场规模（TAM）：是否足够大，能否支持独角兽
2. 创始人-市场契合度：创始人是否有独特优势做这件事
3. 竞争壁垒：为什么是你而不是别人
4. 商业模式：如何赚钱，单位经济模型是否健康

## 中国投资环境额外考量
- 政策合规性（数据、牌照、外资限制）
- 本地化需求强度
- 渠道获客成本
- 退出路径（IPO/并购）

## 用户输入
创业想法：${idea}
当前阶段：${stage || '未说明'}
核心需求：${need || '未说明'}

## 输出格式（JSON）
{
  "verdict": "proceed" | "refine" | "drop",
  "confidence": 75,
  "opportunityScore": 68,
  "strengths": ["优势1", "优势2", "优势3"],
  "risks": ["风险1", "风险2", "风险3"],
  "actions": ["行动建议1", "行动建议2", "行动建议3"],
  "sprint": ["Day1任务", "Day2任务", "Day3任务", "Day4任务", "Day5任务", "Day6任务", "Day7任务"],
  "reasoning": "总体评估理由，100字以内"
}

verdict 说明：
- proceed: 方向正确，建议继续推进
- refine: 有潜力但需要调整方向或定位
- drop: 建议放弃，寻找新方向

请只返回 JSON，不要其他文字。`;

    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'moonshot-v1-8k',
        messages: [
          { role: 'system', content: '你是一个专业的创业投资评估助手，基于 YC 和中国投资视角给出建议。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Kimi API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'AI 服务暂时不可用，请稍后重试' },
        { status: 503 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'AI 返回数据异常' },
        { status: 500 }
      );
    }

    // 解析 JSON
    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = JSON.parse(content);
      }
    } catch (e) {
      console.error('JSON parse error:', e, 'Content:', content);
      return NextResponse.json(
        { error: 'AI 返回格式异常，请重试' },
        { status: 500 }
      );
    }

    // 验证返回格式
    if (!result.verdict || !result.strengths || !result.risks) {
      return NextResponse.json(
        { error: 'AI 返回数据不完整' },
        { status: 500 }
      );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
