import { defineStore } from "pinia";
import { useNuxtApp } from "#app";
import {
format,
startOfMonth,
addMonths,
subMonths,
} from "date-fns";
import {
Expense,
Salary,
CreateExpensePayload,
UpdateExpensePayload,
} from "~/types/expense"; // Certifique-se que seus tipos estão corretos

interface ExpensesState {
expenses: Expense[];
salaries: Salary[];
loading: boolean;
error: string | null;
currentDate: Date;
}

export const useExpensesStore = defineStore("expenses", {
state: (): ExpensesState => ({
 expenses: [],
 salaries: [],
 loading: false,
 error: null,
 currentDate: startOfMonth(new Date()),
}),

getters: {
 // ... (Seus getters: currentMonthKey, expensesForSelectedMonth, etc. estão corretos)
 currentMonthKey(state): string {
 return format(state.currentDate, "yyyy-MM");
 },
 expensesForSelectedMonth(state): Expense[] {
 const key = (this as any).currentMonthKey;
 if (!state.expenses) return [];
 return state.expenses.filter(
  (exp) => exp.date && exp.date.startsWith(key)
 );
 },
 totalsForSelectedMonth(
 state
 ): { total: number; paid: number; unpaid: number } {
 const expenses = (this as any).expensesForSelectedMonth;
 return expenses.reduce(
  (acc: any, exp: Expense) => {
  acc.total += exp.value;
  if (exp.paid) {
   acc.paid += exp.value;
  } else {
   acc.unpaid += exp.value;
  }
  return acc;
  },
  { total: 0, paid: 0, unpaid: 0 }
 );
 },
 salaryForSelectedMonth(state): number {
 const key = (this as any).currentMonthKey;
 if (!state.salaries || state.salaries.length === 0) {
  return 0;
 }
 const salariesForMonth = state.salaries.filter((s) =>
  s.date && s.date.startsWith(key)
 );
 if (salariesForMonth.length === 0) {
  return 0;
 }
 salariesForMonth.sort((a, b) => {
  const dateA = new Date(a.date).getTime();
  const dateB = new Date(b.date).getTime();
  return dateB - dateA; 
 });
 return salariesForMonth[0].value;
 },
},

actions: {
 nextMonth() {
 this.currentDate = addMonths(this.currentDate, 1);
 },
 previousMonth() {
 this.currentDate = subMonths(this.currentDate, 1);
 },

 async fetchExpenses(force: boolean = false) {
 if ((this.expenses.length > 0 && !force) || this.loading) {
  return;
 }
 if (force) this.expenses = [];
 const { $api } = useNuxtApp();
 this.loading = true;
 this.error = null;
 try {
  const response = await $api.get<Expense[]>("/expenses"); 
  this.expenses = response.data;
 } catch (err: any) {
  this.error = "Failed to fetch expenses: " + (err.response?.data || err.message);
 } finally {
  this.loading = false;
 }
 },
 
 // **** MUDANÇAS AQUI ****
 
 async addExpense(expensePayload: CreateExpensePayload) {
  const { $api } = useNuxtApp();
  this.error = null;
  try {
   // A API deve retornar a despesa criada (não 204)
   const response = await $api.post<Expense>("/expenses", expensePayload);
   this.expenses.push(response.data);
  } catch (err: any) {
   this.error = "Failed to add expense: " + (err.response?.data || err.message);
   throw err; 
  }
 },

 async updateExpense(id: string, payload: UpdateExpensePayload) {
  const { $api } = useNuxtApp();
  this.error = null;
  try {
   // Chama a API (que retorna 204 - Vazio)
   await $api.put<void>(`/expenses/${id}`, payload);
   
   // Em vez de usar a resposta, atualizamos o item localmente
   const index = this.expenses.findIndex((exp) => exp.id === id);
   if (index !== -1) {
    // Mescla o payload (o que foi enviado) com o item existente
    this.expenses[index] = { ...this.expenses[index], ...payload };
   }
  } catch (err: any) {
   this.error = "Failed to update expense: " + (err.response?.data || err.message);
   throw err;
  }
 },

 async deleteExpense(id: string) {
  const { $api } = useNuxtApp();
  this.error = null;
  try {
   await $api.delete(`/expenses/${id}`);
   this.expenses = this.expenses.filter((exp) => exp.id !== id);
  } catch (err: any) {
   this.error = "Failed to delete expense: " + (err.response?.data || err.message);
   throw err;
  }
 },

 // **** FIM DAS MUDANÇAS ****

 async fetchSalary(force: boolean = false) {
  if ((this.salaries.length > 0 && !force) || this.loading) {
   return;
  }
  if (force) this.salaries = [];
 
  const { $api } = useNuxtApp();
  this.loading = true;
  this.error = null;
  try {
   const response = await $api.get<Salary[]>("/salaries");
   this.salaries = response.data || [];
  } catch (err: any) {
   this.error = "Failed to fetch salary: " + (err.response?.data || err.message);
  } finally {
   this.loading = false;
  }
 },

 async setSalary(newValue: number) {
  const { $api } = useNuxtApp();
  const monthKey = (this as any).currentMonthKey;
  const monthDate = new Date(`${monthKey}-01T12:00:00Z`);
  this.loading = true;
  this.error = null;
  try {
   const salaryPayload = {
    value: newValue,
    date: monthDate.toISOString(),
   };
   const response = await $api.post<Salary>("/salaries", salaryPayload);
   const returnedDateKey = response.data.date.substring(0, 7);
   const existingIndex = this.salaries.findIndex(s => s.date.startsWith(returnedDateKey));
   if (existingIndex !== -1) {
    this.salaries[existingIndex] = response.data;
   } else {
    this.salaries.push(response.data);
   }
  } catch (err: any) {
   this.error = "Failed to update salary: " + (err.response?.data || err.message);
   throw err;
  } finally {
   this.loading = false;
  }
 },
},
});