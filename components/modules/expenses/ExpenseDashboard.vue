<template>
  <v-container fluid>
    <!-- Filtros de período e agrupamento -->
    <v-card elevation="2" class="mb-6">
      <v-card-title class="text-h6 text-center"
        >Filtros por Período</v-card-title
      >
      <v-divider class="my-2"></v-divider>
      <v-card-text>
        <v-row>
          <!-- Período -->
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedPeriod"
              :items="dateRanges"
              label="Período"
              variant="outlined"
              density="comfortable"
              item-title="text"
              item-value="value"
              hide-details
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-menu
              v-model="startMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
            >
              <template #activator="{ props }">
                <v-text-field
                  v-model="formattedStartDate"
                  label="Data Inicial"
                  prepend-inner-icon="mdi-calendar"
                  readonly
                  clearable
                  :disabled="selectedPeriod !== 'custom'"
                  v-bind="props"
                  variant="outlined"
                  density="comfortable"
                  @click:clear="startDate = ''"
                />
              </template>
              <v-date-picker
                v-model="startDate"
                :max="endDate || today"
                @update:model-value="startMenu = false"
              />
            </v-menu>
          </v-col>

          <v-col cols="12" md="3">
            <v-menu
              v-model="endMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
            >
              <template #activator="{ props }">
                <v-text-field
                  v-model="formattedEndDate"
                  label="Data Final"
                  prepend-inner-icon="mdi-calendar"
                  readonly
                  clearable
                  :disabled="selectedPeriod !== 'custom'"
                  v-bind="props"
                  variant="outlined"
                  density="comfortable"
                  @click:clear="endDate = ''"
                />
              </template>
              <v-date-picker
                v-model="endDate"
                :min="startDate"
                :max="today"
                @update:model-value="endMenu = false"
              />
            </v-menu>
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="groupBy"
              :items="groupByOptions"
              label="Agrupar por"
              variant="outlined"
              density="comfortable"
              hide-details
              item-title="text"
              item-value="value"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-row class="mb-6" dense>
      <v-col
        v-for="(stat, index) in summaryStats"
        :key="index"
        cols="12"
        sm="6"
        md="6"
      >
        <v-card :color="stat.color" dark class="h-100">
          <v-card-text class="d-flex justify-space-between align-center">
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
            <v-avatar :color="stat.iconColor" size="48">
              <v-icon>{{ stat.icon }}</v-icon>
            </v-avatar>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mb-6">
      <v-col cols="12" md="6">
        <v-card class="pa-4" outlined>
          <v-card-title class="text-h6 text-center"
            >Despesas ao Longo do Tempo</v-card-title
          >
          <v-divider class="my-2"></v-divider>
          <ExpenseLineChart
            :data="lineChartData"
            :group-by="groupBy"
            :height="400"
            class="w-100"
          />
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="pa-4" outlined>
          <v-card-title class="text-h6 text-center"
            >Distribuição por Categoria</v-card-title
          >
          <v-divider class="my-2"></v-divider>
          <CategoryPieChart :data="pieChartData" :height="400" class="w-100" />
        </v-card>
      </v-col>
    </v-row>

<v-card variant="outlined" class="position-relative">
  <v-overlay v-model="loading" contained class="align-center justify-center" :persistent="true">
    <v-progress-circular color="primary" indeterminate size="64" />
  </v-overlay>

  <v-card-title class="d-flex align-center justify-space-between flex-wrap">
    <div>
      <v-icon start>mdi-tag-multiple-outline</v-icon>
      <span class="font-weight-medium">Despesas por Categoria</span>
    </div>
    <v-btn variant="text" color="primary" @click="showCategoryTable = !showCategoryTable">
      {{ showCategoryTable ? 'Ocultar' : 'Detalhar' }}
      <v-icon end>{{ showCategoryTable ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
    </v-btn>
  </v-card-title>
  
  <v-divider />

  <v-expand-transition>
    <div v-show="showCategoryTable">
       <v-empty-state
        v-if="!loading && !categoryBreakdown.length"
        icon="mdi-database-off-outline"
        title="Nenhuma categoria com gastos"
        text="Não há despesas para exibir no período selecionado."
        class="py-8"
      />
      <v-data-table
        v-else
        :headers="categoryHeaders"
        :items="categoryBreakdown.filter(item => item.amount > 0)"
        :items-per-page="5"
        density="compact"
        :hide-default-footer="categoryBreakdown.length <= 5"
        class="pa-2"
      >
        <template #[`item.category`]="{ item }">
          <v-chip :color="getCategoryColor(item.category)" size="small" label variant="flat">
            {{ item.category }}
          </v-chip>
        </template>
        <template #[`item.amount`]="{ item }">
          <span class="font-weight-medium">{{ formatCurrency(item.amount) }}</span>
        </template>
        <template #[`item.percentage`]="{ item }">
          <v-progress-linear
            :model-value="item.percentage"
            :color="getCategoryColor(item.category)"
            height="20"
            rounded
            stream
          >
            <strong class="text-white text-caption">{{ Math.round(item.percentage) }}%</strong>
          </v-progress-linear>
        </template>
      </v-data-table>
    </div>
  </v-expand-transition>
</v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import {
  format,
  subDays,
  subMonths,
  subYears,
  startOfMonth,
  startOfYear,
  getWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { useExpensesStore } from "~/stores/useExpensesStore";
import { useCategoriesStore } from "~/stores/useCategoriesStore";
import ExpenseLineChart from "~/components/modules/expenses/ExpenseLineChart.vue";
import CategoryPieChart from "~/components/modules/categories/CategoryPieChart.vue";
import { Title } from "chart.js";

const expensesStore = useExpensesStore();
const categoriesStore = useCategoriesStore();
const loading = ref(false);
const showCategoryTable = ref(false);
const groupBy = ref<"day" | "week" | "month">("day");
const selectedPeriod = ref("30d");
const startDate = ref("");
const endDate = ref("");
const startMenu = ref(false);
const endMenu = ref(false);
const today = format(new Date(), "yyyy-MM-dd");

const groupByOptions = [
  { text: "Dia", value: "day" },
  { text: "Semana", value: "week" },
  { text: "Mês", value: "month" },
];

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

const formatCurrency = (value: number) =>
  value?.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }) ?? "R$ 0,00";
const formatDate = (date: string | Date, fmt = "dd/MM/yyyy") =>
  date ? format(new Date(date), fmt, { locale: ptBR }) : "";

const getCategoryColor = (categoryName: string) => {
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
  return colors[
    Math.abs(
      [...categoryName].reduce(
        (hash, char) => char.charCodeAt(0) + ((hash << 5) - hash),
        0
      )
    ) % colors.length
  ];
};

const periodFunctions: Record<string, () => { start: Date; end: Date }> = {
  "7d": () => ({ start: subDays(new Date(), 7), end: new Date() }),
  "15d": () => ({ start: subDays(new Date(), 15), end: new Date() }),
  "30d": () => ({ start: subDays(new Date(), 30), end: new Date() }),
  "90d": () => ({ start: subMonths(new Date(), 3), end: new Date() }),
  "180d": () => ({ start: subMonths(new Date(), 6), end: new Date() }),
  "365d": () => ({ start: subYears(new Date(), 1), end: new Date() }),
  current_month: () => ({ start: startOfMonth(new Date()), end: new Date() }),
  last_month: () => {
    const prev = subMonths(new Date(), 1);
    return {
      start: startOfMonth(prev),
      end: new Date(prev.getFullYear(), prev.getMonth() + 1, 0),
    };
  },
  current_year: () => ({ start: startOfYear(new Date()), end: new Date() }),
  last_year: () => {
    const prev = subYears(new Date(), 1);
    return {
      start: startOfYear(prev),
      end: new Date(prev.getFullYear(), 11, 31),
    };
  },
};

const formattedStartDate = computed({
  get: () => formatDate(startDate.value),
  set: (val) => {
    if (selectedPeriod.value === "custom") startDate.value = val;
  },
});
const formattedEndDate = computed({
  get: () => formatDate(endDate.value),
  set: (val) => {
    if (selectedPeriod.value === "custom") endDate.value = val;
  },
});

watch(
  selectedPeriod,
  (newPeriod) => {
    if (newPeriod !== "custom") {
      const { start, end } = periodFunctions[newPeriod]?.() || {
        start: new Date(),
        end: new Date(),
      };
      startDate.value = format(start, "yyyy-MM-dd");
      endDate.value = format(end, "yyyy-MM-dd");
    }
  },
  { immediate: true }
);

const filteredExpenses = computed(() => {
  if (!startDate.value || !endDate.value) return [];
  const start = new Date(startDate.value);
  const end = new Date(endDate.value);
  end.setHours(23, 59, 59, 999);
  return expensesStore.expenses.filter((exp) => {
    const date = new Date(exp.date);
    return date >= start && date <= end && !isNaN(Number(exp.value));
  });
});

function groupExpensesBy(expenses: any[], group: "day" | "week" | "month") {
  const map = new Map<string, number>();
  expenses.forEach((exp) => {
    const date = new Date(exp.date);
    let key =
      group === "day"
        ? format(date, "dd/MM/yyyy", { locale: ptBR })
        : group === "week"
        ? `Semana ${getWeek(date, { weekStartsOn: 1 })} ${date.getFullYear()}`
        : format(date, "MMMM yyyy", { locale: ptBR });
    map.set(key, (map.get(key) || 0) + Number(exp.value));
  });
  return Array.from(map.entries()).map(([date, amount]) => ({ date, amount }));
}

const lineChartData = computed(() =>
  groupExpensesBy(filteredExpenses.value, groupBy.value)
);
const pieChartData = computed(() => {
  const totals: Record<string, number> = {};
  categoriesStore.categories.forEach((c) => (totals[c.name] = 0));
  totals["Sem Categoria"] = 0;
  filteredExpenses.value.forEach((exp) => {
    const category = categoriesStore.categories.find(
      (c) => c.id == (exp.categoryId || exp.category_id)
    );
    const name = category ? category.name : "Sem Categoria";
    totals[name] = (totals[name] || 0) + Number(exp.value);
  });
  return Object.entries(totals)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
});
const categoryBreakdown = computed(() => {
  const total = pieChartData.value.reduce((sum, i) => sum + i.amount, 0);
  return pieChartData.value.map((i) => ({
    ...i,
    percentage: total ? (i.amount / total) * 100 : 0,
  }));
});

const summaryStats = computed(() => {
  const current = filteredExpenses.value;
  const currentTotal = current.reduce((sum, e) => sum + Number(e.value), 0);
  const currentCount = current.length;
  const dayCount =
    (new Date(endDate.value).getTime() - new Date(startDate.value).getTime()) /
      (1000 * 60 * 60 * 24) +
    1;
  const avgPerDay = currentCount ? currentTotal / dayCount : 0;

  return [
    {
      title: "Total Gasto",
      value: currentTotal,
      icon: "mdi-cash-multiple",
      iconColor: "white",
      color: "secundary",
    },
    {
      title: "Média por Dia",
      value: avgPerDay,
      icon: "mdi-chart-line",
      iconColor: "white",
      color: "secundary",
    },
  ];
});

const categoryHeaders = [
  { title: 'Categoria', key: 'category', sortable: true, align: 'start' },
  { title: 'Valor Total', key: 'amount', align: 'start' },
  { title: 'Percentual', key: 'percentage', sortable: false, align: 'start' },
];



const refreshData = async () => {
  loading.value = true;
  try {
    await Promise.all([
      expensesStore.fetchExpenses(),
      categoriesStore.fetchAllCategories(),
    ]);
  } finally {
    loading.value = false;
  }
};
const toggleCategoryTable = () =>
  (showCategoryTable.value = !showCategoryTable.value);

onMounted(refreshData);
</script>
