import { PaymentMethod, Transaction, TransactionType } from '../types/ledger';
import { classifyCategory } from './categoryClassifier';

export interface ParsedTransactionInput {
  description: string;
  amount: number | null;
  type: TransactionType;
  category: string;
  paymentMethod: PaymentMethod;
  date: string; // YYYY-MM-DD
  matchedKeyword?: string;
}

export function parseNaturalLanguageInput(rawInput: string): ParsedTransactionInput {
  const input = rawInput.trim();
  const today = new Date();
  let targetDate = new Date(today);

  // Check date mentions
  if (input.includes('어제')) {
    targetDate.setDate(targetDate.getDate() - 1);
  } else if (input.includes('그저께') || input.includes('그제')) {
    targetDate.setDate(targetDate.getDate() - 2);
  } else if (input.includes('내일')) {
    targetDate.setDate(targetDate.getDate() + 1);
  }

  const formattedDate = targetDate.toISOString().slice(0, 10);

  // Detect payment method
  let paymentMethod: PaymentMethod = 'credit_card';
  if (/체크카드|체크/.test(input)) {
    paymentMethod = 'check_card';
  } else if (/현금/.test(input)) {
    paymentMethod = 'cash';
  } else if (/계좌이체|이체|송금/.test(input)) {
    paymentMethod = 'transfer';
  } else if (/카드|신용/.test(input)) {
    paymentMethod = 'credit_card';
  }

  // Extract amount
  // Match patterns like: 35000원, 35,000원, 3만5천원, 35000, 50000
  let amount: number | null = null;

  // Check for Korean unit amounts: e.g. 3만5천, 5만, 120만
  const koreanManPattern = /(\d+)\s*만\s*(\d+)?\s*(천)?\s*원?/;
  const manMatch = input.match(koreanManPattern);
  if (manMatch) {
    const man = parseInt(manMatch[1], 10) * 10000;
    const cheon = manMatch[2] ? parseInt(manMatch[2], 10) * (manMatch[3] ? 1000 : 1000) : 0;
    amount = man + cheon;
  } else {
    // Standard digit patterns like 35,000원 or 35000
    const digitMatch = input.match(/(\d{1,3}(,\d{3})+|\d+)\s*원?/);
    if (digitMatch) {
      const cleanNum = digitMatch[1].replace(/,/g, '');
      const parsed = parseInt(cleanNum, 10);
      if (!isNaN(parsed) && parsed > 0) {
        amount = parsed;
      }
    }
  }

  // Detect explicit transaction type
  let type: TransactionType = 'expense';
  if (/수입|입금|월급|급여|보너스|이자|배당|환급|판매대금|알바비/.test(input)) {
    type = 'income';
  } else if (/지출|출금|결제|사용|구매|소비/.test(input)) {
    type = 'expense';
  }

  // Extract description by removing known modifier words and numbers
  let cleanedDesc = input
    .replace(/(어제|그저께|그제|오늘|내일)/g, '')
    .replace(/(신용카드|체크카드|계좌이체|현금|카드|이체|송금)/g, '')
    .replace(/(수입|지출|입금|출금|결제)/g, '')
    .replace(/(\d+)\s*만\s*(\d+)?\s*(천)?\s*원?/g, '')
    .replace(/(\d{1,3}(,\d{3})+|\d+)\s*원?/g, '')
    .trim();

  // If clean description is empty, fallback to original or placeholder
  if (!cleanedDesc) {
    cleanedDesc = input.replace(/\d+/g, '').replace(/,/g, '').trim() || '지출 내역';
  }

  const classification = classifyCategory(cleanedDesc || input);

  if (classification.inferredType) {
    type = classification.inferredType;
  }

  return {
    description: cleanedDesc,
    amount,
    type,
    category: classification.categoryId,
    paymentMethod,
    date: formattedDate,
    matchedKeyword: classification.matchedKeyword,
  };
}
