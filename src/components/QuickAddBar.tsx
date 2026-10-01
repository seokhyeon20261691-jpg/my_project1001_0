import React, { useState, useMemo } from 'react';
import { CornerDownLeft, SlidersHorizontal, Check, Zap } from 'lucide-react';
import { Transaction } from '../types/ledger';
import { parseNaturalLanguageInput } from '../utils/naturalLanguageParser';
import { CATEGORIES } from '../utils/categoryClassifier';
import { formatKRW } from './MonochromeCharts';

interface QuickAddBarProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onOpenDetailedModal: () => void;
}

export const QuickAddBar: React.FC<QuickAddBarProps> = ({
  onAddTransaction,
  onOpenDetailedModal,
}) => {
  const [text, setText] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const parsed = useMemo(() => {
    if (!text.trim()) return null;
    return parseNaturalLanguageInput(text);
  }, [text]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsed || !parsed.amount || parsed.amount <= 0) {
      alert('금액을 입력해주세요. (예: 스타벅스 4500원, 점심 9000원)');
      return;
    }

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    onAddTransaction({
      date: parsed.date,
      time: currentTime,
      type: parsed.type,
      amount: parsed.amount,
      description: parsed.description,
      category: parsed.category as any,
      paymentMethod: parsed.paymentMethod,
      autoClassified: true,
      memo: parsed.matchedKeyword ? `자동분류: ${parsed.matchedKeyword}` : undefined,
    });

    setText('');
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 2000);
  };

  const matchedCatDef = parsed ? CATEGORIES[parsed.category as keyof typeof CATEGORIES] : null;

  return (
    <div className="border border-neutral-800 bg-neutral-950/80 rounded-2xl p-4 sm:p-5 relative shadow-sm">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-white tracking-wide">
            빠른 입력
          </span>
        </div>
        <button
          type="button"
          onClick={onOpenDetailedModal}
          className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>직접 입력</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="예: 스타벅스 4500원, 버거킹 8900원, 월급 300만원"
              className="w-full bg-black border border-neutral-700/80 rounded-xl text-white placeholder-neutral-600 px-4 py-2.5 text-sm focus:outline-none focus:border-neutral-400 transition-colors"
            />
            {text && (
              <button
                type="button"
                onClick={() => setText('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!parsed || !parsed.amount}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              parsed && parsed.amount
                ? 'bg-white text-black hover:bg-neutral-200 cursor-pointer shadow-md'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
            }`}
          >
            <span>기록</span>
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live Auto-Categorization preview */}
        {parsed && text.trim().length > 0 && (
          <div className="mt-2.5 p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-wrap items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">분류:</span>
              <span className="font-bold text-white bg-black px-2 py-0.5 rounded-lg border border-neutral-700">
                {matchedCatDef?.name || '기타'}
              </span>
              <span
                className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                  parsed.type === 'expense'
                    ? 'text-rose-400 bg-rose-500/10'
                    : 'text-emerald-400 bg-emerald-500/10'
                }`}
              >
                {parsed.type === 'expense' ? '지출' : '수입'}
              </span>
            </div>

            <div className="flex items-center gap-3 font-mono">
              {parsed.amount ? (
                <span>
                  금액:{' '}
                  <strong className={parsed.type === 'expense' ? 'text-rose-400' : 'text-emerald-400'}>
                    {formatKRW(parsed.amount)}
                  </strong>
                </span>
              ) : (
                <span className="text-neutral-500">금액 미입력</span>
              )}
              <span className="text-neutral-600">·</span>
              <span className="text-neutral-400">{parsed.date}</span>
            </div>
          </div>
        )}
      </form>

      {/* Success Notification */}
      {showSuccessToast && (
        <div className="absolute top-3 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-400 text-black rounded-xl text-xs font-bold shadow-lg">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
          <span>기록되었습니다</span>
        </div>
      )}
    </div>
  );
};
