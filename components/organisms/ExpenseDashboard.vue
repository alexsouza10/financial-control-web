<template>
  <v-container fluid class="analytics-dashboard">
    <v-card class="mb-6 pa-4 rounded-xl elevation-3">
      <v-row align="center" justify="space-between">
        <v-col cols="12" md="6" class="d-flex align-center">
          <v-icon color="primary" size="30" class="mr-3">
            mdi-chart-areaspline
          </v-icon>
          <div>
            <h2 class="text-h5 font-weight-medium mb-1">Análise Financeira</h2>
            <div class="text-body-2 text-medium-emphasis">
              Visualize e analise suas despesas em detalhes
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <v-card class="mb-6" elevation="2">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedPeriod"
              :items="dateRanges"
              label="Período"
              density="comfortable"
              variant="outlined"
              item-title="text"
              item-value="value"
              hide-details
              class="mb-4"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-menu
              v-model="startMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              min-width="auto"
              offset-y
            >
              <template v-slot:activator="{ props }">
                <v-text-field
                  v-model="formattedStartDate"
                  label="Data Inicial"
                  prepend-inner-icon="mdi-calendar"
                  readonly
                  v-bind="props"
                  variant="outlined"
                  density="comfortable"
                  clearable
                  @click:clear="startDate = ''"
                  :disabled="selectedPeriod !== 'custom'"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="startDate"
                @update:model-value="startMenu = false"
                :max="endDate || format(new Date(), 'yyyy-MM-dd')"
              ></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="12" md="3">
            <v-menu
              v-model="endMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              min-width="auto"
              offset-y
            >
              <template v-slot:activator="{ props }">
                <v-text-field
                  v-model="formattedEndDate"
                  label="Data Final"
                  prepend-inner-icon="mdi-calendar"
                  readonly
                  v-bind="props"
                  variant="outlined"
                  density="comfortable"
                  clearable
                  @click:clear="endDate = ''"
                  :disabled="selectedPeriod !== 'custom'"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="endDate"
                @update:model-value="endMenu = false"
                :min="startDate"
                :max="format(new Date(), 'yyyy-MM-dd')"
              ></v-date-picker>
            </v-menu>
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="groupBy"
              :items="[
                { text: 'Dia', value: 'day' },
                { text: 'Semana', value: 'week' },
                { text: 'Mês', value: 'month' },
              ]"
              label="Agrupar por"
              variant="outlined"
              density="comfortable"
              hide-details
              item-title="text"
              item-value="value"
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-row class="mb-6">
      <v-col
        v-for="(stat, index) in summaryStats"
        :key="index"
        cols="12"
        sm="6"
        md="3"
      >
        <v-card height="100%" :color="stat.color" dark>
          <v-card-text class="pa-4">
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-subtitle-2 mb-1">{{ stat.title }}</div>
                <div class="text-h5 font-weight-bold">
                  {{
                    stat.valueFormatter
                      ? stat.valueFormatter(stat.value)
                      : formatCurrency(stat.value)
                  }}
                </div>
                <div
                  v-if="stat.change !== undefined"
                  class="text-caption d-flex align-center mt-1"
                >
                  <v-icon
                    :color="stat.change >= 0 ? 'green' : 'red'"
                    size="small"
                  >
                    {{ stat.change >= 0 ? "mdi-arrow-up" : "mdi-arrow-down" }}
                  </v-icon>
                  <span class="ml-1">
                    {{ Math.abs(stat.change).toFixed(1) }}%
                    {{ stat.changeLabel || "em relação ao período anterior" }}
                  </span>
                </div>
              </div>
              <v-avatar :color="stat.iconColor" size="48" class="elevation-4">
                <v-icon>{{ stat.icon }}</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mb-6">
      <v-col cols="12" md="6" class="d-flex">
        <v-card class="d-flex flex-column flex-grow-1">
          <v-card-title class="text-h6 py-4 px-4">
            Despesas ao Longo do Tempo
          </v-card-title>
          <v-divider></v-divider>
          <ExpenseLineChart
            :data="lineChartData"
            :group-by="groupBy"
            :height="400"
            class="w-100"
          />
        </v-card>
      </v-col>
      <v-col cols="12" md="6" class="d-flex">
        <v-card class="d-flex flex-column flex-grow-1">
          <v-card-title class="text-h6 py-4 px-4">
            Distribuição por Categoria
          </v-card-title>
          <v-divider></v-divider>
          <CategoryPieChart :data="pieChartData" :height="350" class="w-100" />
        </v-card>
      </v-col>
    </v-row>

    <v-card class="mb-6">
      <v-card-title class="d-flex flex-wrap align-center">
        <span class="text-subtitle-1 text-sm-h6">Despesas por Categoria</span>
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          color="primary"
          size="small"
          @click="toggleCategoryTable"
          class="mt-1 mt-sm-0"
        >
          {{ showCategoryTable ? "Ocultar Detalhes" : "Mostrar Detalhes" }}
          <v-icon right>{{
            showCategoryTable ? "mdi-chevron-up" : "mdi-chevron-down"
          }}</v-icon>
        </v-btn>
      </v-card-title>
      <v-expand-transition>
        <div v-show="showCategoryTable">
          <v-card-text class="pa-2 pa-sm-4">
            <v-data-table
              :headers="categoryHeaders"
              :items="categoryBreakdown"
              :items-per-page="5"
              class="elevation-1"
              :mobile-breakpoint="0"
              :footer-props="{
                'items-per-page-options': [5, 10, 15],
                'items-per-page-text': 'Itens por página:',
              }"
              :header-props="{ sortIcon: 'mdi-arrow-up' }"
              :hide-default-footer="categoryBreakdown.length <= 5"
            >
              <template v-slot:item.amount="{ item }">
                <span class="text-no-wrap">{{
                  formatCurrency(item.amount)
                }}</span>
              </template>
              <template v-slot:item.percentage="{ item }">
                <div class="d-flex align-center">
                  <span
                    class="text-caption text-medium-emphasis mr-2 d-none d-sm-inline"
                    >{{ Math.ceil(item.percentage) }}%</span
                  >
                  <v-progress-linear
                    :model-value="item.percentage"
                    height="16"
                    :color="getCategoryColor(item.category)"
                    rounded
                    class="flex-grow-1"
                  >
                    <template
                      v-slot:default="{ value }"
                      v-if="$vuetify.display.smAndDown"
                    >
                      <strong class="text-caption"
                        >{{ Math.ceil(value) }}%</strong
                      >
                    </template>
                  </v-progress-linear>
                </div>
              </template>
              <template v-slot:no-data>
                <div class="py-4 text-center text-medium-emphasis">
                  Nenhuma despesa encontrada
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </div>
      </v-expand-transition>
    </v-card>

    <v-card class="mb-6">
      <v-card-title class="d-flex flex-wrap align-center">
        <span class="text-subtitle-1 text-sm-h6">Transações Recentes</span>
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          color="primary"
          size="small"
          @click="toggleTransactionsTable"
          class="mt-1 mt-sm-0"
        >
          {{ showTransactionsTable ? "Ocultar Detalhes" : "Mostrar Detalhes" }}
          <v-icon right>{{
            showTransactionsTable ? "mdi-chevron-up" : "mdi-chevron-down"
          }}</v-icon>
        </v-btn>
      </v-card-title>
      <v-expand-transition>
        <div v-show="showTransactionsTable">
          <v-card-text class="pa-0 pa-sm-4">
            <div class="expense-list-container">
              <ExpenseList :expenses="filteredExpenses" />
            </div>
          </v-card-text>
        </div>
      </v-expand-transition>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useExpensesStore } from "~/stores/useExpensesStore";
import { useCategoriesStore } from "~/stores/useCategoriesStore";
import CategoryPieChart from "~/components/molecules/CategoryPieChart.vue";
import ExpenseLineChart from "~/components/molecules/ExpenseLineChart.vue";
import ExpenseList from "./ExpenseList.vue";
import {
  format,
  subDays,
  startOfMonth,
  subMonths,
  startOfYear,
  subYears,
  getWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";

interface ExpenseWithCategory {
  id: string;
  date: string;
  value: number;
  description?: string;
  paymentMethod?: string;
  card?: string;
  installments?: number;
  categoryId?: string | null;
  category_id?: string | null;
  [key: string]: any;
}

// Stores
const expensesStore = useExpensesStore();
const categoriesStore = useCategoriesStore();

// State
const loading = ref(false);
const showCategoryTable = ref(true);
const showTransactionsTable = ref(true);
const groupBy = ref<"day" | "week" | "month">("day");
const selectedPeriod = ref("30d");
const selectedCategory = ref<string | null>(null);
const startDate = ref("");
const endDate = ref("");
const startMenu = ref(false);
const endMenu = ref(false);

const dateRanges = [
  { text: "Personalizado", value: "custom" },
  { text: "Últimos 7 dias", value: "7d" },
  { text: "Últimos 15 dias", value: "15d" },
  { text: "Últimos 30 dias", value: "30d" },
  { text: "Últimos 3 meses", value: "90d" },
  { text: "Últimos 6 meses", value: "180d" },
  { text: "Últimos 12 meses", value: "365d" },
  { text: "Mês atual", value: "current_month" },
  { text: "Mês anterior", value: "last_month" },
  { text: "Ano atual", value: "current_year" },
  { text: "Ano anterior", value: "last_year" },
];

// Funções para manipulação de datas
const getDatesForPeriod = (period: string) => {
  const today = new Date();
  let newStartDate = new Date(today);
  let newEndDate = new Date(today);

  switch (period) {
    case "7d":
      newStartDate = subDays(today, 7);
      break;
    case "15d":
      newStartDate = subDays(today, 15);
      break;
    case "30d":
      newStartDate = subDays(today, 30);
      break;
    case "90d":
      newStartDate = subMonths(today, 3);
      break;
    case "180d":
      newStartDate = subMonths(today, 6);
      break;
    case "365d":
      newStartDate = subYears(today, 1);
      break;
    case "current_month":
      newStartDate = startOfMonth(today);
      break;
    case "last_month":
      newStartDate = startOfMonth(subMonths(today, 1));
      newEndDate = new Date(today.getFullYear(), today.getMonth(), 0);
      break;
    case "current_year":
      newStartDate = startOfYear(today);
      break;
    case "last_year":
      newStartDate = startOfYear(subYears(today, 1));
      newEndDate = new Date(today.getFullYear() - 1, 11, 31);
      break;
  }
  return {
    start: format(newStartDate, "yyyy-MM-dd"),
    end: format(newEndDate, "yyyy-MM-dd"),
  };
};

// Efeito reativo para mudanças no período
watch(
  selectedPeriod,
  (newPeriod) => {
    if (newPeriod !== "custom") {
      const { start, end } = getDatesForPeriod(newPeriod);
      startDate.value = start;
      endDate.value = end;
    }
  },
  { immediate: true }
);

const formattedStartDate = computed({
  get: () =>
    startDate.value
      ? format(new Date(startDate.value), "dd/MM/yyyy", { locale: ptBR })
      : "",
  set: (val: string) => {
    if (selectedPeriod.value === "custom") {
      startDate.value = val;
    }
  },
});

const formattedEndDate = computed({
  get: () =>
    endDate.value
      ? format(new Date(endDate.value), "dd/MM/yyyy", { locale: ptBR })
      : "",
  set: (val: string) => {
    if (selectedPeriod.value === "custom") {
      endDate.value = val;
    }
  },
});

// Filters and Data
const filteredExpenses = computed(() => {
  if (!expensesStore.expenses || !startDate.value || !endDate.value) {
    return [];
  }

  const start = new Date(startDate.value);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate.value);
  end.setHours(23, 59, 59, 999);

  return (expensesStore.expenses as ExpenseWithCategory[]).filter((expense) => {
    const expenseDate = new Date(expense.date);
    const categoryId = expense.categoryId || expense.category_id;
    const value = parseFloat(String(expense.value));

    const isInDateRange = expenseDate >= start && expenseDate <= end;
    const matchesCategory =
      !selectedCategory.value ||
      categoryId?.toString() === selectedCategory.value;
    const isValidValue = !isNaN(value);

    return isInDateRange && matchesCategory && isValidValue;
  });
});

const pieChartData = computed(() => {
  const categoryTotals = new Map<string, number>();

  categoriesStore.categories.forEach((cat) => {
    categoryTotals.set(cat.name, 0);
  });

  categoryTotals.set("Sem Categoria", 0);

  filteredExpenses.value.forEach((expense) => {
    const category = categoriesStore.categories.find(
      (cat) => cat.id === (expense.categoryId || expense.category_id)
    );
    const categoryName = category ? category.name : "Sem Categoria";
    const amount = parseFloat(String(expense.value)) || 0;

    categoryTotals.set(
      categoryName,
      (categoryTotals.get(categoryName) || 0) + amount
    );
  });

  return Array.from(categoryTotals.entries())
    .map(([category, amount]) => ({
      category,
      amount: parseFloat(amount.toFixed(2)),
    }))
    .sort((a, b) => b.amount - a.amount);
});

const lineChartData = computed(() => {
  if (!filteredExpenses.value.length || !startDate.value || !endDate.value) {
    return [];
  }

  const groupedData = new Map<string, number>();
  const allDateKeys: string[] = [];

  const start = new Date(startDate.value);
  const end = new Date(endDate.value);
  let currentDate = new Date(start);

  while (currentDate <= end) {
    let key: string;
    switch (groupBy.value) {
      case "day":
        key = format(currentDate, "dd/MM/yyyy", { locale: ptBR });
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case "week":
        key = `Semana ${getWeek(currentDate, {
          locale: ptBR,
          weekStartsOn: 1,
        })} ${currentDate.getFullYear()}`;
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case "month":
      default:
        key = `${format(currentDate, "MMMM", {
          locale: ptBR,
        })} ${currentDate.getFullYear()}`;
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
    }
    allDateKeys.push(key);
    groupedData.set(key, 0);
  }

  filteredExpenses.value.forEach((expense) => {
    const date = new Date(expense.date);
    let key: string;
    switch (groupBy.value) {
      case "day":
        key = format(date, "dd/MM/yyyy", { locale: ptBR });
        break;
      case "week":
        key = `Semana ${getWeek(date, {
          locale: ptBR,
          weekStartsOn: 1,
        })} ${date.getFullYear()}`;
        break;
      case "month":
      default:
        key = `${format(date, "MMMM", { locale: ptBR })} ${date.getFullYear()}`;
        break;
    }
    const amount = parseFloat(String(expense.value)) || 0;
    if (!isNaN(amount)) {
      groupedData.set(key, (groupedData.get(key) || 0) + amount);
    }
  });

  return allDateKeys.map((date) => ({
    date,
    amount: parseFloat((groupedData.get(date) || 0).toFixed(2)),
  }));
});

const categoryBreakdown = computed(() => {
  const total = pieChartData.value.reduce((sum, item) => sum + item.amount, 0);

  return pieChartData.value.map((item) => {
    const percentage = total > 0 ? (item.amount / total) * 100 : 0;
    return {
      category: item.category,
      amount: item.amount,
      percentage: parseFloat(percentage.toFixed(2)),
    };
  });
});

const calculatePreviousPeriodData = () => {
  if (!startDate.value || !endDate.value) {
    return {
      previousTotal: 0,
      previousCount: 0,
    };
  }

  const start = new Date(startDate.value).getTime();
  const end = new Date(endDate.value).getTime();
  const periodLength = end - start;

  const prevStart = start - periodLength - 86400000;
  const prevEnd = start - 86400000;

  const previousPeriodExpenses = (
    expensesStore.expenses as ExpenseWithCategory[]
  ).filter((expense) => {
    const expenseDate = new Date(expense.date).getTime();
    return expenseDate >= prevStart && expenseDate <= prevEnd;
  });

  const previousTotal = previousPeriodExpenses.reduce(
    (sum, exp) => sum + (parseFloat(String(exp.value)) || 0),
    0
  );
  const previousCount = previousPeriodExpenses.length;

  return {
    previousTotal,
    previousCount,
  };
};

const summaryStats = computed(() => {
  const currentPeriodExpenses = filteredExpenses.value;
  const currentTotal = currentPeriodExpenses.reduce(
    (sum, exp) => sum + (parseFloat(String(exp.value)) || 0),
    0
  );
  const currentCount = currentPeriodExpenses.length;

  const { previousTotal, previousCount } = calculatePreviousPeriodData();

  const totalChange =
    previousTotal > 0
      ? ((currentTotal - previousTotal) / previousTotal) * 100
      : 0;
  const countChange =
    previousCount > 0
      ? ((currentCount - previousCount) / previousCount) * 100
      : 0;
  const avgPerDay =
    currentCount > 0
      ? currentTotal /
        ((new Date(endDate.value).getTime() -
          new Date(startDate.value).getTime()) /
          (1000 * 60 * 60 * 24) +
          1)
      : 0;

  return [
    {
      title: "Total Gasto",
      value: currentTotal,
      change: parseFloat(totalChange.toFixed(1)),
      icon: "mdi-cash-multiple",
      iconColor: "white",
      color: "primary",
    },
    {
      title: "Média por Dia",
      value: avgPerDay,
      change: 0,
      icon: "mdi-chart-line",
      iconColor: "white",
      color: "success",
    },
    {
      title: "Total de Despesas",
      value: currentCount,
      valueFormatter: (val: number) => val.toString(),
      change: parseFloat(countChange.toFixed(1)),
      changeLabel: "em relação ao período anterior",
      icon: "mdi-receipt",
      iconColor: "white",
      color: "info",
    },
    {
      title: "Categorias Únicas",
      value: new Set(
        currentPeriodExpenses
          .map((e) => e.categoryId || e.category_id)
          .filter(Boolean)
      ).size,
      valueFormatter: (val: number) => val.toString(),
      change: 0,
      icon: "mdi-shape",
      iconColor: "white",
      color: "orange-darken-2",
    },
  ];
});

// Métodos
const refreshData = async () => {
  loading.value = true;
  try {
    await Promise.all([
      expensesStore.fetchExpenses(),
      categoriesStore.fetchAllCategories(),
    ]);
  } catch (error) {
    console.error("Error refreshing data:", error);
  } finally {
    loading.value = false;
  }
};

const toggleCategoryTable = () => {
  showCategoryTable.value = !showCategoryTable.value;
};

const toggleTransactionsTable = () => {
  showTransactionsTable.value = !showTransactionsTable.value;
};

const formatCurrency = (value: number) => {
  if (isNaN(value)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const getCategoryColor = (categoryName: string) => {
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    "primary",
    "secondary",
    "success",
    "error",
    "warning",
    "info",
    "pink",
    "purple",
    "indigo",
    "blue",
    "cyan",
    "teal",
    "green",
    "lime",
    "yellow",
    "amber",
    "orange",
    "brown",
    "grey",
    "deep-purple",
  ];
  return colors[Math.abs(hash) % colors.length];
};

const categoryHeaders = [
  {
    title: "Categoria",
    key: "category",
    sortable: true,
    align: "start" as const,
  },
  {
    title: "Valor",
    key: "amount",
    sortable: true,
    align: "end" as const,
  },
  {
    title: "Porcentagem",
    key: "percentage",
    sortable: false,
    align: "start" as const,
    width: "50%",
  },
];

// Lifecycle Hooks
onMounted(async () => {
  await refreshData();
});
</script>

<style scoped>
.analytics-dashboard {
  max-width: 1440px;
  margin: 0 auto;
  padding: 16px;
}

.expense-list-container {
  max-height: 500px;
  overflow-y: auto;
  scrollbar-width: thin;
}

/* Custom scrollbar for webkit browsers */
.expense-list-container::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.expense-list-container::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.expense-list-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

/* Responsive table styles */
@media (max-width: 600px) {
  .expense-list-container {
    margin: 0 -16px;
    max-width: 100vw;
  }
}

.v-card {
  margin-bottom: 24px;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.v-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1) !important;
}

.v-card-title {
  padding: 16px 24px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.v-card-subtitle {
  padding: 0 24px 16px;
  opacity: 0.8;
}

.v-card-text {
  padding: 20px 24px;
}

.summary-card {
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1) !important;
}

.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}

@media (max-width: 960px) {
  .v-card-title {
    padding: 12px 16px;
  }

  .v-card-subtitle {
    padding: 0 16px 12px;
  }

  .v-card-text {
    padding: 16px;
  }
}

:deep(.v-theme--dark) .v-card-title {
  background-color: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.v-theme--dark) .v-card-subtitle {
  opacity: 0.7;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Dark theme scrollbar */
:deep(.v-theme--dark) ::-webkit-scrollbar-track {
  background: #2c2c2c;
}

:deep(.v-theme--dark) ::-webkit-scrollbar-thumb {
  background: #555;
}

:deep(.v-theme--dark) ::-webkit-scrollbar-thumb:hover {
  background: #777;
}
</style>
```
