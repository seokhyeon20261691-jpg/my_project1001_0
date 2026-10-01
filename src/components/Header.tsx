import React from 'react';
import { Plus, FileSpreadsheet, Trash2 } from 'lucide-react';
import { Transaction } from '../types/ledger';
import { exportToExcel } from '../utils/excelExport';
import { formatKRW } from './MonochromeCharts';

interface HeaderProps {
  transactions: Transaction[];
  onOpenNewModal: () => void;
  onClearAll: () => void;
  currentMonthExpense: number;
  currentMonthIncome: number;
}

export const Header: React.FC<HeaderProps> = ({
  transactions,
  onOpenNewModal,
  onClearAll,
  currentMonthExpense,
  currentMonthIncome,
}) => {
  const handleExport = () => {
    exportToExcel(transactions);
  };

  return (
    <header className="border-b border-neutral-800/80 bg-black/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white text-black font-extrabold flex items-center justify-center text-sm shadow-sm">
            ₩
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              스마트 가계부
            </h1>
          </div>
        </div>

        {/* Current Month Summary & Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 text-xs font-mono">
            <div>
              <span className="text-neutral-400 mr-1.5">지출</span>
              <span className="text-rose-400 font-bold">{formatKRW(currentMonthExpense)}</span>
            </div>
            <span className="text-neutral-700">·</span>
            <div>
              <span className="text-neutral-400 mr-1.5">수입</span>
              <span className="text-emerald-400 font-bold">{formatKRW(currentMonthIncome)}</span>
            </div>
          </div>

          {/* Clear button if has transactions */}
          {transactions.length > 0 && (
            <button
              onClick={onClearAll}
              title="전체 내역 초기화"
              className="p-2 rounded-xl text-neutral-400 hover:text-rose-400 border border-neutral-800 hover:border-rose-900/50 bg-neutral-900/60 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Excel Export */}
          <button
            onClick={handleExport}
            disabled={transactions.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-200 border border-neutral-800 hover:border-neutral-600 bg-neutral-900 hover:bg-neutral-800 transition-colors disabled:opacity-40"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>엑셀 다운로드</span>
          </button>

          {/* New Transaction Button */}
          <button
            onClick={onOpenNewModal}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-black bg-white hover:bg-neutral-200 transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>기록하기</span>
          </button>
        </div>
      </div>
    </header>
  );
};
