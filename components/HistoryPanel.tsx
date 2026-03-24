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

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-sm text-gray-400">加载中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">历史记录</h3>
        <span className="text-xs text-gray-400">{history.length} 条</span>
      </div>

      {history.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-400">登录后查看历史</p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelected(item)}
              className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium ${verdictLabels[item.verdict]?.color || 'text-gray-600'}`}>
                  {verdictLabels[item.verdict]?.text || item.verdict}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(item.created_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <p className="text-sm text-gray-600 truncate">{item.idea}</p>
            </button>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50"
          onClick={() => setSelected(null)}
        >
          <div 
            className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">评估详情</h4>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className={`p-4 rounded-lg mb-4 ${verdictLabels[selected.verdict]?.bg}`}>
              <p className="font-medium">{verdictLabels[selected.verdict]?.text}</p>
              <p className="text-sm text-gray-500 mt-1">信心 {selected.confidence}%</p>
            </div>

            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selected.idea}</p>
          </div>
        </div>
      )}
    </div>
  );
}
