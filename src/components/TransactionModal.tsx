import React, { useState, useEffect } from 'react';
import { X, Check, Trash2 } from 'lucide-react';
import { CategoryId, PaymentMethod, Transaction, TransactionType } from '../types/ledger';
import { CATEGORIES, classifyCategory } from '../utils/categoryClassifier';
import { formatKRW } from './MonochromeCharts';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt'>, existingId?: string) => void;
  onDelete?: (id: string) => void;
  initialData?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<CategoryId>('food');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState<string>(
    `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`
  );
  const [memo, setMemo] = useState<string>('');
  const [isManualCategory, setIsManualCategory] = useState(false);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmountStr(String(initialData.amount));
      setDescription(initialData.description);
      setCategory(initialData.category);
      setPaymentMethod(initialData.paymentMethod);
      setDate(initialData.date);
      setTime(initialData.time || '12:00');
      setMemo(initialData.memo || '');
      setIsManualCategory(true);
    } else {
      setType('expense');
      setAmountStr('');
      setDescription('');
      setCategory('food');
      setPaymentMethod('credit_card');
      const now = new Date();
      setDate(now.toISOString().slice(0, 10));
      setTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
      setMemo('');
      setIsManualCategory(false);
    }
  }, [initialData, isOpen]);

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDescription(val);

    if (!isManualCategory && val.trim().length > 0) {
      const detected = classifyCategory(val);
      if (detected.categoryId !== 'other') {
        setCategory(detected.categoryId);
        if (detected.inferredType) {
          setType(detected.inferredType);
        }
      }
    }
  };

  const handleAmountIncrement = (addition: number) => {
    const current = parseInt(amountStr || '0', 10);
    setAmountStr(String(current + addition));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseInt(amountStr.replace(/[^0-9]/g, ''), 10);
    if (!parsedAmount || parsedAmount <= 0) {
      alert('금액을 입력해주세요.');
      return;
    }
    if (!description.trim()) {
      alert('항목명을 입력해주세요.');
      return;
    }

    onSave(
      {
        type,
        amount: parsedAmount,
        description: description.trim(),
        category,
        paymentMethod,
        date,
        time,
        memo: memo.trim() || undefined,
        autoClassified: !isManualCategory,
      },
      initialData?.id
    );

    onClose();
  };

  if (!isOpen) return null;

  const currentAmountNum = parseInt(amountStr || '0', 10);
  const availableCategories = Object.values(CATEGORIES).filter((cat) => cat.type === type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl text-white w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800/80">
          <h2 className="text-base font-bold text-white">
            {initialData ? '거래 내역 수정' : '새 가계부 항목 등록'}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Type Switcher with accents */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-black rounded-2xl border border-neutral-800">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                if (type !== 'expense') setCategory('food');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              지출
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                if (type !== 'income') setCategory('salary');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              수입
            </button>
          </div>

          {/* Amount Display & Input */}
          <div className="space-y-1.5">
            <label className="block text-xs text-neutral-400">금액</label>
            <div className="relative">
              <input
                type="number"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0"
                autoFocus
                className={`w-full bg-black border rounded-2xl px-4 py-3 text-2xl font-mono font-bold focus:outline-none transition-colors ${
                  type === 'expense'
                    ? 'border-neutral-700 text-rose-400 focus:border-rose-500'
                    : 'border-neutral-700 text-emerald-400 focus:border-emerald-500'
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
                원
              </span>
            </div>

            {/* Quick increment buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {[
                { label: '+1만', val: 10000 },
                { label: '+5만', val: 50000 },
                { label: '+10만', val: 100000 },
                { label: '+50만', val: 500000 },
              ].map((chip) => (
                <button
                  key={chip.val}
                  type="button"
                  onClick={() => handleAmountIncrement(chip.val)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 transition-colors"
                >
                  {chip.label}
                </button>
              ))}
              {amountStr && (
                <button
                  type="button"
                  onClick={() => setAmountStr('')}
                  className="px-2.5 py-1 text-xs rounded-lg border border-neutral-800 text-neutral-500 hover:text-neutral-300"
                >
                  초기화
                </button>
              )}
            </div>
          </div>

          {/* Item Description */}
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-400">항목명</label>
            <input
              type="text"
              value={description}
              onChange={handleDescriptionChange}
              placeholder="예: 스타벅스 아메리카노, 점심 식사"
              className="w-full bg-black border border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-neutral-400"
            />
          </div>

          {/* Category Picker */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">카테고리</span>
              <span className="text-white font-bold">{CATEGORIES[category]?.name}</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-36 overflow-y-auto p-1 border border-neutral-900 rounded-xl bg-black">
              {availableCategories.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id);
                      setIsManualCategory(true);
                    }}
                    className={`p-2 text-xs text-center rounded-lg border transition-all truncate ${
                      isSelected
                        ? 'border-white bg-white text-black font-bold'
                        : 'border-neutral-800 text-neutral-300 hover:border-neutral-600 bg-neutral-950'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-neutral-400">날짜</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-black border border-neutral-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-neutral-400">시간</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-black border border-neutral-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-1">
            <label className="text-xs text-neutral-400">결제 수단</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'credit_card', label: '신용카드' },
                { id: 'check_card', label: '체크카드' },
                { id: 'cash', label: '현금' },
                { id: 'transfer', label: '계좌이체' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                  className={`py-1.5 text-xs rounded-lg border transition-all ${
                    paymentMethod === m.id
                      ? 'border-white bg-white text-black font-bold'
                      : 'border-neutral-800 text-neutral-400 hover:text-white bg-neutral-950'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Memo */}
          <div className="space-y-1">
            <label className="text-xs text-neutral-400">메모 (선택)</label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="추가 메모 입력"
              className="w-full bg-black border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
            {initialData && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('이 항목을 삭제하시겠습니까?')) {
                    onDelete(initialData.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>삭제</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs rounded-xl text-neutral-400 hover:text-white border border-neutral-800 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-white text-black hover:bg-neutral-200 transition-all shadow-md"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>저장</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
