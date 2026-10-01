import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, Plus, Edit2, Trash2 } from 'lucide-react';
import { Transaction } from '../../types/ledger';
import { CATEGORIES } from '../../utils/categoryClassifier';
import { formatKRW, MonochromeDonutChart, DonutDataPoint } from '../MonochromeCharts';

interface DailyViewProps {
  transactions: Transaction[];
  currentDate: string; // YYYY-MM-DD
  onDateChange: (date: string) => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenNewModal: () => void;
}

export const DailyView: React.FC<DailyViewProps> = ({
  transactions,
  currentDate,
  onDateChange,
  onEditTransaction,
  onDeleteTransaction,
  onOpenNewModal,
}) => {
  const handlePrevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().slice(0, 10));
  };

  const handleNextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().slice(0, 10));
  };

  const handleToday = () => {
    onDateChange(new Date().toISOString().slice(0, 10));
  };

  const dayTransactions = useMemo(() => {
    return transactions
      .filter((t) => t.date === currentDate)
      .sort((a, b) => (b.time || '00:00').localeCompare(a.time || '00:00'));
  }, [transactions, currentDate]);

  const totalExpense = dayTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = dayTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const timeSlots = useMemo(() => {
    const slots = [
      { name: '오전 (06~12시)', start: 6, end: 12, amount: 0 },
      { name: '오후 (12~18시)', start: 12, end: 18, amount: 0 },
      { name: '저녁 (18~24시)', start: 18, end: 24, amount: 0 },
      { name: '심야 (00~06시)', start: 0, end: 6, amount: 0 },
    ];

    for (const t of dayTransactions) {
      if (t.type === 'expense') {
        const hour = t.time ? parseInt(t.time.split(':')[0], 10) : 12;
        const matched = slots.find((s) => hour >= s.start && hour < s.end);
        if (matched) {
          matched.amount += t.amount;
        }
      }
    }
    return slots;
  }, [dayTransactions]);

  const donutData: DonutDataPoint[] = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of dayTransactions) {
      if (t.type === 'expense') {
        map[t.category] = (map[t.category] || 0) + t.amount;
      }
    }
    return Object.entries(map).map(([catId, amount]) => ({
      id: catId,
      label: CATEGORIES[catId as keyof typeof CATEGORIES]?.name || catId,
      value: amount,
      percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
    })).sort((a, b) => b.value - a.value);
  }, [dayTransactions, totalExpense]);

  const dObj = new Date(currentDate);
  const dayOfWeek = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'][dObj.getDay()];

  return (
    <div className="space-y-5">
      {/* Date Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-neutral-950/80 border border-neutral-800 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevDay}
            className="p-1.5 rounded-xl border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={currentDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-black border border-neutral-700 rounded-xl px-3 py-1 text-sm font-bold text-white focus:outline-none"
            />
            <span className="text-xs text-neutral-400">
              {dayOfWeek}
            </span>
          </div>
          <button
            onClick={handleNextDay}
            className="p-1.5 rounded-xl border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-xs rounded-xl border border-neutral-800 text-neutral-300 hover:text-white transition-colors"
          >
            오늘
          </button>
          <button
            onClick={onOpenNewModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-white text-black hover:bg-neutral-200 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>추가</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 sm:p-5 rounded-2xl border border-neutral-800 bg-neutral-950">
          <div className="text-xs text-neutral-400 mb-1">하루 지출</div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-rose-400">
            {formatKRW(totalExpense)}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-neutral-800 bg-neutral-950">
          <div className="text-xs text-neutral-400 mb-1">하루 수입</div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400">
            {formatKRW(totalIncome)}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-neutral-800 bg-neutral-950">
          <div className="text-xs text-neutral-400 mb-1">순 잔여액</div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-white">
            {formatKRW(netBalance)}
          </div>
        </div>
      </div>

      {/* Time Slot & Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Time slot breakdown */}
        <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-neutral-800/80">
            <Clock className="w-4 h-4 text-neutral-300" />
            <h3 className="text-xs font-bold text-white">
              시간대별 지출
            </h3>
          </div>

          <div className="space-y-3.5">
            {timeSlots.map((slot, idx) => {
              const percent = totalExpense > 0 ? (slot.amount / totalExpense) * 100 : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-300">{slot.name}</span>
                    <span className="text-rose-400 font-mono font-bold">
                      {formatKRW(slot.amount)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-400 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-950">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-800/80">
            <h3 className="text-xs font-bold text-white">
              카테고리별 지출
            </h3>
          </div>

          <MonochromeDonutChart data={donutData} totalLabel="당일 지출" size={180} />
        </div>
      </div>

      {/* Day Transaction List */}
      <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-950">
        <h3 className="text-xs font-bold text-white mb-3 pb-2 border-b border-neutral-800/80">
          {currentDate} 내역 ({dayTransactions.length}건)
        </h3>

        {dayTransactions.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 text-xs">
            기록된 내역이 없습니다.
          </div>
        ) : (
          <div className="divide-y divide-neutral-900">
            {dayTransactions.map((tx) => {
              const cat = CATEGORIES[tx.category];
              return (
                <div
                  key={tx.id}
                  className="py-2.5 flex items-center justify-between hover:bg-neutral-900/50 px-2 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 font-mono text-xs text-neutral-500">
                      {tx.time || '12:00'}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {tx.description}
                      </div>
                      <div className="text-xs text-neutral-400 mt-0.5">
                        <span>{cat?.name || tx.category}</span>
                        {tx.memo && <span className="text-neutral-500 ml-2">{tx.memo}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`font-mono font-bold text-sm ${
                        tx.type === 'expense' ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {tx.type === 'expense' ? '-' : '+'}
                      {formatKRW(tx.amount)}
                    </span>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditTransaction(tx)}
                        className="p-1 text-neutral-400 hover:text-white rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="p-1 text-neutral-400 hover:text-rose-400 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
