import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Transaction } from '../../types/ledger';
import { CATEGORIES } from '../../utils/categoryClassifier';
import { formatKRW, MonochromeBarChart, BarDataPoint, MonochromeDonutChart, DonutDataPoint } from '../MonochromeCharts';

interface YearlyViewProps {
  transactions: Transaction[];
  currentYear: string;
  onYearChange: (year: string) => void;
  onSelectMonth?: (yearMonth: string) => void;
}

export const YearlyView: React.FC<YearlyViewProps> = ({
  transactions,
  currentYear,
  onYearChange,
  onSelectMonth,
}) => {
  const handlePrevYear = () => {
    onYearChange(String(Number(currentYear) - 1));
  };

  const handleNextYear = () => {
    onYearChange(String(Number(currentYear) + 1));
  };

  const handleCurrentYear = () => {
    onYearChange(new Date().toISOString().slice(0, 4));
  };

  const yearTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(currentYear));
  }, [transactions, currentYear]);

  const monthsData = useMemo(() => {
    const list = [];
    for (let m = 1; m <= 12; m++) {
      const monthPrefix = `${currentYear}-${String(m).padStart(2, '0')}`;
      const txs = yearTransactions.filter((t) => t.date.startsWith(monthPrefix));
      const exp = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const inc = txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const net = inc - exp;
      const count = txs.length;

      list.push({
        monthNum: m,
        monthStr: `${m}월`,
        yearMonth: monthPrefix,
        expense: exp,
        income: inc,
        net,
        count,
      });
    }
    return list;
  }, [yearTransactions, currentYear]);

  const barChartData: BarDataPoint[] = useMemo(() => {
    const currentMonthNum = new Date().getMonth() + 1;
    const isThisYear = currentYear === new Date().toISOString().slice(0, 4);

    return monthsData.map((m) => ({
      label: m.monthStr,
      value: m.expense,
      secondaryValue: m.income,
      highlight: isThisYear && m.monthNum === currentMonthNum,
    }));
  }, [monthsData, currentYear]);

  const totalExpense = yearTransactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  const totalIncome = yearTransactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);

  const netSavings = totalIncome - totalExpense;

  const donutData: DonutDataPoint[] = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of yearTransactions) {
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
  }, [yearTransactions, totalExpense]);

  return (
    <div className="space-y-5">
      {/* Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-neutral-950/80 border border-neutral-800 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevYear}
            className="p-1.5 rounded-xl border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-base font-bold text-white px-2">
            {currentYear}년 결산
          </span>
          <button
            onClick={handleNextYear}
            className="p-1.5 rounded-xl border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleCurrentYear}
          className="px-3 py-1.5 text-xs rounded-xl border border-neutral-800 text-neutral-300 hover:text-white transition-colors self-start sm:self-auto"
        >
          올해
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 sm:p-5 rounded-2xl border border-neutral-800 bg-neutral-950">
          <div className="text-xs text-neutral-400 mb-1">연간 총 지출</div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-rose-400">
            {formatKRW(totalExpense)}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-neutral-800 bg-neutral-950">
          <div className="text-xs text-neutral-400 mb-1">연간 총 수입</div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400">
            {formatKRW(totalIncome)}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-neutral-800 bg-neutral-950">
          <div className="text-xs text-neutral-400 mb-1">연간 순 저축</div>
          <div className={`text-2xl sm:text-3xl font-mono font-bold ${netSavings >= 0 ? 'text-white' : 'text-rose-400'}`}>
            {formatKRW(netSavings)}
          </div>
        </div>
      </div>

      {/* 12-Month Bar Chart */}
      <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-950">
        <h3 className="text-xs font-bold text-white mb-3">
          12개월 월별 비교
        </h3>

        <MonochromeBarChart
          data={barChartData}
          height={200}
          showSecondary={true}
          primaryLegend="지출"
          secondaryLegend="수입"
        />
      </div>

      {/* Category Donut & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Category Breakdown */}
        <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-950 lg:col-span-1">
          <h3 className="text-xs font-bold text-white mb-3">
            연간 카테고리 비중
          </h3>
          <MonochromeDonutChart data={donutData} totalLabel="연간 지출" size={180} />
        </div>

        {/* 12-Month Detailed Table */}
        <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-950 lg:col-span-2 overflow-x-auto">
          <h3 className="text-xs font-bold text-white mb-3">
            월별 요약표
          </h3>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400">
                <th className="pb-2">월</th>
                <th className="pb-2 text-right">수입</th>
                <th className="pb-2 text-right">지출</th>
                <th className="pb-2 text-right">순 수지</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 font-mono">
              {monthsData.map((m) => (
                <tr
                  key={m.monthNum}
                  onClick={() => onSelectMonth && onSelectMonth(m.yearMonth)}
                  className="hover:bg-neutral-900/50 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 font-bold text-white">{m.monthStr}</td>
                  <td className="py-2.5 text-right text-emerald-400">
                    {m.income > 0 ? formatKRW(m.income) : '-'}
                  </td>
                  <td className="py-2.5 text-right text-rose-400">
                    {m.expense > 0 ? formatKRW(m.expense) : '-'}
                  </td>
                  <td className="py-2.5 text-right font-medium text-white">
                    {m.expense > 0 || m.income > 0 ? formatKRW(m.net) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
