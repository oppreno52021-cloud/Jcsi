// @ts-nocheck
export type ExpenseType = 'expense' | 'income' | 'transfer';

export interface Expense {
  id: string;
  amount: number;
  type: ExpenseType;
  categoryId: string;
  accountId: string;
  paymentMethodId?: string;
  toAccountId?: string;
  fromAccountId?: string;
  date: string;
  time?: string;
  note?: string;
  notes?: string;
  tags?: string[];
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  icon: string;
  color: string;
  type?: 'expense' | 'income';
  budgetLimit?: number;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type AccountType = 'cash' | 'bank' | 'wallet' | 'card' | 'savings' | 'investment' | 'other';

export interface Account {
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  type: AccountType;
  openingBalance: number;
  currentBalance?: number;
  icon?: string;
  color?: string;
  isActive?: boolean;
  isArchived?: boolean;
  showOnHome?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Budget {
  id: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  categoryLimits?: Record<string, number>;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecurringTransaction {
  id: string;
  amount: number;
  type: 'expense' | 'income';
  categoryId: string;
  accountId: string;
  paymentMethodId?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  lastProcessedDate?: string;
  isActive: boolean;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FilterOptions {
  search: string;
  type: 'all' | 'expense' | 'income' | 'transfer';
  categoryIds: string[];
  paymentMethodIds: string[];
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy: 'newest' | 'oldest' | 'highest' | 'lowest';
}

export interface AppSettings {
  currency: string;
  currencySymbol: string;
  language: 'ar' | 'en';
  theme: 'light' | 'dark' | 'system';
  fontSize: 'compact' | 'normal' | 'large' | 'xlarge';
  fontFamily?: 'ibm' | 'system' | 'readex' | 'cairo';
  numberFormat: 'arabic' | 'western';
  notifications: boolean;
  biometricLock: boolean;
  pinLockEnabled: boolean;
  passcode: string;
  autoLockTimeout: string;
  privacyBlurEnabled: boolean;
  autoPrivacyModeOnLaunch: boolean;
  showWalletsOnHome: boolean;
  firstDayOfMonth: number;
  budgetNotificationThreshold: number;
  hasCompletedOnboarding: boolean;
  isDemoInitialized: boolean;
}

export interface ToastMessage {
  id?: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}
