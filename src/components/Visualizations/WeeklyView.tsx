import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Transaction } from '../../types/ledger';
import { CATEGORIES } from '../../utils/categoryClassifier';
import { formatKRW, MonochromeBarChart, BarDataPoint, MonochromeDonutChart, DonutDataPoint } from '../MonochromeCharts';

interface WeeklyViewProps {
  transactions: Transaction[];
  currentDate: string;
  onDateChange: (date: string) => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const WeeklyView: React.FC<WeeklyViewProps> = ({
  transactions,
  currentDate,
  onDateChange,
}) => {
  const { weekStart, weekEnd, daysOfWeek } = useMemo(() => {
    const cur = new Date(currentDate);
    const day = cur.getDay();
    const diffToMon = day === 0 ? -6 : 1 - day;

    const mon = new Date(cur);
    mon.setDate(cur.getDate() + diffToMon);

    const days: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(mon);
      d.setDate(mon.getDate() + i);
      days.push(d.toISOString().slice(0, 10));
    }

    return {
      weekStart: days[0],
      weekEnd: days[6],
      daysOfWeek: days,
    };
  }, [currentDate]);

  const handlePrevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    onDateChange(d.toISOString().slice(0, 10));
  };

  const handleNextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    onDateChange(d.toISOString().slice(0, 10));
  };

  const weekTransactions = useMemo(() => {
    return transactions.filter(
      (t) => t.date >= weekStart && t.date <= weekEnd
    );
  }, [transactions, weekStart, weekEnd]);

  const dayNames = ['월', '화', '수', '목', '금', '토', '일'];
  const barChartData: BarDataPoint[] = useMemo(() => {
    return daysOfWeek.map((dayDate, idx) => {
      const dayTxs = weekTransactions.filter((t) => t.date === dayDate);
      const exp = dayTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const inc = dayTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const isCurrentDay = dayDate === currentDate;

      return {
        label: `${dayNames[idx]} (${dayDate.slice(8)})`,
        value: exp,
        secondaryValue: inc,
        highlight: isCurrentDay,
      };
    });
  }, [daysOfWeek, weekTransactions, currentDate]);

  const totalExpense = weekTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = weekTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const dailyAvgExpense = Math.round(totalExpense / 7);

  const donutData: DonutDataPoint[] = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of weekTransactions) {
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
  }, [weekTransactions, totalExpense]);

  return (
    <div className="space-y-5">
      {/* Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-neutral-950/80 border border-neutral-800 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevWeek}
            className="p-1.5 rounded-xl border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-white font-mono px-2">
            {weekStart} ~ {weekEnd}
          </span>
          <button
            onClick={handleNextWeek}
            className="p-1.5 rounded-xl border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => onDateChange(new Date().toISOString().slice(0, 10))}
          className="px-3 py-1.5 text-xs rounded-xl border border-neutral-800 text-neutral-300 hover:text-white transition-colors self-start sm:self-auto"
        >
          이번 주
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 sm:p-5 rounded-2xl border border-neutral-800 bg-neutral-950">
          <div className="text-xs text-neutral-400 mb-1">주간 총 지출</div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-rose-400">
            {formatKRW(totalExpense)}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-neutral-800 bg-neutral-950">
          <div className="text-xs text-neutral-400 mb-1">일평균 지출</div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-white">
            {formatKRW(dailyAvgExpense)}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-neutral-800 bg-neutral-950">
          <div className="text-xs text-neutral-400 mb-1">주간 총 수입</div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400">
            {formatKRW(totalIncome)}
          </div>
        </div>
      </div>

      {/* 7-Day Bar Chart */}
      <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-950">
        <h3 className="text-xs font-bold text-white mb-3">
          요일별 지출 및 수입 (월 ~ 일)
        </h3>

        <MonochromeBarChart
          data={barChartData}
          height={190}
          showSecondary={true}
          primaryLegend="지출"
          secondaryLegend="수입"
        />
      </div>

      {/* Category Breakdown Donut */}
      <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-950">
        <h3 className="text-xs font-bold text-white mb-3">
          카테고리별 지출 비율
        </h3>

        <MonochromeDonutChart data={donutData} totalLabel="주간 지출" size={190} />
      </div>
    </div>
  );
};
