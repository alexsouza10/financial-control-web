import { defineStore } from "pinia";
import { useNuxtApp } from "#app";
import {
  Expense,
  Salary,
  CreateExpensePayload,
  UpdateExpensePayload,
} from "~/types/expense";

interface ExpensesState {
  expenses: Expense[];
  salary: number;
  loading: boolean;
  error: string | null;
}

export const useExpensesStore = defineStore("expenses", {
  state: (): ExpensesState => ({
    expenses: [],
    salary: 0,
    loading: false,
    error: null,
  }),

  getters: {
    totalExpenses: (state: ExpensesState): number =>
      state.expenses.reduce(
        (sum: number, expense: Expense) => sum + expense.value,
        0
      ),

    currentMonthExpenses: (state: ExpensesState): number => {
      const now = new Date();
      const currentMonth = now.getMonth() + 1; 
      const currentYear = now.getFullYear();
      
      const total = state.expenses.reduce((sum: number, expense: Expense) => {
        try {          
          const expenseDate = new Date(expense.date);
          const expenseMonth = expenseDate.getMonth() + 1;
          const expenseYear = expenseDate.getFullYear();
          
          if (expenseMonth === currentMonth && expenseYear === currentYear) {
            return sum + expense.value;
          }
        } catch (error) {
          console.error('❌ Error processing expense:', {
            id: expense.id,
            date: expense.date,
            error: error instanceof Error ? error.message : String(error)
          });
        }
        return sum;
      }, 0);

      return total;
    },

    averageExpense(): number {
      const now = new Date();
      const currentDay = now.getDate();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      
      // Filtra apenas os gastos do mês atual
      const currentMonthExpenses = this.expenses.filter(expense => {
        try {
          const expenseDate = new Date(expense.date);
          return (expenseDate.getMonth() + 1) === currentMonth && 
                 expenseDate.getFullYear() === currentYear;
        } catch {
          return false;
        }
      });
      
      if (currentMonthExpenses.length === 0) return 0;
      
      // Soma total dos gastos do mês
      const monthlyTotal = currentMonthExpenses.reduce((sum, exp) => sum + exp.value, 0);
      
      // Calcula a média baseada nos dias decorridos do mês
      // Evita divisão por zero e garante pelo menos 1 dia
      const daysElapsed = Math.max(1, currentDay);
      
      // Retorna a média diária baseada nos dias decorridos
      return monthlyTotal / daysElapsed;
    },
  },

  actions: {
    async fetchExpenses() {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        const response = await $api.get<Expense[]>("/expenses");
        this.expenses = response.data;
      } catch (err: any) {
        this.error =
          "Failed to fetch expenses: " + (err.response?.data || err.message);
        console.error(this.error, err);
      } finally {
        this.loading = false;
      }
    },

    async addExpense(expensePayload: CreateExpensePayload) {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        const response = await $api.post<Expense>("/Expenses", expensePayload );
        this.expenses.push(response.data);
      } catch (err: any) {
        this.error =
          "Failed to add expense: " + (err.response?.data || err.message);
        console.error(this.error, err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateExpense(id: string, payload: UpdateExpensePayload) {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        await $api.put<Expense>(`/Expenses/${id}`, payload );
        await this.fetchExpenses();
      } catch (err: any) {
        this.error =
          "Failed to update expense: " + (err.response?.data || err.message);
        console.error(this.error, err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteExpense(id: string) {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        await $api.delete(`/Expenses/${id}`);
        this.expenses = this.expenses.filter((exp) => exp.id !== id);
      } catch (err: any) {
        this.error =
          "Failed to delete expense: " + (err.response?.data || err.message);
        console.error(this.error, err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchSalary() {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        const response = await $api.get<Salary[]>("/Salaries");

        if (response.data && response.data.length > 0) {
          const latestSalary = response.data.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB.getTime() - dateA.getTime();
          })[0];

          this.salary = latestSalary.value;
        } else {
          this.salary = 0;
        }
      } catch (err: any) {
        this.error =
          "Failed to fetch salary: " + (err.response?.data || err.message);
        console.error(this.error, err);
      } finally {
        this.loading = false;
      }
    },

    async setSalary(newValue: number) {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        const salaryPayload = {
          value: newValue,
          date: new Date().toISOString(),
        };
        await $api.post<Salary>("/Salaries", salaryPayload);

        await this.fetchSalary();
      } catch (err: any) {
        this.error =
          "Failed to update salary: " + (err.response?.data || err.message);
        console.error(this.error, err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
