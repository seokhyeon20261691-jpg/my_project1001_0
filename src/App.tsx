/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Transaction } from './types/ledger';
import { Header } from './components/Header';
import { QuickAddBar } from './components/QuickAddBar';
import { VisualizationContainer } from './components/Visualizations/VisualizationContainer';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';

const STORAGE_KEY = 'monochrome_ledger_user_data_v2';

export default function App() {
  // Start completely clean (0 default transactions) as requested
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      // Clear previous sample key if present
      localStorage.removeItem('monochrome_ledger_transactions_v1');
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load transactions', e);
    }
    return [];
  });

  const [currentDate, setCurrentDate] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [transactions]);

  // Current month totals
  const currentMonthPrefix = currentDate.slice(0, 7);
  const { currentMonthExpense, currentMonthIncome } = useMemo(() => {
    let exp = 0;
    let inc = 0;
    for (const t of transactions) {
      if (t.date.startsWith(currentMonthPrefix)) {
        if (t.type === 'expense') exp += t.amount;
        else inc += t.amount;
      }
    }
    return { currentMonthExpense: exp, currentMonthIncome: inc };
  }, [transactions, currentMonthPrefix]);

  const handleAddTransaction = (newTxData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
    };
    setTransactions((prev) => [newTx, ...prev]);
    setCurrentDate(newTx.date);
  };

  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === existingId ? { ...t, ...txData } : t
        )
      );
    } else {
      handleAddTransaction(txData);
    }
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleClearAll = () => {
    if (confirm('모든 가계부 내역을 삭제하고 초기화하시겠습니까?')) {
      setTransactions([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* Header */}
      <Header
        transactions={transactions}
        onOpenNewModal={handleOpenNew}
        onClearAll={handleClearAll}
        currentMonthExpense={currentMonthExpense}
        currentMonthIncome={currentMonthIncome}
      />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-7">
        {/* Quick Add Bar */}
        <section aria-label="빠른 입력">
          <QuickAddBar
            onAddTransaction={handleAddTransaction}
            onOpenDetailedModal={handleOpenNew}
          />
        </section>

        {/* Visualizations Section */}
        <section aria-label="분석">
          <VisualizationContainer
            transactions={transactions}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            onEditTransaction={handleOpenEdit}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenNewModal={handleOpenNew}
          />
        </section>

        {/* Full Ledger Transaction List */}
        <section aria-label="내역 목록">
          <TransactionList
            transactions={transactions}
            onEditTransaction={handleOpenEdit}
            onDeleteTransaction={handleDeleteTransaction}
          />
        </section>
      </main>

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
        initialData={editingTransaction}
      />
    </div>
  );
}
