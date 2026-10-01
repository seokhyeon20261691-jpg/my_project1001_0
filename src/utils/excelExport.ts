import * as XLSX from 'xlsx';
import { Transaction } from '../types/ledger';
import { CATEGORIES } from './categoryClassifier';

const PAYMENT_LABELS: Record<string, string> = {
  credit_card: '신용카드',
  check_card: '체크카드',
  cash: '현금',
  transfer: '계좌이체',
};

const TYPE_LABELS: Record<string, string> = {
  expense: '지출',
  income: '수입',
};

export function exportToExcel(transactions: Transaction[], filenamePrefix = '모노크롬가계부_데이터') {
  if (!transactions || transactions.length === 0) {
    alert('내보낼 가계부 데이터가 없습니다.');
    return;
  }

  // Sort descending by date
  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

  // 1. Sheet 1: Detailed Transactions
  const detailedData = sorted.map((t, index) => {
    const catName = CATEGORIES[t.category]?.name || t.category;
    return {
      'No.': index + 1,
      '날짜': t.date,
      '시간': t.time || '-',
      '구분': TYPE_LABELS[t.type] || t.type,
      '카테고리': catName,
      '항목명': t.description,
      '금액(원)': t.amount,
      '결제수단': PAYMENT_LABELS[t.paymentMethod] || t.paymentMethod,
      '메모': t.memo || '',
    };
  });

  const wsTransactions = XLSX.utils.json_to_sheet(detailedData);
  // Column widths
  wsTransactions['!cols'] = [
    { wch: 6 },  // No.
    { wch: 12 }, // 날짜
    { wch: 8 },  // 시간
    { wch: 8 },  // 구분
    { wch: 14 }, // 카테고리
    { wch: 24 }, // 항목명
    { wch: 14 }, // 금액
    { wch: 12 }, // 결제수단
    { wch: 30 }, // 메모
  ];

  // 2. Sheet 2: Monthly Summary
  const monthlyMap: Record<string, { income: number; expense: number; count: number; expenseCount: number }> = {};
  for (const t of sorted) {
    const monthKey = t.date.substring(0, 7); // YYYY-MM
    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = { income: 0, expense: 0, count: 0, expenseCount: 0 };
    }
    monthlyMap[monthKey].count += 1;
    if (t.type === 'expense') {
      monthlyMap[monthKey].expense += t.amount;
      monthlyMap[monthKey].expenseCount += 1;
    } else {
      monthlyMap[monthKey].income += t.amount;
    }
  }

  const monthlyData = Object.entries(monthlyMap)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([month, data]) => {
      const net = data.income - data.expense;
      const avgExpense = data.expenseCount > 0 ? Math.round(data.expense / data.expenseCount) : 0;
      return {
        '년월': month,
        '총 수입(원)': data.income,
        '총 지출(원)': data.expense,
        '순 수지(원)': net,
        '지출 건수': data.expenseCount,
        '건당 평균 지출(원)': avgExpense,
      };
    });

  const wsMonthly = XLSX.utils.json_to_sheet(monthlyData);
  wsMonthly['!cols'] = [
    { wch: 12 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 12 },
    { wch: 18 },
  ];

  // 3. Sheet 3: Category breakdown
  const categoryExpenses: Record<string, { total: number; count: number }> = {};
  let totalExpenseAll = 0;

  for (const t of sorted) {
    if (t.type === 'expense') {
      const catId = t.category;
      if (!categoryExpenses[catId]) {
        categoryExpenses[catId] = { total: 0, count: 0 };
      }
      categoryExpenses[catId].total += t.amount;
      categoryExpenses[catId].count += 1;
      totalExpenseAll += t.amount;
    }
  }

  const categoryData = Object.entries(categoryExpenses)
    .sort(([, a], [, b]) => b.total - a.total)
    .map(([catId, data]) => {
      const catName = CATEGORIES[catId as keyof typeof CATEGORIES]?.name || catId;
      const share = totalExpenseAll > 0 ? ((data.total / totalExpenseAll) * 100).toFixed(1) + '%' : '0%';
      return {
        '카테고리': catName,
        '지출 합계(원)': data.total,
        '지출 건수': data.count,
        '비율': share,
      };
    });

  const wsCategory = XLSX.utils.json_to_sheet(categoryData);
  wsCategory['!cols'] = [
    { wch: 16 },
    { wch: 16 },
    { wch: 12 },
    { wch: 10 },
  ];

  // Create workbook and append sheets
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsTransactions, '전체_거래내역');
  XLSX.utils.book_append_sheet(wb, wsMonthly, '월별_요약');
  XLSX.utils.book_append_sheet(wb, wsCategory, '카테고리별_분석');

  const todayStr = new Date().toISOString().slice(0, 10);
  const fileName = `${filenamePrefix}_${todayStr}.xlsx`;

  XLSX.writeFile(wb, fileName);
}
