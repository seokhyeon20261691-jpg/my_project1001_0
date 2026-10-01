export type TransactionType = 'expense' | 'income';

export type CategoryId =
  | 'food' // 식비
  | 'cafe' // 카페/디저트
  | 'mart' // 생활/마트
  | 'shopping' // 쇼핑
  | 'transport' // 교통/차량
  | 'housing' // 주거/통신
  | 'health' // 의료/건강
  | 'leisure' // 문화/여가
  | 'education' // 교육/자기계발
  | 'finance' // 금융/경조사
  | 'salary' // 급여/월급
  | 'side_income' // 부수입/알바
  | 'allowance' // 용돈/보너스
  | 'other'; // 기타

export type PaymentMethod = 'credit_card' | 'check_card' | 'cash' | 'transfer';

export interface CategoryDef {
  id: CategoryId;
  name: string;
  type: TransactionType;
  iconName: string;
  description: string;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  type: TransactionType;
  amount: number;
  description: string;
  category: CategoryId;
  paymentMethod: PaymentMethod;
  memo?: string;
  autoClassified?: boolean;
  createdAt: number;
}

export type PeriodMode = 'day' | 'week' | 'month' | 'year';

export interface BudgetGoal {
  monthlyLimit: number;
}
