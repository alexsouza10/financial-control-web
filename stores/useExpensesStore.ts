import { defineStore } from "pinia";
import { useNuxtApp } from "#app";
import {
  format,
  startOfMonth,
  addMonths,
  subMonths,
  getDaysInMonth,
} from "date-fns";
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
  currentDate: Date;
}

export const useExpensesStore = defineStore("expenses", {
  state: (): ExpensesState => ({
    expenses: [],
    salary: 0,
    loading: false,
    error: null,
    currentDate: startOfMonth(new Date()),
  }),

  getters: {
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

    totalExpenses: (state: ExpensesState): number =>
      state.expenses.reduce(
        (sum: number, expense: Expense) => sum + expense.value,
        0
      ),

    currentMonthExpenses(state): number {
      return (this as any).totalsForSelectedMonth.total; 
    },

    averageExpense(state): number {
      const monthlyTotal = (this as any).totalsForSelectedMonth.total;
      if (monthlyTotal === 0) return 0;

      const today = new Date();
      const isCurrentMonth =
        state.currentDate.getMonth() === today.getMonth() &&
        state.currentDate.getFullYear() === today.getFullYear();

      const daysInMonth = getDaysInMonth(state.currentDate);

      const daysToDivideBy = isCurrentMonth ? today.getDate() : daysInMonth;

      return monthlyTotal / Math.max(1, daysToDivideBy);
    },
  },

  actions: {
    nextMonth() {
      this.currentDate = addMonths(this.currentDate, 1);
    },
    previousMonth() {
      this.currentDate = subMonths(this.currentDate, 1);
    },

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
        const response = await $api.post<Expense>("/Expenses", expensePayload);
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
        await $api.put<Expense>(`/Expenses/${id}`, payload);
        const index = this.expenses.findIndex((exp) => exp.id === id);
        if (index !== -1) {
          this.expenses[index] = {
            ...this.expenses[index],
            ...payload,
            id: id,
          } as Expense;
        }
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