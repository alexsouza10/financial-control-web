<template>
  <v-expansion-panels multiple class="expense-panel-wrapper" variant="popout">
    <v-expansion-panel
      v-for="(expensesInMonth, month) in orderedGroupedExpenses"
      :key="month"
      elevation="0"
      class="mb-2"
    >
      <v-expansion-panel-title class="font-weight-medium text-subtitle-2 px-3 py-2">
        <div class="d-flex justify-space-between align-center w-100">
          <div class="d-flex align-center">
            <v-icon size="small" class="me-2">mdi-calendar-month</v-icon>
            {{ month.charAt(0).toUpperCase() + month.slice(1) }}
          </div>
          <div class="d-flex align-center text-caption text-medium-emphasis">
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <div v-bind="props" class="d-flex align-center">
                  <v-icon size="14" class="me-1">mdi-cash-multiple</v-icon>
                  {{ formatCurrency(calculateMonthlyTotal(expensesInMonth)) }}
                </div>
              </template>
              <span>Total do mês</span>
            </v-tooltip>
            <v-divider vertical class="mx-2" />
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <div v-bind="props" class="d-flex align-center">
                  <v-icon size="14" class="me-1">mdi-calendar-today</v-icon>
                  {{ formatCurrency(calculateDailyAverage(expensesInMonth)) }}/dia
                </div>
              </template>
              <span>Média diária</span>
            </v-tooltip>
          </div>
        </div>
      </v-expansion-panel-title>
      <v-expansion-panel-text class="px-0 pt-1">
        <v-list class="expense-list-items" density="compact">
          <v-list-item
            v-for="expense in expensesInMonth"
            :key="expense.id"
            class="expense-item-card px-3 py-2"
            rounded="lg"
            variant="outlined"
          >
            <template #prepend>
              <v-avatar :color="getCategoryColor(expense.categoryId)" size="36">
                <v-icon size="20">{{ getCategoryIcon(expense.categoryId) }}</v-icon>
              </v-avatar>
            </template>

            <v-list-item-title class="text-body-2 font-weight-medium">
              {{ getCategoryName(expense.categoryId) }}
              <div class="text-caption text-medium-emphasis">
                {{ formatDate(expense.date) }}
                <v-tooltip location="top" v-if="expense.paymentMethod === 'Cartão de Crédito'">
                  <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" size="14" class="ml-1">mdi-credit-card-outline</v-icon>
                  </template>
                  <span>{{ expense.card }} • {{ expense.installments }}x</span>
                </v-tooltip>
              </div>
            </v-list-item-title>

            <v-list-item-subtitle class="text-caption text-medium-emphasis text-truncate">
              {{ expense.description || 'Sem descrição' }}
            </v-list-item-subtitle>

            <template #append>
              <div class="d-flex align-center">
                <span class="font-weight-bold" :style="{ color: amountColor(expense.value) }">
                  R$ {{ expense.value.toFixed(2) }}
                </span>
                <v-menu offset-x>
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon
                      variant="text"
                      size="x-small"
                      class="ml-1"
                      color="grey"
                    >
                      <v-icon size="18">mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list density="compact">
                    <v-list-item @click="openEditDialog(expense)">
                      <template v-slot:prepend>
                        <v-icon size="small" class="me-2">mdi-pencil</v-icon>
                      </template>
                      <v-list-item-title>Editar</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="openDeleteDialog(expense.id)">
                      <template v-slot:prepend>
                        <v-icon size="small" class="me-2">mdi-delete</v-icon>
                      </template>
                      <v-list-item-title>Excluir</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </template>
          </v-list-item>
        </v-list>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>

  <EditNumberDialog
    v-model="editDialog"
    :expense="editingExpense"
    title="Editar Gasto"
    @update:expense="handleExpenseUpdate"
  />

  <v-dialog v-model="deleteDialog" max-width="450" persistent>
    <v-card rounded="lg">
      <v-card-title class="text-h6 text-center text-red-darken-2 py-4">
        <v-icon left class="mr-2">mdi-alert-circle</v-icon>
        Confirmar Exclusão
      </v-card-title>
      <v-card-text class="text-center text-body-1 text-grey-darken-2 pb-6">
        Tem certeza de que deseja excluir este gasto?
        <br />
        Esta ação não pode ser desfeita.
      </v-card-text>
      <v-card-actions class="justify-center pb-4">
        <v-btn
          color="grey-darken-1"
          variant="flat"
          @click="cancelDelete"
          class="text-capitalize"
          rounded
        >
          Cancelar
        </v-btn>
        <v-btn
          color="red-darken-2"
          variant="flat"
          @click="confirmDelete"
          class="text-capitalize"
          rounded
        >
          Excluir
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useTheme } from "vuetify";
import { parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import EditNumberDialog from "../dialogs/EditNumberDialog.vue";
import { useExpensesStore } from "~/stores/useExpensesStore";
import { useCategoriesStore } from "#imports";
import type { Expense, UpdateExpensePayload } from "~/types/expense";

const expensesStore = useExpensesStore();
const categoriesStore = useCategoriesStore();

const expenses = computed(() => expensesStore.expenses);

const editDialog = ref(false);
const editingExpense = ref<Expense | null>(null);

function openEditDialog(expense: Expense) {
  editingExpense.value = expense;
  editDialog.value = true;
}

async function handleExpenseUpdate(updatedExpense: Expense) {
  try {
    const payload: UpdateExpensePayload = {
      categoryId: updatedExpense.categoryId,
      paymentMethod: updatedExpense.paymentMethod,
      card: updatedExpense.card,
      installments: updatedExpense.installments,
      value: updatedExpense.value,
      date: updatedExpense.date,
      description: updatedExpense.description,
    };
    await expensesStore.updateExpense(updatedExpense.id, payload);
    await expensesStore.fetchExpenses();
  } catch (err) {
    console.error("Erro ao atualizar gasto:", err);
  } finally {
    editDialog.value = false;
    editingExpense.value = null;
  }
}

const deleteDialog = ref(false);
const expenseIdToDelete = ref<string | null>(null);

function openDeleteDialog(id: string) {
  expenseIdToDelete.value = id;
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

const theme = useTheme();
const themeColors = computed(() => theme.current.value.colors);

function formatDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), "dd MMM yyyy", { locale: ptBR });
  } catch {
    return dateStr;
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

function calculateMonthlyTotal(expenses: any[]) {
  return expenses.reduce((total, expense) => total + expense.value, 0);
}

function calculateDailyAverage(expenses: any[]) {
  if (expenses.length === 0) return 0;
  
  const dailyTotals: Record<string, number> = {};
  
  expenses.forEach(expense => {
    const date = format(parseISO(expense.date), 'yyyy-MM-dd');
    if (!dailyTotals[date]) {
      dailyTotals[date] = 0;
    }
    dailyTotals[date] += expense.value;
  });
  
  const totalDays = Object.keys(dailyTotals).length;
  if (totalDays === 0) return 0;
  
  const monthlyTotal = calculateMonthlyTotal(expenses);
  return monthlyTotal / totalDays;
}

function getCategoryName(categoryId: string | undefined): string {
  if (!categoryId) {
    console.warn(
      'getCategoryName: categoryId is undefined or null. Defaulting to "Desconhecida".'
    );
    return "Desconhecida";
  }
  const trimmedCategoryId = categoryId.trim();

  const category = categoriesStore.categories.find((c) => {
    const trimmedStoredCategoryId = c.id?.trim();
    return trimmedStoredCategoryId === trimmedCategoryId;
  });

  if (!category) {
    console.warn(
      `getCategoryName: Category not found for ID: "${trimmedCategoryId}". ` +
        `Available categories in store:`,
      categoriesStore.categories.map((c) => ({ id: c.id, name: c.name }))
    );
    return "Desconhecida";
  }
  return category.name;
}

function getCategoryIcon(categoryId: string | undefined) {
  const categoryName = getCategoryName(categoryId);
  switch (categoryName.toLowerCase()) {
    case "alimentação":
      return "mdi-food";
    case "transporte":
      return "mdi-bus";
    case "saúde":
      return "mdi-hospital-box";
    case "lazer":
      return "mdi-gamepad-variant";
    case "contas":
      return "mdi-cash-multiple";
    case "carro":
      return "mdi-car";
    case "farmaciaaaaaaaaaaaaaaa":
      return "mdi-medical-bag";
    default:
      return "mdi-currency-usd";
  }
}

function getCategoryColor(categoryId: string | undefined): string {
  return themeColors.value.primary;
}

function amountColor(value: number) {
  return value <= 0 ? themeColors.value.success : themeColors.value.error;
}

const groupedExpenses = computed(() => {
  const groups: Record<string, Expense[]> = {};
  expenses.value.forEach((expense) => {
    const date = parseISO(expense.date);
    const key = format(date, "yyyy-MM");
    if (!groups[key]) groups[key] = [];
    groups[key].push(expense);
  });
  return groups;
});

const orderedGroupedExpenses = computed(() => {
  const sortedKeys = Object.keys(groupedExpenses.value).sort((a, b) =>
    b.localeCompare(a)
  );
  const result: Record<string, Expense[]> = {};
  sortedKeys.forEach((key) => {
    const label = format(parseISO(`${key}-01`), "MMMM yyyy", { locale: ptBR });
    result[label] = groupedExpenses.value[key].sort(
      (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()
    );
  });
  return result;
});

onMounted(() => {
  categoriesStore.fetchAllCategories().then(() => {
    console.log("Categories loaded in store:", categoriesStore.categories);
    expensesStore.fetchExpenses();
  });
});
</script>

<style scoped>
.expense-panel-wrapper {
  max-width: 900px;
  margin: 8px auto;
}

:deep(.v-expansion-panel-title) {
  min-height: 40px !important;
  padding: 0 12px !important;
}

:deep(.v-expansion-panel-text__wrapper) {
  padding: 4px 0 0 0 !important;
}

.expense-list-items {
  padding: 0;
  background-color: transparent;
}

.expense-item-card {
  margin-bottom: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.expense-item-card:hover {
  background-color: rgba(var(--v-theme-primary), 0.03);
}

.v-list-item--variant-outlined {
  border: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.v-list-item-title {
  line-height: 1.2;
  margin-bottom: 2px;
}

.v-list-item-subtitle {
  opacity: 0.8;
  font-size: 0.7rem !important;
}
</style>
