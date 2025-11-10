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
} from "~/types/expense"; // Certifique-se que seus tipos estão corretos

interface ExpensesState {
 expenses: Expense[];
 salaries: Salary[]; // Armazena TODOS os salários buscados
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
  // --- Getters de data e despesas ---
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
  // ... (outros getters de despesas)

  // ====================================================================
  // **** GETTER ATUALIZADO (PEGA O SALÁRIO MAIS RECENTE DO MÊS) ****
  salaryForSelectedMonth(state): number {
   // 1. Pega a chave do mês, ex: "2025-11"
   const key = (this as any).currentMonthKey;
   if (!state.salaries || state.salaries.length === 0) {
    return 0;
   }

   // 2. Filtra TODOS os salários que começam com a chave (ex: "2025-11-01" e "2025-11-07")
   const salariesForMonth = state.salaries.filter((s) =>
    s.date && s.date.startsWith(key)
   );

   // 3. Se não achar nenhum, retorna 0 (como você pediu)
   if (salariesForMonth.length === 0) {
    return 0;
   }

   // 4. Se achou, ordena a lista para pegar o mais recente primeiro
   salariesForMonth.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA; // Ordena do mais recente (B) para o mais antigo (A)
   });

   // 5. Retorna o valor do primeiro item, que agora é o mais recente
   return salariesForMonth[0].value;
  },
  // ====================================================================
 },

 actions: {
  // --- Ações de data ---
  nextMonth() {
   this.currentDate = addMonths(this.currentDate, 1);
  },
  previousMonth() {
   this.currentDate = subMonths(this.currentDate, 1);
  },

  // --- Ações de API (Despesas) ---
  async fetchExpenses() {
   // "Guarda": Se já tem despesas ou está carregando, para.
   if (this.expenses.length > 0 || this.loading) {
    return;
   }

   const { $api } = useNuxtApp();
   this.loading = true;
   this.error = null;
   try {
    const response = await $api.get<Expense[]>("/expenses"); // Ajuste o endpoint se necessário
    this.expenses = response.data;
   } catch (err: any) {
    this.error =
     "Failed to fetch expenses: " + (err.response?.data || err.message);
    console.error(this.error, err);
   } finally {
    this.loading = false;
   }
  },
  // ... (addExpense, updateExpense, deleteExpense - sem mudanças) ...
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

  // --- Ações de API (Salário) ---

  async fetchSalary() {
   // "Guarda" atualizada para verificar o array
   if (this.salaries.length > 0 || this.loading) {
    return;
   }

   const { $api } = useNuxtApp();
   this.loading = true;
   this.error = null;
   try {
    const response = await $api.get<Salary[]>("/Salaries");
    // Armazena *todos* os salários
    this.salaries = response.data || [];
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
   // Pega a chave do mês *selecionado* (ex: "2025-11")
   const monthKey = (this as any).currentMonthKey;
   
   // Envia a data do dia 1 do mês selecionado
   const monthDate = new Date(`${monthKey}-01T12:00:00Z`);

   this.loading = true;
   this.error = null;
   
   try {
    const salaryPayload = {
     value: newValue,
     date: monthDate.toISOString(), // Envia a data do dia 1
    };
    
    // O backend (que você corrigiu) fará o "Upsert"
    const response = await $api.post<Salary>("/Salaries", salaryPayload);

    // Atualiza o array local 'salaries'
    // Tenta encontrar um salário *exato* (baseado na data normalizada do backend)
    const returnedDateKey = response.data.date.substring(0, 7); // ex: "2025-11"
    const existingIndex = this.salaries.findIndex(s => s.date.startsWith(returnedDateKey));
    
    if (existingIndex !== -1) {
     // Se já existia, atualiza
     this.salaries[existingIndex] = response.data;
    } else {
     // Se era novo, adiciona
     this.salaries.push(response.data);
    }
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