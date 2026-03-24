'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { EvaluationResult, verdictLabels } from '@/lib/types';

interface HistoryItem {
  id: string;
  idea: string;
  verdict: string;
  confidence: number;
  created_at: string;
  result: EvaluationResult;
}

export default function HistoryPanel() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<HistoryItem | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setHistory(data);
    }
    setLoading(false);
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'proceed': return 'text-emerald-600 bg-emerald-50';
      case 'refine': return 'text-amber-600 bg-amber-50';
      case 'drop': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="card p-4">
        <div className="flex items-center justify-center h-20">
          <div className="w-5 h-5 border-2 border-gray-200 border-t-slate-900 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-gray-900">历史记录</span>
          </div>
          {history.length > 0 && (
            <span className="text-xs text-gray-400">{history.length} 条</span>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">登录后查看历史</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className="w-full text-left p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getVerdictColor(item.verdict)}`}>
                    {verdictLabels[item.verdict]?.text || item.verdict}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(item.created_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">{item.idea.slice(0, 50)}...</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelected(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-auto p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-gray-900">评估详情</h4>
              <button 
                onClick={() => setSelected(null)} 
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className={`p-4 rounded-xl mb-4 ${getVerdictColor(selected.verdict)}`}>
              <p className="font-semibold">{verdictLabels[selected.verdict]?.text}</p>
              <p className="text-sm opacity-70 mt-1">信心指数 {selected.confidence}%</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 leading-relaxed">{selected.idea}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
