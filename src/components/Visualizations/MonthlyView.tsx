import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Transaction } from '../../types/ledger';
import { CATEGORIES } from '../../utils/categoryClassifier';
import { formatKRW, MonochromeBarChart, BarDataPoint, MonochromeDonutChart, DonutDataPoint, MonochromeHorizontalBar } from '../MonochromeCharts';

interface MonthlyViewProps {
  transactions: Transaction[];
  currentMonth: string; // YYYY-MM
  onMonthChange: (month: string) => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const MonthlyView: React.FC<MonthlyViewProps> = ({
  transactions,
  currentMonth,
  onMonthChange,
}) => {
  const handlePrevMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const newMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    onMonthChange(newMonth);
  };

  const handleNextMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    const newMonth = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
    onMonthChange(newMonth);
  };

  const handleCurrentMonth = () => {
    onMonthChange(new Date().toISOString().slice(0, 7));
  };

  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(currentMonth));
  }, [transactions, currentMonth]);

  const totalExpense = useMemo(() => {
    return monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const totalIncome = useMemo(() => {
    return monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const netSavings = totalIncome - totalExpense;

  const daysInMonthCount = useMemo(() => {
    const [y, m] = currentMonth.split('-').map(Number);
    return new Date(y, m, 0).getDate();
  }, [currentMonth]);

  const dailyBarData: BarDataPoint[] = useMemo(() => {
    const map: Record<number, number> = {};
    for (let i = 1; i <= daysInMonthCount; i++) {
      map[i] = 0;
    }

    for (const t of monthTransactions) {
      if (t.type === 'expense') {
        const dayNum = parseInt(t.date.slice(8, 10), 10);
        map[dayNum] = (map[dayNum] || 0) + t.amount;
      }
    }

    let maxVal = 0;
    let maxDay = -1;
    for (const [day, val] of Object.entries(map)) {
      if (val > maxVal) {
        maxVal = val;
        maxDay = Number(day);
      }
    }

    return Object.entries(map).map(([day, val]) => ({
      label: `${day}일`,
      value: val,
      highlight: Number(day) === maxDay && val > 0,
    }));
  }, [monthTransactions, daysInMonthCount]);

  const donutData: DonutDataPoint[] = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of monthTransactions) {
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
  }, [monthTransactions, totalExpense]);

  const paymentBreakdown = useMemo(() => {
    const map: Record<string, number> = {
      credit_card: 0,
      check_card: 0,
      cash: 0,
      transfer: 0,
    };
    for (const t of monthTransactions) {
      if (t.type === 'expense') {
        map[t.paymentMethod] = (map[t.paymentMethod] || 0) + t.amount;
      }
    }
    const labels: Record<string, string> = {
      credit_card: '신용카드',
      check_card: '체크카드',
      cash: '현금',
      transfer: '계좌이체',
    };
    return Object.entries(map).map(([k, v]) => ({
      key: k,
      label: labels[k],
      value: v,
      ratio: totalExpense > 0 ? ((v / totalExpense) * 100).toFixed(0) + '%' : '0%',
    }));
  }, [monthTransactions, totalExpense]);

  const [yearStr, monthNumStr] = currentMonth.split('-');

  return (
    <div className="space-y-5">
      {/* Month Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-neutral-950/80 border border-neutral-800 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-base font-bold text-white px-2">
            {yearStr}년 {parseInt(monthNumStr, 10)}월
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleCurrentMonth}
          className="px-3 py-1.5 text-xs rounded-xl border border-neutral-800 text-neutral-300 hover:text-white transition-colors self-start sm:self-auto"
        >
          이번 달
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 sm:p-5 rounded-2xl border border-neutral-800 bg-neutral-950">
          <div className="text-xs text-neutral-400 mb-1">월간 지출</div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-rose-400">
            {formatKRW(totalExpense)}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-neutral-800 bg-neutral-950">
          <div className="text-xs text-neutral-400 mb-1">월간 수입</div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400">
            {formatKRW(totalIncome)}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-neutral-800 bg-neutral-950">
          <div className="text-xs text-neutral-400 mb-1">순 잔액 (저축)</div>
          <div className={`text-2xl sm:text-3xl font-mono font-bold ${netSavings >= 0 ? 'text-white' : 'text-rose-400'}`}>
            {formatKRW(netSavings)}
          </div>
        </div>
      </div>

      {/* 30-Day Spending Timeline Chart */}
      <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-950">
        <h3 className="text-xs font-bold text-white mb-3">
          일자별 지출 추이
        </h3>

        <MonochromeBarChart
          data={dailyBarData}
          height={170}
          primaryLegend="지출"
        />
      </div>

      {/* Category Donut & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category Breakdown */}
        <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-950">
          <h3 className="text-xs font-bold text-white mb-3">
            카테고리별 지출
          </h3>
          <MonochromeDonutChart data={donutData} totalLabel="월간 지출" size={190} />
        </div>

        {/* Payment Method Distribution */}
        <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-950">
          <h3 className="text-xs font-bold text-white mb-3">
            결제 수단별 분포
          </h3>

          <div className="space-y-3 pt-2">
            {paymentBreakdown.map((pm) => (
              <MonochromeHorizontalBar
                key={pm.key}
                label={pm.label}
                value={pm.value}
                max={totalExpense}
                ratio={pm.ratio}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
