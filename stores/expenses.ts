import { defineStore } from "pinia";

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
}

interface ExpensesState {
  expenses: Expense[];
  salary: number;
}

export const useExpensesStore = defineStore("expenses", {
  state: (): ExpensesState => ({
    expenses: [],
    salary: 3000, // valor inicial padrão
  }),

  actions: {
    addExpense(expense: Omit<Expense, "id">) {
      const newExpense: Expense = {
        id: crypto.randomUUID(),
        ...expense,
      };
      this.expenses.push(newExpense);
      this.saveExpenses();
    },

    removeExpense(id: string) {
      this.expenses = this.expenses.filter((expense) => expense.id !== id);
      this.saveExpenses();
    },

    async fetchExpenses() {
      const storedData = localStorage.getItem("finance-data");
      if (storedData) {
        const parsed = JSON.parse(storedData);
        this.expenses = parsed.expenses || [];
        this.salary = parsed.salary ?? 3000;
      }
    },

    saveExpenses() {
      const data = {
        expenses: this.expenses,
        salary: this.salary,
      };
      localStorage.setItem("finance-data", JSON.stringify(data));
    },

    setSalary(newSalary: number) {
      this.salary = newSalary;
      this.saveExpenses();
    },
  },

  getters: {
    totalExpenses(state): number {
      return state.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    },

    averageExpense(): number {
      if (this.expenses.length === 0) return 0;
      return this.totalExpenses / this.expenses.length;
    },

    expensesByMonth(state) {
      const grouped: { [key: string]: Expense[] } = {};
      state.expenses.forEach((expense) => {
        const monthYear = expense.date.substring(0, 7);
        if (!grouped[monthYear]) {
          grouped[monthYear] = [];
        }
        grouped[monthYear].push(expense);
      });
      return grouped;
    },
  },
});
