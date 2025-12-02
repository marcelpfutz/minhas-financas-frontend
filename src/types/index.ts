/**
 * Tipos TypeScript para as entidades do sistema
 * Mantém tipagem forte em todo o frontend
 */

// ==================== USUÁRIO ====================

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

// ==================== CARTEIRA ====================

export interface Wallet {
  id: string;
  name: string;
  description?: string;
  balance: number;
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWalletData {
  name: string;
  description?: string;
  balance?: number;
  color?: string;
  icon?: string;
}

export interface UpdateWalletData {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
}

// ==================== CATEGORIA ====================

export interface Category {
  id: string;
  name: string;
  description?: string;
  type: 'INCOME' | 'EXPENSE';
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  type: 'INCOME' | 'EXPENSE';
  color?: string;
  icon?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
}

// ==================== LANÇAMENTO ====================

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  dueDate: string;
  paymentDate?: string;
  isPaid: boolean;
  isRecurring: boolean;
  recurringType?: 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'INDEFINITE';
  recurringGroupId?: string;
  isInstallment: boolean;
  installments?: number;
  currentInstallment?: number;
  installmentGroupId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  wallet: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
  category: {
    id: string;
    name: string;
    color: string;
    icon: string;
    type: 'INCOME' | 'EXPENSE';
  };
}

export interface CreateTransactionData {
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  dueDate: string;
  paymentDate?: string;
  isPaid?: boolean;
  isRecurring?: boolean;
  recurringType?: 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'INDEFINITE';
  isInstallment?: boolean;
  installments?: number;
  notes?: string;
  walletId: string;
  categoryId: string;
}

export interface UpdateTransactionData {
  description?: string;
  amount?: number;
  dueDate?: string;
  paymentDate?: string | null;
  isPaid?: boolean;
  isRecurring?: boolean;
  recurringType?: 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'INDEFINITE' | null;
  isInstallment?: boolean;
  installments?: number | null;
  currentInstallment?: number | null;
  notes?: string | null;
  walletId?: string;
  categoryId?: string;
  updateAll?: boolean; // Flag para atualizar todos do grupo
}

// ==================== TRANSFERÊNCIA ====================

export interface Transfer {
  id: string;
  amount: number;
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  fromWallet: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
  toWallet: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
}

export interface CreateTransferData {
  amount: number;
  description?: string;
  date?: string;
  fromWalletId: string;
  toWalletId: string;
}

// ==================== DASHBOARD ====================

export interface DashboardSummary {
  period: {
    month: number;
    year: number;
  };
  wallets: Wallet[];
  totalBalance: number;
  income: {
    total: number;
    paid: number;
    pending: number;
  };
  expense: {
    total: number;
    paid: number;
    pending: number;
  };
  balance: number;
  pendingTransactions: number;
  overdueTransactions: number;
}

export interface CategoryStat {
  category: Category;
  total: number;
  count: number;
}

export interface Projection {
  month: number;
  year: number;
  income: number;
  expense: number;
  balance: number;
}
