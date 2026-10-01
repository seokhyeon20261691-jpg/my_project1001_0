import React, { useState } from 'react';
import { PeriodMode, Transaction } from '../../types/ledger';
import { DailyView } from './DailyView';
import { WeeklyView } from './WeeklyView';
import { MonthlyView } from './MonthlyView';
import { YearlyView } from './YearlyView';

interface VisualizationContainerProps {
  transactions: Transaction[];
  currentDate: string;
  onDateChange: (date: string) => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenNewModal: () => void;
}

export const VisualizationContainer: React.FC<VisualizationContainerProps> = ({
  transactions,
  currentDate,
  onDateChange,
  onEditTransaction,
  onDeleteTransaction,
  onOpenNewModal,
}) => {
  const [periodMode, setPeriodMode] = useState<PeriodMode>('month');

  const currentMonth = currentDate.slice(0, 7);
  const currentYear = currentDate.slice(0, 4);

  const handleMonthChange = (newMonth: string) => {
    const day = currentDate.slice(8, 10);
    onDateChange(`${newMonth}-${day}`);
  };

  const handleYearChange = (newYear: string) => {
    const monthDay = currentDate.slice(4);
    onDateChange(`${newYear}${monthDay}`);
  };

  const handleSelectMonthFromYear = (yearMonth: string) => {
    handleMonthChange(yearMonth);
    setPeriodMode('month');
  };

  return (
    <div className="space-y-4">
      {/* Period Horizon Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          기간별 분석
        </h2>

        {/* Functional Segmented Button Control */}
        <div className="flex items-center p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
          {(
            [
              { id: 'day', label: '하루' },
              { id: 'week', label: '주간' },
              { id: 'month', label: '월간' },
              { id: 'year', label: '연간' },
            ] as const
          ).map((tab) => {
            const isActive = periodMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setPeriodMode(tab.id)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  isActive
                    ? 'bg-white text-black shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active View */}
      {periodMode === 'day' && (
        <DailyView
          transactions={transactions}
          currentDate={currentDate}
          onDateChange={onDateChange}
          onEditTransaction={onEditTransaction}
          onDeleteTransaction={onDeleteTransaction}
          onOpenNewModal={onOpenNewModal}
        />
      )}

      {periodMode === 'week' && (
        <WeeklyView
          transactions={transactions}
          currentDate={currentDate}
          onDateChange={onDateChange}
          onEditTransaction={onEditTransaction}
        />
      )}

      {periodMode === 'month' && (
        <MonthlyView
          transactions={transactions}
          currentMonth={currentMonth}
          onMonthChange={handleMonthChange}
          onEditTransaction={onEditTransaction}
        />
      )}

      {periodMode === 'year' && (
        <YearlyView
          transactions={transactions}
          currentYear={currentYear}
          onYearChange={handleYearChange}
          onSelectMonth={handleSelectMonthFromYear}
        />
      )}
    </div>
  );
};
