import { NextResponse } from 'next/server';
import { EvaluationResult } from '@/lib/types';

// 评估Prompt - 融合YC和中文投资视角
const getEvaluationPrompt = (idea: string, stage: string, need: string) => `你是一位资深投资人和创业导师，熟悉YC（Y Combinator）评估框架和中国创业投资环境。

请评估以下创业想法，给出专业、直接、可执行的建议：

【创业想法】
${idea}

【当前阶段】
${stage || '未明确'}

【最需要帮助】
${need || '全面评估'}

---

请按以下框架输出JSON格式评估结果：

{
  "verdict": "proceed|refine|drop",
  "confidence": 0-100,
  "opportunityScore": 0-100,
  "strengths": ["最突出的3个优势"],
  "risks": ["可能致命的3个风险"],
  "actions": ["接下来最好的3个行动"],
  "sprint": ["7天验证计划，每天做什么"],
  "reasoning": "简要解释为什么给出这个 verdict"
}

---

【YC视角评估维度】
1. 市场规模（Market Size）：是否足够大，能否支撑10亿美元公司
2. 创始人-市场契合（Founder-Market Fit）：团队是否有独特优势
3. 护城河（Defensibility）：凭什么能赢，壁垒是什么
4. 问题紧迫性（Problem Urgency）：用户现在就要解决，还是可以等

【中文投资视角补充】
1. 政策风险：监管环境、合规要求
2. 本土化需求：相比海外方案，是否需要重做
3. 流量获取：中国市场的获客成本和渠道
4. 竞争格局： BAT/字节/美团等巨头是否在做
5. 变现路径：中国用户的付费意愿和习惯

【Verdict标准】
- proceed：清晰的需求、可行的路径、团队有能力执行
- refine：有潜力但有明显问题需要解决
- drop：需求存疑、市场太小、或竞争格局已定

请直接输出JSON，不要有其他内容。`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idea, stage, need } = body;

    if (!idea || idea.trim().length < 10) {
      return NextResponse.json(
        { error: '请提供更详细的创业想法描述' },
        { status: 400 }
      );
    }

    const apiKey = process.env.KIMI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // 调用 Kimi API
    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'kimi-coding/k2p5',
        messages: [
          { role: 'system', content: '你是一个专业的创业投资顾问，基于YC和中国投资视角评估创业想法。只输出JSON格式。' },
          { role: 'user', content: getEvaluationPrompt(idea, stage, need) }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    // 提取JSON
    let result: EvaluationResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      // Fallback 解析
      result = parseFallback(content);
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Evaluation error:', error);
    return NextResponse.json(
      { error: '评估失败，请稍后重试' },
      { status: 500 }
    );
  }
}

function parseFallback(content: string): EvaluationResult {
  const verdict = content.includes('proceed') ? 'proceed' : 
                  content.includes('drop') ? 'drop' : 'refine';
  
  return {
    verdict,
    confidence: 70,
    opportunityScore: 65,
    strengths: ['想法有市场需求', '切入点明确', '团队有相关经验'],
    risks: ['竞争可能激烈', '获客成本不确定', '需要验证商业模式'],
    actions: ['做10个用户访谈', '验证付费意愿', '研究竞品情况'],
    sprint: ['Day 1: 列出目标用户画像', 'Day 2: 找到5个潜在用户', 'Day 3-4: 深度访谈', 'Day 5: 整理反馈', 'Day 6: 调整想法', 'Day 7: 确定是否继续'],
    reasoning: '基于描述，这个想法有一定潜力，但需要更多验证。'
  };
}
