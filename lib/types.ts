export interface EvaluationResult {
  verdict: 'proceed' | 'refine' | 'drop';
  confidence: number;
  opportunityScore: number;
  strengths: string[];
  risks: string[];
  actions: string[];
  sprint: string[];
  reasoning: string;
}

// 简洁白底风格
export const verdictLabels: Record<string, { text: string; color: string; bg: string }> = {
  proceed: {
    text: '继续推进',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-100'
  },
  refine: {
    text: '需要优化',
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-100'
  },
  drop: {
    text: '建议放弃',
    color: 'text-red-500',
    bg: 'bg-red-50 border-red-100'
  }
};
