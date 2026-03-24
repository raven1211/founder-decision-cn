'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { EvaluationResult, verdictLabels } from '@/lib/types';
import HistoryPanel from '@/components/HistoryPanel';
import BookingModal from '@/components/BookingModal';

const exampleIdeas = [
  {
    title: 'AI SaaS 自由职业者工具',
    idea: '一个面向自由职业者的AI SaaS工具，帮助管理发票、现金流和税务。自动追踪收入支出，预测现金流缺口，生成税务报告。'
  },
  {
    title: 'AI 法律顾问',
    idea: '面向中小企业的AI法律顾问，帮助处理简单的合同审查、劳动纠纷咨询、商标注册等常见法律需求。'
  },
  {
    title: '餐厅库存预测',
    idea: '基于AI的餐厅库存预测应用，根据历史销售数据、天气、节假日等因素预测食材需求，减少浪费。'
  }
];

export default function Home() {
  const [idea, setIdea] = useState('');
  const [stage, setStage] = useState('');
  const [need, setNeed] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const handleEvaluate = async () => {
    if (idea.trim().length < 10) {
      setError('请至少输入10个字的描述');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, stage, need })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '评估失败');
      }

      setResult(data);

      if (user) {
        await supabase.from('evaluations').insert({
          user_id: user.id,
          idea,
          stage,
          need,
          verdict: data.verdict,
          confidence: data.confidence,
          opportunity_score: data.opportunityScore,
          result: data
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '评估失败');
    } finally {
      setLoading(false);
    }
  };

  const loadExample = (ex: typeof exampleIdeas[0]) => {
    setIdea(ex.idea);
    setResult(null);
  };

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.origin }
    });
    if (error) console.error('Login error:', error);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-medium tracking-tight">创业决策引擎</h1>
            <p className="text-sm text-gray-400 mt-0.5">YC & 中文投资视角</p>
          </div>
          <div>
            {user ? (
              <button
                onClick={signOut}
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                退出
              </button>
            ) : (
              <button
                onClick={signIn}
                className="text-sm px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition"
              >
                登录
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Intro */}
            <div>
              <h2 className="text-2xl font-medium mb-2">验证你的想法值不值得做</h2>
              <p className="text-gray-500 text-sm">
                基于 YC 投资框架和中国创业环境，60 秒内给出决策建议
              </p>
            </div>

            {/* Examples */}
            <div className="flex flex-wrap gap-2">
              {exampleIdeas.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => loadExample(ex)}
                  className="px-3 py-1.5 text-sm bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition"
                >
                  {ex.title}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  你的创业想法
                </label>
                <textarea
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="描述：目标用户是谁，解决什么问题，怎么解决..."
                  className="w-full h-32 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-gray-400 transition"
                />
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span className={idea.length < 10 ? 'text-red-500' : ''}>
                    {idea.length} 字符
                  </span>
                  <span>建议包含：用户 + 问题 + 解决方案</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">当前阶段</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 bg-white"
                  >
                    <option value="">选择阶段</option>
                    <option value="just_idea">只是想法</option>
                    <option value="research">做过用户调研</option>
                    <option value="mvp">MVP已搭建</option>
                    <option value="launched">已上线有早期用户</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">最需要什么？</label>
                  <select
                    value={need}
                    onChange={(e) => setNeed(e.target.value)}
                    className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 bg-white"
                  >
                    <option value="">选择需求</option>
                    <option value="clarity">判断是否值得继续</option>
                    <option value="positioning">明确产品定位</option>
                    <option value="validation">设计验证方案</option>
                    <option value="conversion">提升转化率</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
              )}

              <button
                onClick={handleEvaluate}
                disabled={loading || idea.length < 10}
                className="w-full py-3.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {loading ? '评估中...' : '获取决策建议'}
              </button>
            </div>

            {/* Results */}
            {result && (
              <div className="border-t border-gray-100 pt-8 space-y-6">
                {/* Verdict */}
                <div className={`p-6 rounded-xl border ${verdictLabels[result.verdict].bg}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">评估结论</p>
                      <h3 className={`text-2xl font-medium ${verdictLabels[result.verdict].color}`}>
                        {verdictLabels[result.verdict].text}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">信心指数</p>
                      <div className="text-2xl font-medium">{result.confidence}%</div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-600">{result.reasoning}</p>
                </div>

                {/* Score */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">机会评分</span>
                    <span className="text-gray-900 font-medium">{result.opportunityScore}/100</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-900 transition-all"
                      style={{ width: `${result.opportunityScore}%` }}
                    />
                  </div>
                </div>

                {/* Strengths & Risks */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">核心优势</h4>
                    <ul className="space-y-2">
                      {result.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start">
                          <span className="text-emerald-500 mr-2">+</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">关键风险</h4>
                    <ul className="space-y-2">
                      {result.risks.map((r, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start">
                          <span className="text-red-400 mr-2">−</span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">建议行动</h4>
                  <ol className="space-y-2">
                    {result.actions.map((a, i) => (
                      <li key={i} className="text-sm text-gray-600 flex">
                        <span className="text-gray-400 mr-3">{i + 1}.</span>
                        {a}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Sprint */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">7天验证计划</h4>
                  <ul className="space-y-3">
                    {result.sprint.map((s, i) => (
                      <li key={i} className="text-sm text-gray-600 flex">
                        <span className="text-gray-400 w-14 shrink-0">Day {i + 1}</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Booking CTA */}
                <div className="bg-gray-900 rounded-xl p-6 text-white">
                  <h4 className="font-medium mb-2">想深入聊聊这个项目？</h4>
                  <p className="text-sm text-gray-400 mb-4">
                    预约 30 分钟一对一咨询，从投资视角深度分析你的想法
                  </p>
                  <button
                    onClick={() => setShowBooking(true)}
                    className="px-6 py-2.5 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
                  >
                    预约咨询 · 价格随喜
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <HistoryPanel />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-100 text-center text-xs text-gray-400">
          <p>基于 YC 投资框架和中文投资环境 · 结果仅供参考</p>
        </footer>
      </div>

      <BookingModal isOpen={showBooking} onClose={() => setShowBooking(false)} />
    </main>
  );
}
