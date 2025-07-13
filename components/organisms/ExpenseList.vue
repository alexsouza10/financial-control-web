<template>
  <v-expansion-panels multiple class="expense-panel-wrapper">
    <v-expansion-panel
      v-for="(expensesInMonth, month) in orderedGroupedExpenses"
      :key="month"
      elevation="2"
      rounded="lg"
      class="mb-4"
    >
      <v-expansion-panel-title class="font-weight-bold text-h6 text-primary">
        {{ month.charAt(0).toUpperCase() + month.slice(1) }}
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-list class="expense-list-items">
          <v-list-item
            v-for="expense in expensesInMonth"
            :key="expense.id"
            class="expense-item-card"
            rounded="lg"
            elevation="1"
          >
            {{ console.log("Current Expense Object:", expense) }}

            <template #prepend>
              <v-avatar :color="getCategoryColor(expense.categoryId)" size="48">
                <v-icon size="32">{{
                  getCategoryIcon(expense.categoryId)
                }}</v-icon>
              </v-avatar>
            </template>

            <v-list-item-content>
              <v-list-item-title class="font-weight-bold text-subtitle-1">
                {{ getCategoryName(expense.categoryId) }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-body-2 text-medium-emphasis">
                {{ expense.description }}
              </v-list-item-subtitle>
              <v-list-item-subtitle class="text-caption text-disabled mt-1">
                {{ formatDate(expense.date) }} • {{ expense.paymentMethod }}
                <template v-if="expense.paymentMethod === 'Cartão de Crédito'">
                  • {{ expense.card }} • Parcelas: {{ expense.installments }}x
                </template>
              </v-list-item-subtitle>
            </v-list-item-content>

            <template #append>
              <div class="d-flex flex-column align-end">
                <span
                  class="font-weight-bold text-h6"
                  :style="{ color: amountColor(expense.value) }"
                >
                  R$ {{ expense.value.toFixed(2) }}
                </span>
                <div class="expense-actions mt-2">
                  <v-btn
                    icon
                    variant="text"
                    color="primary"
                    size="small"
                    @click="openEditDialog(expense)"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    variant="text"
                    color="error"
                    size="small"
                    @click="openDeleteDialog(expense.id)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </div>
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
  margin: 20px auto;
}

.expense-list-items {
  padding: 0;
  background-color: transparent;
}

.expense-item-card {
  margin-bottom: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
  background-color: rgb(var(--v-theme-surface-lighten1));
}

.expense-item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}

.v-list-item-content {
  flex-grow: 1;
  padding-right: 16px;
}

.expense-actions {
  display: flex;
  gap: 4px;
}

.text-body-2 {
  line-height: 1.4;
}

.text-caption {
  line-height: 1.3;
}
</style>
