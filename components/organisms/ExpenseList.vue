<template>
  <v-expansion-panels
    multiple
    class="expense-panel-wrapper"
    variant="popout"
    flat
  >
    <v-expansion-panel
      v-for="[month, monthExpenses] in Object.entries(orderedGroupedExpenses)"
      :key="month"
      class="mb-2 mobile-panel"
      variant="popout"
      density="compact"
    >
      <v-expansion-panel-title
        class="font-weight-medium text-subtitle-2 px-2 px-sm-3 py-2"
        expand-icon="mdi-chevron-down"
        collapse-icon="mdi-chevron-up"
      >
        <div class="d-flex align-center text-truncate">
          <v-icon size="16" class="me-2">mdi-calendar-month</v-icon>
          <span class="text-truncate">{{ month }}</span>
        </div>
        <div class="d-flex align-center ml-auto flex-shrink-0">
          <v-tooltip location="top" :disabled="$vuetify.display.smAndDown">
            <template v-slot:activator="{ props }">
              <div v-bind="props" class="d-flex align-center">
                <v-icon size="14" class="me-1">mdi-cash-multiple</v-icon>
                <span class="text-no-wrap">{{
                  formatCurrency(calculateMonthlyTotal(monthExpenses))
                }}</span>
              </div>
            </template>
            <span>Total do mês</span>
          </v-tooltip>
          <v-tooltip location="top" :disabled="$vuetify.display.smAndDown">
            <template v-slot:activator="{ props }">
              <div v-bind="props" class="d-flex align-center ml-2 ml-sm-4">
                <v-icon size="14" class="me-1">mdi-calendar-today</v-icon>
                <span class="text-no-wrap"
                  >{{
                    formatCurrency(calculateDailyAverage(monthExpenses))
                  }}/dia</span
                >
              </div>
            </template>
            <span>Média diária</span>
          </v-tooltip>
        </div>
      </v-expansion-panel-title>
      <v-expansion-panel-text class="px-0 pt-1">
        <v-list class="expense-list-items" density="compact" nav>
          <v-list-item
            v-for="expense in monthExpenses"
            :key="expense.id"
            class="expense-item-card px-2 px-sm-3 py-2"
            :class="{ 'mobile-item': $vuetify.display.smAndDown }"
            :title="expense.description || 'Sem descrição'"
            :subtitle="formatDate(expense.date)"
            :value="expense.id"
            nav
          >
            <template #prepend>
              <v-avatar
                :color="getCategoryColor(expense.categoryId)"
                :size="$vuetify.display.smAndDown ? 32 : 36"
                class="mr-2"
              >
                <v-icon
                  :size="$vuetify.display.smAndDown ? 16 : 18"
                  color="white"
                >
                  {{ getCategoryIcon(expense.categoryId) }}
                </v-icon>
              </v-avatar>
            </template>

            <template #title>
              <div class="d-flex align-center">
                <span class="text-body-2 font-weight-medium text-truncate">
                  {{ expense.description || "Sem descrição" }}
                </span>
                <v-chip
                  v-if="expense.installments && expense.installments > 1"
                  size="x-small"
                  color="primary"
                  variant="tonal"
                  class="ms-2 flex-shrink-0"
                >
                  {{ expense.installments }}x
                </v-chip>
              </div>
            </template>

            <template #subtitle>
              <div class="d-flex align-center flex-wrap mt-1">
                <div class="d-flex align-center me-3">
                  <v-icon size="14" class="me-1">mdi-calendar</v-icon>
                  <span class="text-caption">{{
                    formatDate(expense.date)
                  }}</span>
                </div>
                <div class="d-flex align-center">
                  <v-icon size="14" class="me-1">mdi-tag</v-icon>
                  <span class="text-caption text-truncate">{{
                    getCategoryName(expense.categoryId)
                  }}</span>
                </div>
              </div>
            </template>

            <template #append>
              <div class="d-flex align-center">
                <span
                  class="text-body-2 font-weight-medium"
                  :class="[
                    `text-${amountColor(expense.value)}`,
                    { 'text-no-wrap': !$vuetify.display.smAndDown },
                  ]"
                >
                  {{ formatCurrency(expense.value) }}
                </span>
                <v-menu offset-y>
                  <template #activator="{ props: menuProps }">
                    <v-btn
                      v-bind="menuProps"
                      icon
                      variant="text"
                      size="x-small"
                      class="ml-1"
                      @click.stop
                    >
                      <v-icon :size="$vuetify.display.smAndDown ? 16 : 18"
                        >mdi-dots-vertical</v-icon
                      >
                    </v-btn>
                  </template>
                  <v-list density="compact">
                    <v-list-item @click="openEditDialog(expense)">
                      <template #prepend>
                        <v-icon size="small" class="me-2">mdi-pencil</v-icon>
                      </template>
                      <v-list-item-title>Editar</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="openDeleteDialog(expense.id)">
                      <template #prepend>
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
import { parseISO, format, getDaysInMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Expense, UpdateExpensePayload } from "~/types/expense";
import { useExpensesStore } from "~/stores/useExpensesStore";
import { useCategoriesStore } from "~/stores/useCategoriesStore";
import EditNumberDialog from "~/components/dialogs/EditNumberDialog.vue";

const expensesStore = useExpensesStore();
const categoriesStore = useCategoriesStore();

const themeColors = {
  primary: "primary",
  success: "success",
  error: "error",
} as const;

type ThemeColorValue = (typeof themeColors)[keyof typeof themeColors];

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

function openDeleteDialog(expenseId: string): void {
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

function formatDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), "dd MMM yyyy", { locale: ptBR });
  } catch (error) {
    console.warn(`Failed to parse date: ${dateStr}. Error: ${error}`);
    return dateStr;
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function calculateMonthlyTotal(expenses: Expense[]) {
  return expenses.reduce((total, expense) => total + expense.value, 0);
}

function calculateDailyAverage(expenses: Expense[]) {
  if (expenses.length === 0) return 0;

  const firstExpenseDate = parseISO(expenses[0].date);
  const year = firstExpenseDate.getFullYear();
  const month = firstExpenseDate.getMonth();

  const numberOfDaysInMonth = getDaysInMonth(new Date(year, month));

  const monthlyTotal = calculateMonthlyTotal(expenses);
  return monthlyTotal / numberOfDaysInMonth;
}

const getCategoryName = (categoryId: string | undefined): string => {
  if (!categoryId) return "Sem categoria";

  const trimmedCategoryId = categoryId.trim();

  const category = categoriesStore.categories.find((c: { id?: string }) => {
    const trimmedStoredCategoryId = c.id?.trim() || "";
    return trimmedStoredCategoryId === trimmedCategoryId;
  });

  if (!category) {
    console.warn(
      `getCategoryName: Category not found for ID: "${trimmedCategoryId}". ` +
        `Available categories in store:`,
      categoriesStore.categories.map((c: { id?: string; name: string }) => ({
        id: c.id,
        name: c.name,
      }))
    );
    return "Desconhecida";
  }
  return category.name;
};

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
    case "farmácia":
      return "mdi-medical-bag";
    default:
      return "mdi-currency-usd";
  }
}

function getCategoryColor(categoryId: string | undefined): ThemeColorValue {
  return themeColors.primary;
}

function amountColor(value: number): ThemeColorValue {
  return value <= 0 ? themeColors.success : themeColors.error;
}

const groupedExpenses = computed(() => {
  const groups: Record<string, Expense[]> = {};
  expensesStore.expenses.forEach((expense: Expense) => {
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
  max-width: 100%;
  margin: 0 auto;
  width: 100%;
}

/* Mobile styles */
@media (max-width: 960px) {
  .mobile-panel {
    margin: 4px 0;
  }

  .mobile-panel .v-expansion-panel-title {
    min-height: 48px;
    padding: 0 12px;
  }

  .mobile-panel .v-expansion-panel-text__wrapper {
    padding: 8px 4px;
  }

  .mobile-item {
    padding: 8px 4px !important;
  }

  .mobile-item .v-list-item__prepend {
    margin-right: 8px !important;
  }

  .mobile-item .v-list-item-title {
    font-size: 0.8125rem !important;
    line-height: 1.25;
  }

  .mobile-item .v-list-item-subtitle {
    font-size: 0.75rem !important;
    margin-top: 2px;
  }

  .mobile-item .v-avatar {
    width: 32px !important;
    height: 32px !important;
  }

  .mobile-item .v-avatar .v-icon {
    font-size: 16px !important;
  }
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

@media (max-width: 600px) {
  .v-expansion-panel-title .d-flex {
    flex-direction: column;
    align-items: flex-start !important;
  }
  .v-expansion-panel-title .d-flex .d-flex.align-center {
    width: 100%;
    justify-content: space-between;
  }
  .v-expansion-panel-title .d-flex .d-flex:last-child {
    margin-left: 0 !important;
    margin-top: 4px;
  }
  .expense-item-card {
    padding: 8px 10px !important;
  }
  .v-list-item-title {
    font-size: 0.85rem !important;
  }
  .v-list-item-subtitle {
    font-size: 0.65rem !important;
  }
}
</style>
