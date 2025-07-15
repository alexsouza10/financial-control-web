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

    averageExpense(): number {
      return this.expenses.length > 0
        ? this.totalExpenses / this.expenses.length
        : 0;
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
