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

const stageOptions = [
  { value: 'just_idea', label: '💡 只是想法' },
  { value: 'research', label: '🔍 做过用户调研' },
  { value: 'mvp', label: '🛠️ MVP已搭建' },
  { value: 'launched', label: '🚀 已上线有早期用户' }
];

const needOptions = [
  { value: 'clarity', label: '判断是否值得继续' },
  { value: 'positioning', label: '明确产品定位' },
  { value: 'validation', label: '设计验证方案' },
  { value: 'conversion', label: '提升转化率' }
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
      setError(err instanceof Error ? err.message : '评估失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const loadExample = (ex: typeof exampleIdeas[0]) => {
    setIdea(ex.idea);
    setResult(null);
    setError('');
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

  const getVerdictStyle = (verdict: string) => {
    switch (verdict) {
      case 'proceed': return 'verdict-proceed';
      case 'refine': return 'verdict-refine';
      case 'drop': return 'verdict-drop';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafc]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-900">创业决策引擎</h1>
              <p className="text-xs text-gray-500">YC × 中文投资视角</p>
            </div>
          </div>
          <div>
            {user ? (
              <button onClick={signOut} className="text-sm text-gray-600 hover:text-gray-900 transition">
                退出
              </button>
            ) : (
              <button onClick={signIn} className="btn-secondary text-sm">
                GitHub 登录
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero */}
            <div className="card p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">在动手之前，先验证想法值不值得做</h2>
                  <p className="text-gray-600 leading-relaxed">
                    基于 YC 投资框架和中国创业环境，AI 在 60 秒内给出决策建议：
                    <span className="font-medium text-gray-900">继续推进、需要优化、建议放弃</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-slate-900">~60秒</div>
                  <div className="text-xs text-gray-500 mt-1">快速决策</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-slate-900">3个风险</div>
                  <div className="text-xs text-gray-500 mt-1">提前预警</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-slate-900">7天计划</div>
                  <div className="text-xs text-gray-500 mt-1">行动指南</div>
                </div>
              </div>
            </div>

            {/* Examples */}
            <div className="card p-6">
              <p className="text-sm font-medium text-gray-700 mb-3">参考示例（点击快速填充）：</p>
              <div className="flex flex-wrap gap-2">
                {exampleIdeas.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => loadExample(ex)}
                    className="px-4 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition"
                  >
                    {ex.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <div className="card p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  你的创业想法
                </label>
                <textarea
                  value={idea}
                  onChange={(e) => {
                    setIdea(e.target.value);
                    setError('');
                  }}
                  placeholder="描述：目标用户是谁，解决什么问题，怎么解决..."
                  className="input-field h-32 resize-none"
                />
                <div className="flex justify-between mt-2 text-xs">
                  <span className={idea.length < 10 ? 'text-red-500 font-medium' : 'text-gray-400'}>
                    {idea.length} 字符
                  </span>
                  <span className="text-gray-400">建议包含：用户 + 问题 + 解决方案</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">当前阶段</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="input-field"
                  >
                    <option value="">选择阶段</option>
                    {stageOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">最需要什么？</label>
                  <select
                    value={need}
                    onChange={(e) => setNeed(e.target.value)}
                    className="input-field"
                  >
                    <option value="">选择需求</option>
                    {needOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleEvaluate}
                disabled={loading || idea.length < 10}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>AI 评估中...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>获取决策建议</span>
                  </>
                )}
              </button>
            </div>

            {/* Results */}
            {result && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Verdict Card */}
                <div className={`card p-6 border-2 ${getVerdictStyle(result.verdict)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium opacity-70 mb-1">评估结论</p>
                      <h3 className="text-3xl font-bold">
                        {verdictLabels[result.verdict]?.text || result.verdict}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium opacity-70 mb-1">信心指数</p>
                      <div className="text-3xl font-bold">{result.confidence}%</div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed opacity-90">{result.reasoning}</p>
                </div>

                {/* Score Bar */}
                <div className="card p-6">
                  <div className="flex justify-between text-sm mb-3">
                    <span className="font-medium text-gray-700">机会评分</span>
                    <span className="font-semibold text-gray-900">{result.opportunityScore}/100</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-900 rounded-full transition-all duration-1000"
                      style={{ width: `${result.opportunityScore}%` }}
                    />
                  </div>
                </div>

                {/* Strengths & Risks */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="card p-6">
                    <h4 className="section-title flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">+</span>
                      核心优势
                    </h4>
                    <ul className="space-y-3">
                      {result.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                          <span className="leading-relaxed">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="card p-6">
                    <h4 className="section-title flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs">−</span>
                      关键风险
                    </h4>
                    <ul className="space-y-3">
                      {result.risks.map((r, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                          <span className="leading-relaxed">{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Actions */}
                <div className="card p-6">
                  <h4 className="section-title">建议行动</h4>
                  <ol className="space-y-3">
                    {result.actions.map((a, i) => (
                      <li key={i} className="text-sm text-gray-600 flex gap-4">
                        <span className="font-medium text-slate-900 w-6">{i + 1}.</span>
                        <span className="leading-relaxed">{a}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Sprint */}
                <div className="card p-6">
                  <h4 className="section-title">7天验证计划</h4>
                  <div className="space-y-3">
                    {result.sprint.map((s, i) => (
                      <div key={i} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                        <span className="w-12 h-6 rounded bg-slate-900 text-white text-xs font-medium flex items-center justify-center shrink-0">
                          Day {i + 1}
                        </span>
                        <span className="text-sm text-gray-600 leading-relaxed">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Booking CTA */}
                <div className="card p-6 bg-slate-900 text-white border-slate-800">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">想深入聊聊这个项目？</h4>
                      <p className="text-sm text-gray-400 mb-4">
                        预约 30 分钟一对一咨询，从投资视角深度分析你的想法
                      </p>
                      <button
                        onClick={() => setShowBooking(true)}
                        className="px-6 py-2.5 bg-white text-slate-900 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
                      >
                        预约咨询 · 价格随喜
                      </button>
                    </div>
                  </div>
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
        <footer className="mt-16 pt-8 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>基于 YC 投资框架和中文投资环境 · 结果仅供参考</p>
        </footer>
      </div>

      <BookingModal isOpen={showBooking} onClose={() => setShowBooking(false)} />
    </main>
  );
}
