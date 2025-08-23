<template>
  <div class="expense-dashboard">
    <v-sheet
      class="d-flex align-center pa-2 mb-4 sticky-nav bg-primary-gradient"
      rounded="lg"
      elevation="2"
    >
      <v-btn icon="mdi-chevron-left" variant="text" @click="previousMonth" />
      <v-spacer />
      <div class="text-h6 font-weight-medium text-center">
        {{ currentMonthLabel }}
      </div>
      <v-spacer />
      <v-btn
        icon="mdi-chevron-right"
        variant="text"
        @click="nextMonth"
      />
    </v-sheet>

    <div v-if="isLoading">
      <v-skeleton-loader type="card" class="mb-4"></v-skeleton-loader>
      <v-skeleton-loader type="list-item-avatar-two-line@3"></v-skeleton-loader>
    </div>

    <div v-else>
      <v-card
        v-if="expensesForCurrentMonth.length === 0"
        class="text-center pa-8"
        flat
      >
        <v-icon size="48" color="grey-lighten-1">mdi-database-off-outline</v-icon>
        <div class="text-h6 mt-4 text-grey">Nenhum gasto neste mês</div>
        <p class="text-body-2 text-medium-emphasis">
          Adicione um novo gasto para começar!
        </p>
      </v-card>
      
      <template v-else>
        <v-card variant="tonal" class="mb-6 pa-3" :color="progressColor">
          <div class="d-flex justify-space-between align-center">
            <div class="text-caption">Total Gasto</div>
            <div class="text-h5 font-weight-bold">
              {{ formatCurrency(monthlyTotal) }}
            </div>
          </div>
          <v-progress-linear
            :model-value="monthlyTotal"
            :max="expensesStore.salary || monthlyTotal"
            :color="progressColor === 'primary' ? 'blue' : progressColor"
            height="6"
            rounded
            class="my-2"
          />
          <div class="d-flex justify-space-between text-caption">
            <span>Orçamento: {{ formatCurrency(expensesStore.salary) }}</span>
            <span>Restante: {{ formatCurrency(expensesStore.salary - monthlyTotal) }}</span>
          </div>
        </v-card>

        <v-slide-y-transition group tag="div">
          <div
            v-for="[day, dayExpenses] in Object.entries(expensesGroupedByDay)"
            :key="day"
          >
            <div class="text-overline text-grey-darken-1 ps-2 my-2">
              {{ day }}
            </div>
            <v-list class="bg-transparent py-0" density="compact">
              <v-list-item
                v-for="expense in dayExpenses"
                :key="expense.id"
                class="expense-item-card mb-2"
                density="compact"
              >
                <template #prepend>
                  <v-avatar
                    :color="categoryMap[expense.categoryId]?.color || 'grey'"
                    size="36"
                  >
                    <v-icon color="white" size="18">{{
                      categoryMap[expense.categoryId]?.icon || "mdi-help-rhombus"
                    }}</v-icon>
                  </v-avatar>
                </template>

                <v-list-item-title class="font-weight-medium text-body-2">
                  {{ expense.description || categoryMap[expense.categoryId]?.name || "Sem categoria" }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  {{ categoryMap[expense.categoryId]?.name }}
                </v-list-item-subtitle>

                <template #append>
                  <div class="d-flex align-center">
                    <span
                      class="font-weight-bold me-1 text-body-2"
                      :class="`text-${expense.type === 'expense' ? 'error' : 'success'}`"
                    >
                      {{ formatCurrency(expense.value) }}
                    </span>
                    <v-menu offset-y>
                      <template #activator="{ props: menuProps }">
                        <v-btn v-bind="menuProps" icon="mdi-dots-vertical" variant="text" size="x-small" @click.stop />
                      </template>
                      <v-list density="compact">
                        <v-list-item @click="openEditDialog(expense)" prepend-icon="mdi-pencil">
                          <v-list-item-title>Editar</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="openDeleteDialog(expense.id)" prepend-icon="mdi-delete" class="text-error">
                          <v-list-item-title>Excluir</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </div>
        </v-slide-y-transition>
      </template>
    </div>

    <EditNumberDialog
      v-model="editDialog"
      :expense="editingExpense"
      title="Editar Gasto"
      @update:expense="handleExpenseUpdate"
    />
    <v-dialog v-model="deleteDialog" max-width="450" persistent>
      <v-card rounded="lg">
        <v-card-title class="text-h6 font-weight-bold text-red-darken-2 py-4 d-flex align-center">
          <v-icon class="me-3">mdi-alert-circle-outline</v-icon>
          Confirmar Exclusão
        </v-card-title>
        <v-card-text class="pb-6">
          Tem certeza que deseja excluir este gasto? Esta ação não pode ser desfeita.
        </v-card-text>
        <v-card-actions class="pb-4">
          <v-spacer />
          <v-btn variant="text" @click="cancelDelete">Cancelar</v-btn>
          <v-btn color="red-darken-2" variant="flat" @click="confirmDelete">Excluir</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
// O SCRIPT SETUP PODE PERMANECER O MESMO
import { ref, computed, onMounted } from "vue";
import {
  parseISO,
  format,
  getDaysInMonth,
  startOfMonth,
  addMonths,
  subMonths,
  isAfter,
  isToday,
  isYesterday,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Expense, UpdateExpensePayload, Category } from "~/types";
import { useExpensesStore } from "~/stores/useExpensesStore";
import { useCategoriesStore } from "~/stores/useCategoriesStore";
import EditNumberDialog from "~/components/dialogs/EditNumberDialog.vue";

const expensesStore = useExpensesStore();
const categoriesStore = useCategoriesStore();

const isLoading = ref(true);
const editDialog = ref(false);
const editingExpense = ref<Expense | null>(null);
const deleteDialog = ref(false);
const expenseIdToDelete = ref<string | null>(null);
const currentDate = ref(startOfMonth(new Date()));

interface CategoryDetail {
  name: string;
  icon: string;
  color: string;
}

const categoryMap = computed(() => {
  const map: Record<string, CategoryDetail> = {};
  categoriesStore.categories.forEach((cat: Category) => {
    if (cat.id) {
        map[cat.id] = {
        name: cat.name,
        icon: cat.icon || "mdi-shape-outline",
        color: cat.color || "primary",
      };
    }
  });
  return map;
});

const currentMonthLabel = computed(() => format(currentDate.value, "MMMM 'de' yyyy", { locale: ptBR }));
const currentMonthKey = computed(() => format(currentDate.value, "yyyy-MM"));

function nextMonth() {
  currentDate.value = addMonths(currentDate.value, 1);
}
function previousMonth() {
  currentDate.value = subMonths(currentDate.value, 1);
}

const expensesForCurrentMonth = computed(() => {
  if (isLoading.value) return [];
  return expensesStore.expenses
    .filter((exp: Expense) => exp.date && exp.date.startsWith(currentMonthKey.value))
    .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
});

const expensesGroupedByDay = computed(() => {
  const groups: Record<string, Expense[]> = {};
  for (const expense of expensesForCurrentMonth.value) {
    const expenseDate = parseISO(expense.date);
    let dayKey: string;
    
    if (isToday(expenseDate)) {
      dayKey = "Hoje";
    } else if (isYesterday(expenseDate)) {
      dayKey = "Ontem";
    } else {
      dayKey = format(expenseDate, "dd 'de' MMMM", { locale: ptBR });
    }

    if (!groups[dayKey]) {
      groups[dayKey] = [];
    }
    groups[dayKey].push(expense);
  }
  return groups;
});

const monthlyTotal = computed(() =>
  expensesForCurrentMonth.value.reduce((total, exp) => total + exp.value, 0)
);

const dailyAverage = computed(() => {
  if (!expensesForCurrentMonth.value.length) return 0;
  const daysInMonth = getDaysInMonth(currentDate.value);
  return monthlyTotal.value / daysInMonth;
});

const largestExpenseInMonth = computed(() => {
  if (!expensesForCurrentMonth.value.length) return 0;
  return Math.max(...expensesForCurrentMonth.value.map((e) => e.value));
});

const progressColor = computed(() => {
  if (!expensesStore.salary) return 'primary';
  const percentage = (monthlyTotal.value / expensesStore.salary) * 100;
  if (percentage > 90) return 'error';
  if (percentage > 70) return 'warning';
  return 'primary';
});

function openEditDialog(expense: Expense) {
  editingExpense.value = { ...expense };
  editDialog.value = true;
}

async function handleExpenseUpdate(updatedExpense: UpdateExpensePayload) {
  if (!editingExpense.value?.id) return;
  try {
    await expensesStore.updateExpense(editingExpense.value.id, updatedExpense);
    await expensesStore.fetchExpenses();
  } catch (err) {
    console.error("Erro ao atualizar gasto:", err);
  } finally {
    editDialog.value = false;
  }
}

function openDeleteDialog(expenseId: string) {
  expenseIdToDelete.value = expenseId;
  deleteDialog.value = true;
}

function cancelDelete() {
  deleteDialog.value = false;
  expenseIdToDelete.value = null;
}

async function confirmDelete() {
  if (expenseIdToDelete.value) {
    try {
      await expensesStore.deleteExpense(expenseIdToDelete.value);
      await expensesStore.fetchExpenses();
    } catch (err) {
      console.error("Erro ao excluir gasto:", err);
    }
  }
  cancelDelete();
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

onMounted(async () => {
  isLoading.value = true;
  try {
    await Promise.all([
      categoriesStore.fetchAllCategories(),
      expensesStore.fetchExpenses(),
      expensesStore.fetchSalary()
    ]);
  } catch (error) {
    console.error("Erro ao carregar dados iniciais:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.expense-dashboard {
  max-width: 800px;
  margin: 0 auto;
  padding: 8px;
}

.sticky-nav {
  position: sticky;
  top: 50px; /* Ajuste conforme a altura do seu header/app-bar */
  z-index: 100;
  background: linear-gradient(to right, rgb(var(--v-theme-primary)), rgba(var(--v-theme-primary), 0.7));
  color: white;
}

.expense-item-card {
  border: 1px solid rgba(var(--v-border-color), 0.6);
  border-radius: 12px;
  transition: background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  min-height: auto !important;
}

.expense-item-card:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
  border-color: rgba(var(--v-theme-primary), 0.5);
}

.expense-item-card :deep(.v-list-item__wrapper) {
  padding-top: 6px;
  padding-bottom: 6px;
}

:deep(.v-list-item__content) {
  overflow: visible;
}
</style>
```