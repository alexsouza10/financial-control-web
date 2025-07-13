export interface Expense {
  id: string;
  category: string;
  value: number;
  date: string;
  paymentMethod: string;
  card: string;
  installments: number;
}

export interface CreateExpensePayload {
  category: string;
  value: number;
  date: string;
  paymentMethod: string;
  card: string;
  installments: number;
}

export interface UpdateExpensePayload {
  category?: string;
  value?: number;
  date?: string;
  paymentMethod?: string;
  card?: string;
  installments?: number;
}

export interface Salary {
  id: string;
  value: number;
  date: string;
}