export interface Expense {
  id: string;
  categoryId: string;
  value: number;
  date: string;
  paymentMethod: string;
  card: string;
  installments: number;
  description: string;
}

export interface CreateExpensePayload {
  categoryId: string;
  value: number;
  date: string;
  paymentMethod: string;
  card?: string | null;
  installments: number;
}

export interface UpdateExpensePayload {
  categoryId?: string;
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
