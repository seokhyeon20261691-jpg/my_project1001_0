import React, { useState, useMemo } from 'react';
import { Search, Edit2, Trash2 } from 'lucide-react';
import { CategoryId, Transaction, TransactionType } from '../types/ledger';
import { CATEGORIES } from '../utils/categoryClassifier';
import { formatKRW } from './MonochromeCharts';

interface TransactionListProps {
  transactions: Transaction[];
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | CategoryId>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    let list = [...transactions];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((t) => {
        const catName = CATEGORIES[t.category]?.name.toLowerCase() || '';
        return (
          t.description.toLowerCase().includes(q) ||
          (t.memo && t.memo.toLowerCase().includes(q)) ||
          catName.includes(q) ||
          t.date.includes(q)
        );
      });
    }

    if (typeFilter !== 'all') {
      list = list.filter((t) => t.type === typeFilter);
    }

    if (categoryFilter !== 'all') {
      list = list.filter((t) => t.category === categoryFilter);
    }

    list.sort((a, b) => {
      if (sortBy === 'date_desc') {
        const cmp = b.date.localeCompare(a.date);
        return cmp !== 0 ? cmp : (b.time || '').localeCompare(a.time || '');
      }
      if (sortBy === 'date_asc') {
        const cmp = a.date.localeCompare(b.date);
        return cmp !== 0 ? cmp : (a.time || '').localeCompare(b.time || '');
      }
      if (sortBy === 'amount_desc') {
        return b.amount - a.amount;
      }
      if (sortBy === 'amount_asc') {
        return a.amount - b.amount;
      }
      return 0;
    });

    return list;
  }, [transactions, searchTerm, typeFilter, categoryFilter, sortBy]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const totalFilteredAmount = useMemo(() => {
    const expense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const income = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    return { expense, income };
  }, [filtered]);

  return (
    <div className="border border-neutral-800 bg-neutral-950/80 rounded-2xl p-5 space-y-4 shadow-sm">
      {/* List Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800/80">
        <h3 className="text-sm font-bold text-white">
          전체 내역 ({filtered.length}건)
        </h3>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span>
            지출: <strong className="text-rose-400">{formatKRW(totalFilteredAmount.expense)}</strong>
          </span>
          <span className="text-neutral-700">·</span>
          <span>
            수입: <strong className="text-emerald-400">{formatKRW(totalFilteredAmount.income)}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="검색..."
            className="w-full bg-black border border-neutral-800 rounded-xl text-white placeholder-neutral-600 pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-neutral-500"
          />
        </div>

        <div className="flex items-center p-0.5 bg-black border border-neutral-800 rounded-xl text-xs">
          {(
            [
              { id: 'all', label: '전체' },
              { id: 'expense', label: '지출' },
              { id: 'income', label: '수입' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTypeFilter(t.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                typeFilter === t.id
                  ? 'bg-white text-black font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value as any);
            setCurrentPage(1);
          }}
          className="bg-black border border-neutral-800 rounded-xl text-xs text-neutral-300 px-3 py-1.5 focus:outline-none"
        >
          <option value="all">모든 카테고리</option>
          {Object.values(CATEGORIES).map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="bg-black border border-neutral-800 rounded-xl text-xs text-neutral-300 px-3 py-1.5 focus:outline-none"
        >
          <option value="date_desc">최신순</option>
          <option value="date_asc">오래된순</option>
          <option value="amount_desc">높은 금액순</option>
          <option value="amount_asc">낮은 금액순</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-neutral-800/80 rounded-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-neutral-900/60 border-b border-neutral-800 text-neutral-400 text-[11px]">
              <th className="py-2.5 px-3">날짜</th>
              <th className="py-2.5 px-3">구분</th>
              <th className="py-2.5 px-3">카테고리</th>
              <th className="py-2.5 px-3">항목명</th>
              <th className="py-2.5 px-3">결제수단</th>
              <th className="py-2.5 px-3 text-right">금액</th>
              <th className="py-2.5 px-3 text-center">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-neutral-500">
                  내역이 없습니다.
                </td>
              </tr>
            ) : (
              paginated.map((tx) => {
                const cat = CATEGORIES[tx.category];
                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-neutral-900/40 transition-colors group"
                  >
                    <td className="py-2.5 px-3 text-neutral-400 whitespace-nowrap font-mono text-[11px]">
                      {tx.date}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                          tx.type === 'expense'
                            ? 'text-rose-400 bg-rose-500/10'
                            : 'text-emerald-400 bg-emerald-500/10'
                        }`}
                      >
                        {tx.type === 'expense' ? '지출' : '수입'}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-neutral-300 font-medium">
                        {cat?.name || tx.category}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-medium text-white">{tx.description}</div>
                      {tx.memo && (
                        <div className="text-[11px] text-neutral-500 truncate max-w-xs">
                          {tx.memo}
                        </div>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-neutral-400 whitespace-nowrap text-[11px]">
                      {tx.paymentMethod === 'credit_card'
                        ? '신용카드'
                        : tx.paymentMethod === 'check_card'
                        ? '체크카드'
                        : tx.paymentMethod === 'cash'
                        ? '현금'
                        : '계좌이체'}
                    </td>

                    <td className="py-2.5 px-3 text-right whitespace-nowrap font-bold font-mono text-sm">
                      <span className={tx.type === 'expense' ? 'text-rose-400' : 'text-emerald-400'}>
                        {tx.type === 'expense' ? '-' : '+'}
                        {formatKRW(tx.amount)}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditTransaction(tx)}
                          className="p-1 hover:text-white text-neutral-400 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`'${tx.description}' 항목을 삭제하시겠습니까?`)) {
                              onDeleteTransaction(tx.id);
                            }
                          }}
                          className="p-1 hover:text-rose-400 text-neutral-400 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1 text-xs text-neutral-400">
          <div>
            {currentPage} / {totalPages} 페이지
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded-lg border border-neutral-800 disabled:opacity-30 text-white transition-colors"
            >
              이전
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded-lg border border-neutral-800 disabled:opacity-30 text-white transition-colors"
            >
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
