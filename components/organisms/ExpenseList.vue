<template>
  <v-expansion-panels multiple>
    <v-expansion-panel
      v-for="(expensesInMonth, month) in orderedGroupedExpenses"
      :key="month"
    >
      <v-expansion-panel-title>
        {{ month.charAt(0).toUpperCase() + month.slice(1) }}
      </v-expansion-panel-title>

      <v-expansion-panel-text>
        <v-list density="compact" class="expense-list">
          <v-list-item
            v-for="expense in expensesInMonth"
            :key="expense.id"
            class="expense-item"
            rounded
            elevation="2"
            :style="{ backgroundColor: themeColors.surface }"
          >
            <template #prepend>
              <v-avatar
                :color="themeColors.primary"
                class="white--text"
                size="40"
              >
                <v-icon size="28">{{
                  getCategoryIcon(expense.category)
                }}</v-icon>
              </v-avatar>
            </template>

            <v-list-item-content>
              <v-list-item-title class="text-body-1 font-semibold">
                {{ expense.category }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-body-small text-secondary">
                {{ formatDate(expense.date) }} • {{ expense.paymentMethod }} •
                Cartão: {{ expense.card }}
              </v-list-item-subtitle>
              <v-list-item-subtitle class="text-body-small text-secondary">
                Parcelas: {{ expense.installments }}x
              </v-list-item-subtitle>
            </v-list-item-content>

            <template #append>
              <div
                :style="{
                  color: amountColor(expense.value),
                  fontWeight: '700',
                  fontSize: '1.25rem',
                }"
              >
                R$ {{ expense.value.toFixed(2) }}
              </div>

              <v-btn
                icon
                color="primary"
                variant="text"
                @click="openEditDialog(expense)"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>

              <v-btn
                icon
                color="error"
                variant="text"
                @click="openDeleteDialog(expense.id)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
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

  <v-dialog v-model="deleteDialog" max-width="400" persistent>
    <v-card>
      <v-card-title class="text-h6">Confirmar Exclusão</v-card-title>
      <v-card-text>Tem certeza que deseja excluir este gasto?</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="secondary" variant="outlined" @click="cancelDelete">
          Cancelar
        </v-btn>
        <v-btn color="error" variant="flat" @click="confirmDelete">
          Excluir
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useTheme } from "vuetify";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import EditNumberDialog from "../dialogs/EditNumberDialog.vue";
import { useExpensesStore } from "~/stores/expenses";
import type { Expense, UpdateExpensePayload } from "~/types/expense";

const expensesStore = useExpensesStore();

const expenses = computed(() => expensesStore.expenses);

const editDialog = ref(false);
const editingExpense = ref<Expense | null>(null);

function openEditDialog(expense: Expense) {
  editingExpense.value = expense;
  editDialog.value = true;
}

async function handleExpenseUpdate(updatedExpense: Expense) {
  if (updatedExpense.id) {
    try {
      const payload: UpdateExpensePayload = {
        category: updatedExpense.category,
        paymentMethod: updatedExpense.paymentMethod,
        card: updatedExpense.card,
        installments: updatedExpense.installments,
        value: updatedExpense.value,
      };
      await expensesStore.updateExpense(updatedExpense.id, payload);
      alert("Gasto atualizado com sucesso!");
      window.location.reload();
    } catch (error) {
      console.error("Erro ao editar despesa:", error);
      alert("Erro ao editar despesa. Verifique o console.");
    } finally {
      editingExpense.value = null;
      editDialog.value = false;
    }
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
      alert("Gasto excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir despesa:", error);
      alert("Erro ao excluir despesa. Verifique o console.");
    }
  }
  cancelDelete();
}

const theme = useTheme();

const themeColors = computed(() => ({
  primary: theme.current.value.colors.primary,
  surface: theme.current.value.colors.surface,
  error: theme.current.value.colors.error,
  success: theme.current.value.colors.success,
  secondary: theme.current.value.colors.secondary,
}));

function formatDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), "dd MMM yyyy", { locale: ptBR });
  } catch (e) {
    console.error("Erro ao formatar data:", dateStr, e);
    return dateStr;
  }
}

function getCategoryIcon(category: string) {
  switch (category.toLowerCase()) {
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
    default:
      return "mdi-currency-usd";
  }
}

function amountColor(amount: number) {
  return amount > 0 ? themeColors.value.error : themeColors.value.success;
}

const groupedExpenses = computed(() => {
  const groups: Record<string, Expense[]> = {};

  if (expenses.value) {
    expenses.value.forEach((expense: Expense) => {
      const date = parseISO(expense.date);
      const key = format(date, "yyyy-MM");
      if (!groups[key]) groups[key] = [];
      groups[key].push(expense);
    });
  }
  return groups;
});

const orderedGroupedExpenses = computed(() => {
  const sortedKeys = Object.keys(groupedExpenses.value).sort((a, b) =>
    a < b ? 1 : -1
  );

  const result: Record<string, Expense[]> = {};
  sortedKeys.forEach((key) => {
    const label = format(parseISO(`${key}-01`), "MMMM yyyy", { locale: ptBR });
    result[label] = groupedExpenses.value[key];
  });
  return result;
});

onMounted(() => {
  expensesStore.fetchExpenses();
});
</script>

<style scoped>
.expense-list {
  max-width: 800px;
  margin: auto;
}

.expense-item {
  margin-bottom: 12px;
  padding: 12px;
  transition: box-shadow 0.25s ease;
}

.expense-item:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  cursor: default;
}
</style>
