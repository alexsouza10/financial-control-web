import { defineStore } from "pinia";

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
}

interface ExpensesState {
  expenses: Expense[];
}

export const useExpensesStore = defineStore("expenses", {
  state: (): ExpensesState => ({
    expenses: [],
  }),
  actions: {
    addExpense(expense: Omit<Expense, "id">) {
      const newExpense: Expense = {
        id: crypto.randomUUID(),
        ...expense,
      };
      this.expenses.push(newExpense);
    },
    removeExpense(id: string) {
      this.expenses = this.expenses.filter((expense) => expense.id !== id);
    },
    async fetchExpenses() {
      const storedExpenses = localStorage.getItem("finance-expenses");
      if (storedExpenses) {
        this.expenses = JSON.parse(storedExpenses);
      }
    },
    saveExpenses() {
      localStorage.setItem("finance-expenses", JSON.stringify(this.expenses));
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
