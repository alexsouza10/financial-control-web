<template>
  <div class="mx-auto max-w-3xl pa-2">
    <v-sheet
      class="d-flex align-center pa-2 mb-4"
      rounded="md"
      elevation="2"
      color="primary"
      style="position: sticky; top: 50px; z-index: 100"
    >
      <v-btn icon="mdi-chevron-left" variant="text" @click="previousMonth" />
      <v-spacer />
      <div class="text-h6 font-weight-medium text-center">
        {{ currentMonthLabel }}
      </div>
      <v-spacer />
      <v-btn icon="mdi-chevron-right" variant="text" @click="nextMonth" />
    </v-sheet>

    <div v-if="isLoading">
      <v-skeleton-loader type="card" class="mb-4" />
      <v-skeleton-loader type="table" />
    </div>

    <v-card
      v-else-if="expensesForSelectedMonth.length === 0"
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
          <div class="text-caption">Total de Despesas no Mês</div>
          <div class="text-h5 font-weight-bold">
            {{ formatCurrency(monthlyTotal) }}
          </div>
        </div>
        <v-progress-linear
          :model-value="monthlyTotal"
          :max="currentSalary || monthlyTotal"
          :color="progressBarColor"
          height="6"
          rounded
          class="my-2"
        />
        <div class="d-flex justify-space-between text-caption mb-2">
          <span>Orçamento: {{ formatCurrency(currentSalary) }}</span>
          <span
            >Restante: {{ formatCurrency(currentSalary - monthlyTotal) }}</span
          >
        </div>

        <v-divider class="my-2" />
        <div
          class="d-flex justify-space-between text-caption font-weight-medium"
        >
          <span class="text-success"
            >Total Pago: {{ formatCurrency(totalPaid) }}</span
          >
          <span class="text-warning"
            >A Pagar: {{ formatCurrency(totalUnpaid) }}</span
          >
        </div>
      </v-card>

      <v-card rounded="md" elevation="2">
        <v-data-table
          :headers="headers"
          :items="expensesForSelectedMonth"
          density="compact"
          item-value="id"
          :row-props="getRowProps"
        >
          <template #item.category="{ item }">
            <v-icon
              size="small"
              :icon="categoryMap[item.categoryId]?.icon || 'mdi-help-circle'"
              class="mr-2"
            />
            {{ categoryMap[item.categoryId]?.name || "Sem categoria" }}
          </template>

          <template #item.description="{ value }">
            <span :class="{ 'text-medium-emphasis fst-italic': !value }">
              {{ value || "-" }}
            </span>
          </template>

          <template #item.date="{ value }">
            <span class="text-caption">
              {{ formatDate(value) }}
            </span>
          </template>

          <template #item.paid="{ item }">
            <v-checkbox-btn
              :model-value="item.paid"
              @click="togglePaid(item)"
              density="compact"
              color="success"
            />
          </template>

          <template #item.value="{ item }">
            <span
              class="font-weight-bold"
              :class="item.paid ? 'text-success' : 'text-error'"
            >
              {{ formatCurrency(item.value) }}
            </span>
          </template>

          <template #item.actions="{ item }">
            <div class="text-no-wrap">
              <v-btn
                icon="mdi-pencil"
                variant="text"
                size="x-small"
                @click="openEditDialog(item)"
              />
              <v-btn
                icon="mdi-delete"
                variant="text"
                size="x-small"
                @click="openDeleteDialog(item.id)"
              />
            </div>
          </template>
        </v-data-table>
      </v-card>
    </template>

    <EditNumberDialog
      v-model="editDialog"
      :expense="editingExpense"
      title="Editar Gasto"
      @update:expense="handleExpenseUpdate"
    />

    <v-dialog v-model="deleteDialog" max-width="450" persistent>
      <v-card rounded="lg">
        <v-card-title
          class="text-h6 font-weight-bold text-red-darken-2 py-4 d-flex align-center"
        >
          <v-icon class="me-3">mdi-alert-circle-outline</v-icon>
          Confirmar Exclusão
        </v-card-title>
        <v-card-text class="pb-6">
          Tem certeza que deseja excluir este gasto? Esta ação não pode ser
          desfeita.
        </v-card-text>
        <v-card-actions class="pb-4">
          <v-spacer />
          <v-btn variant="text" @click="cancelDelete">Cancelar</v-btn>
          <v-btn color="red-darken-2" variant="flat" @click="confirmDelete"
            >Excluir</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { parseISO, format } from "date-fns";
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

const { nextMonth, previousMonth } = expensesStore;

const { currentDate, expensesForSelectedMonth, totalsForSelectedMonth } =
  storeToRefs(expensesStore);

interface CategoryDetail {
  name: string;
  icon: string;
  color: string;
}

const headers = [
  { title: "Categoria", key: "category", sortable: false, align: "start" },
  { title: "Descrição", key: "description", sortable: false, align: "start" },
  { title: "Data", key: "date", align: "start" },
  { title: "Pago", key: "paid", sortable: false, align: "center" },
  { title: "Valor", key: "value", align: "end" },
  { title: "Ações", key: "actions", sortable: false, align: "center" },
];

const currentSalary = computed(() => expensesStore.salaryForSelectedMonth);

const categoryMap = computed(() => {
  return categoriesStore.categories.reduce((map, cat) => {
    if (cat.id) {
      map[cat.id] = {
        name: cat.name,
        icon: cat.icon || "mdi-shape-outline",
        color: cat.color || "primary",
      };
    }
    return map;
  }, {} as Record<string, CategoryDetail>);
});

const currentMonthLabel = computed(() => {
  const formattedDate = format(currentDate.value, "MMMM 'de' yyyy", {
    locale: ptBR,
  });
  return capitalizeFirstLetter(formattedDate);
});

const monthlyTotal = computed(() => totalsForSelectedMonth.value.total);
const totalPaid = computed(() => totalsForSelectedMonth.value.paid);
const totalUnpaid = computed(() => totalsForSelectedMonth.value.unpaid);

const progressColor = computed(() => {
  if (!currentSalary.value) return "primary";
  const percentage = (monthlyTotal.value / currentSalary.value) * 100;
  if (percentage > 90) return "error";
  if (percentage > 70) return "warning";
  return "primary";
});

const progressBarColor = computed(() => {
  return progressColor.value === "primary" ? "success" : progressColor.value;
});

function openEditDialog(expense: Expense) {
  editingExpense.value = { ...expense };
  editDialog.value = true;
}

async function handleExpenseUpdate(updatedExpense: UpdateExpensePayload) {
  if (!editingExpense.value?.id) return;
  try {
    await expensesStore.updateExpense(editingExpense.value.id, updatedExpense);
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
    } catch (err) {
      console.error("Erro ao excluir gasto:", err);
    }
  }
  cancelDelete();
}

async function togglePaid(expense: Expense) {
  if (!expense.id) {
    console.error("ID da despesa ausente para atualização.");
    return;
  }

  const newPaidStatus = !expense.paid;

  try {
    const payload: UpdateExpensePayload = {
      categoryId: expense.categoryId,
      value: expense.value,
      description: expense.description,
      paymentMethod: expense.paymentMethod,
      installments: expense.installments,
      card: expense.card,
      date: expense.date,
      paid: newPaidStatus,
    };
    await expensesStore.updateExpense(expense.id, payload);
  } catch (err) {
    console.error("Erro ao atualizar status de pagamento:", err);
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function formatDate(dateString: string) {
  if (!dateString) return "-";
  try {
    return format(parseISO(dateString), "dd/MM/yyyy", { locale: ptBR });
  } catch (e) {
    console.error("Data inválida:", dateString);
    return "-";
  }
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getRowProps({ item }: { item: Expense }) {
  return {
    class: item.paid ? "expense-paid" : "",
  };
}

onMounted(async () => {
  isLoading.value = true;
  try {
    await Promise.all([
      categoriesStore.fetchAllCategories(),
      expensesStore.fetchExpenses(),
      expensesStore.fetchSalary(),
    ]);
  } catch (error) {
    console.error("Erro ao carregar dados iniciais:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
:deep(.expense-paid) {
  opacity: 0.6;
  text-decoration: line-through;
  transition: opacity 0.3s ease-in-out;
}

:deep(.expense-paid .v-checkbox-btn) {
  text-decoration: none !important;
  opacity: 1 !important;
}

:deep(.expense-paid td) {
  text-decoration: inherit !important;
}
</style>
