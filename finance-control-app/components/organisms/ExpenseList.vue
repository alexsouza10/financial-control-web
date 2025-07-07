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
            <v-list-item-avatar
              :color="themeColors.primary"
              class="white--text"
              size="40"
            >
              <v-icon size="28">{{ getCategoryIcon(expense.category) }}</v-icon>
            </v-list-item-avatar>

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

            <v-list-item-action>
              <div
                :style="{
                  color: amountColor(expense.amount),
                  fontWeight: '700',
                  fontSize: '1.25rem',
                }"
              >
                R$ {{ expense.amount.toFixed(2) }}
              </div>
            </v-list-item-action>

            <v-list-item-action>
              <v-btn icon color="primary" @click="openEditDialog(expense)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </v-list-item-action>

            <v-list-item-action>
              <v-btn icon color="error" @click="openDeleteDialog(expense.id)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>

  <!-- Diálogo de edição -->
  <EditNumberDialog
    v-model="editDialog"
    :value="editableAmount"
    title="Editar valor"
    label="Novo valor"
    suffix="R$"
    @update:value="confirmEdit"
  />

  <!-- Diálogo de exclusão -->
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
import { ref, computed } from "vue";
import { useTheme } from "vuetify";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import EditNumberDialog from "../dialogs/EditNumberDialog.vue";

const props = defineProps<{
  expenses: {
    id: string;
    category: string;
    amount: number;
    date: string;
    paymentMethod: string;
    card: string;
    installments: number;
  }[];
}>();

const emit = defineEmits<{
  (e: "delete", id: string): void;
  (e: "edit", payload: { id: string; amount: number }): void;
}>();

// Editar
const editDialog = ref(false);
const editableAmount = ref(0);
const editingExpenseId = ref<string | null>(null);

function openEditDialog(expense: (typeof props.expenses)[0]) {
  editingExpenseId.value = expense.id;
  editableAmount.value = expense.amount;
  editDialog.value = true;
}

function confirmEdit(newAmount: number) {
  if (editingExpenseId.value) {
    emit("edit", { id: editingExpenseId.value, amount: newAmount });
    editDialog.value = false;
  }
}

// Excluir
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

function confirmDelete() {
  if (expenseIdToDelete.value) {
    emit("delete", expenseIdToDelete.value);
  }
  cancelDelete();
}

// Helpers
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
    return format(new Date(dateStr), "dd MMM yyyy", { locale: ptBR });
  } catch {
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
  return amount > 0 ? themeColors.error : themeColors.success;
}

// Agrupamento e ordenação
const groupedExpenses = computed(() => {
  const groups: Record<string, typeof props.expenses> = {};

  props.expenses.forEach((expense) => {
    const date = parseISO(expense.date);
    const key = format(date, "yyyy-MM");
    if (!groups[key]) groups[key] = [];
    groups[key].push(expense);
  });

  return groups;
});

const orderedGroupedExpenses = computed(() => {
  const sortedKeys = Object.keys(groupedExpenses.value).sort((a, b) =>
    a < b ? 1 : -1
  );

  const result: Record<string, typeof props.expenses> = {};
  sortedKeys.forEach((key) => {
    const label = format(parseISO(`${key}-01`), "MMMM yyyy", { locale: ptBR });
    result[label] = groupedExpenses.value[key];
  });

  return result;
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
