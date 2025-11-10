<template>
  <v-container fluid>
    <v-expansion-panels v-model="filterPanel" multiple class="mb-6">
      <v-expansion-panel elevation="2">
        <v-expansion-panel-title>
          <div class="d-flex align-center justify-space-between w-100">
            <span class="text-subtitle-1 font-weight-medium"
              >Filtros e Período</span
            >
            <v-chip
              v-if="!filterPanel.includes(0)"
              color="primary"
              variant="flat"
              size="small"
              class="mr-4"
            >
              {{ selectedPeriodText }}
            </v-chip>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-row class="mt-2">
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
                    hide-details
                    @click:clear="startDate = ''"
                  />
                </template>
                <v-date-picker
                  v-model="startDate"
                  :max="endDate || today"
                  @update:model-value="startMenu = false"
                  color="primary"
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
                    hide-details
                    @click:clear="endDate = ''"
                  />
                </template>
                <v-date-picker
                  v-model="endDate"
                  :min="startDate"
                  :max="today"
                  @update:model-value="endMenu = false"
                  color="primary"
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
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="text" color="grey-darken-1" @click="resetFilters">
              Limpar Filtros
            </v-btn>
            <v-btn variant="text" color="primary" @click="filterPanel = []">
              Aplicar
            </v-btn>
          </v-card-actions>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <v-skeleton-loader
      :loading="loading"
      type="article, article, article"
      class="mb-6"
    >
      <v-row dense>
        <v-col
          v-for="(stat, index) in summaryStats"
          :key="index"
          cols="12"
          sm="6"
          md="6"
        >
          <!-- 3. KPIs Tonais: Muito mais suave e moderno que cores sólidas -->
          <v-card :color="stat.color" variant="tonal" class="h-100">
            <v-card-text class="d-flex justify-space-between align-center">
              <div>
                <div class="text-subtitle-1 mb-1">{{ stat.title }}</div>
                <div class="text-h4 font-weight-bold">
                  {{
                    stat.valueFormatter
                      ? stat.valueFormatter(stat.value)
                      : formatCurrency(stat.value)
                  }}
                </div>
                <div
                  v-if="stat.change !== null"
                  class="text-caption d-flex align-center mt-1"
                >
                  <!-- Conteúdo de variação foi removido da computed, então isso não será renderizado -->
                </div>
              </div>
              <v-avatar :color="stat.color" size="48" variant="flat">
                <v-icon color="white">{{ stat.icon }}</v-icon>
              </v-avatar>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-skeleton-loader>

    <v-row class="mb-6" dense>
      <v-col cols="12" lg="12">
        <v-card class="d-flex flex-column h-100" elevation="2">
          <v-card-title class="d-flex align-center">
            <span class="text-h6">Distribuição por Categoria</span>
            <v-spacer></v-spacer>
            <v-tooltip text="Editar regras de distribuição" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-if="isRulesEnabled"
                  v-bind="props"
                  icon="mdi-pencil-outline"
                  variant="text"
                  size="small"
                  @click="openRuleDialog"
                ></v-btn>
              </template>
            </v-tooltip>
            <v-tooltip
              :text="isRulesEnabled ? 'Desativar regras' : 'Ativar regras'"
              location="top"
            >
              <template v-slot:activator="{ props }">
                <v-switch
                  v-bind="props"
                  v-model="isRulesEnabled"
                  color="primary"
                  density="compact"
                  hide-details
                  class="ml-2"
                ></v-switch>
              </template>
            </v-tooltip>
          </v-card-title>
          <v-divider class="mt-2"></v-divider>
          <v-card-text class="flex-grow-1 pa-0">
            <v-fade-transition>
              <v-overlay
                v-if="loading || barChartData.length === 0"
                absolute
                scrim="rgba(255, 255, 255, 0.7)"
                class="d-flex align-center justify-center"
              >
                <v-progress-circular
                  v-if="loading"
                  indeterminate
                  color="primary"
                  size="64"
                ></v-progress-circular>
                <div v-else class="text-center text-grey-darken-1">
                  <v-icon size="64">mdi-chart-bar-off</v-icon>
                  <div class="text-h6">Sem dados de categoria</div>
                </div>
              </v-overlay>
            </v-fade-transition>

            <CategoryBarChart
              :data="barChartData"
              class="pa-2"
              :height="400"
              :salary="salaryForPeriod"
              :ideal-distribution="
                isRulesEnabled ? idealDistribution : undefined
              "
            />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="12">
        <v-card class="d-flex flex-column h-100" elevation="2">
          <v-card-title class="text-h6">
            Despesas ao Longo do Tempo
          </v-card-title>
          <v-card-subtitle> Agrupado por {{ groupByText }} </v-card-subtitle>
          <v-divider class="mt-2"></v-divider>
          <v-card-text class="flex-grow-1 pa-0">
            <v-fade-transition>
              <v-overlay
                v-if="loading || lineChartData.length === 0"
                absolute
                scrim="rgba(255, 255, 255, 0.7)"
                class="d-flex align-center justify-center"
              >
                <v-progress-circular
                  v-if="loading"
                  indeterminate
                  color="primary"
                  size="64"
                ></v-progress-circular>
                <div v-else class="text-center text-grey-darken-1">
                  <v-icon size="64">mdi-chart-line-variant</v-icon>
                  <div class="text-h6">Sem dados de despesas</div>
                </div>
              </v-overlay>
            </v-fade-transition>

            <ExpenseLineChart
              :data="lineChartData"
              :group-by="groupBy"
              :height="400"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <v-dialog v-model="isRuleDialogOpen" max-width="600" persistent>
    <v-card>
      <v-card-title
        class="text-h6 d-flex align-center justify-space-between bg-primary-gradient"
      >
        <div class="d-flex align-center">
          <v-icon class="me-3" size="28">mdi-plus-circle-outline</v-icon>
          Editar Regras de Distribuição
        </div>
        <v-btn
          icon
          variant="text"
          size="small"
          aria-label="Fechar"
          @click="closeCard"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider />
      <v-card-text>
        <v-alert v-if="dialogError" type="error" variant="tonal" class="mb-4">
          {{ dialogError }}
        </v-alert>

        <p class="text-body-2 mb-4">
          Defina a porcentagem ideal do seu salário para cada categoria.
        </p>
        <v-form>
          <v-text-field
            v-for="(percent, name) in tempDistribution"
            :key="name"
            :label="name"
            v-model.number="tempDistribution[name]"
            type="number"
            suffix="%"
            variant="outlined"
            density="compact"
            class="mb-2"
            :rules="[rules.required, rules.number]"
            min="0"
            max="100"
          />

          <div class="mt-4">
            <div class="d-flex justify-space-between text-body-2 mb-1">
              <span>Total</span>
              <span
                :class="{
                  'text-error': distributionTotal !== 100,
                  'text-success': distributionTotal === 100,
                }"
              >
                {{ distributionTotal }}% / 100%
              </span>
            </div>
            <v-progress-linear
              v-model="distributionTotal"
              :color="distributionTotal === 100 ? 'success' : 'error'"
              height="8"
              rounded
            ></v-progress-linear>
            <v-alert
              v-if="distributionTotal !== 100"
              type="error"
              density="compact"
              variant="tonal"
              class="mt-3"
            >
              A soma deve ser exatamente 100%.
            </v-alert>
          </div>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="isRuleDialogOpen = false">Cancelar</v-btn>
        <v-btn
          color="primary"
          @click="saveRules"
          :disabled="distributionTotal !== 100"
          >Salvar</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, reactive } from "vue";
import {
  format,
  subDays,
  subMonths,
  subYears,
  startOfMonth,
  startOfYear,
  getWeek,
  differenceInDays,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { storeToRefs } from "pinia";
import { useExpensesStore } from "~/stores/useExpensesStore";
import { useCategoriesStore } from "~/stores/useCategoriesStore";
import ExpenseLineChart from "~/components/modules/expenses/ExpenseLineChart.vue";
import CategoryBarChart from "~/components/modules/categories/CategoryBarChart.vue";

const expensesStore = useExpensesStore();
const categoriesStore = useCategoriesStore();

const loading = computed(
  () => expensesStore.loading || categoriesStore.loading
);

const filterPanel = ref([0]);
const groupBy = ref<"day" | "week" | "month">("day");
const selectedPeriod = ref("30d");
const startDate = ref("");
const endDate = ref("");
const startMenu = ref(false);
const endMenu = ref(false);
const today = format(new Date(), "yyyy-MM-dd");
const isRulesEnabled = ref(false);
const RULES_ENABLED_KEY = "financialRulesEnabled";
const isRuleDialogOpen = ref(false);
const dialogError = ref<string | null>(null);
const { salaries: allSalaries } = storeToRefs(expensesStore);
const { distributionRules: idealDistribution } = storeToRefs(categoriesStore);
const tempDistribution = ref<Record<string, number>>({});

const rules = reactive({
  required: (v: any) => !!v || v === 0 || "Obrigatório",
  number: (v: any) => !isNaN(parseFloat(v)) || "Inválido",
});

const salaryForPeriod = computed(() => {
  if (!allSalaries.value || allSalaries.value.length === 0) {
    return 0;
  }
  if (!endDate.value) {
    return 0;
  }

  const periodEnd = new Date(endDate.value);
  periodEnd.setHours(23, 59, 59, 999);

  const applicableSalaries = allSalaries.value.filter((s) => {
    const salaryDate = new Date(s.date);
    return salaryDate <= periodEnd;
  });

  if (applicableSalaries.length === 0) {
    return 0;
  }

  applicableSalaries.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return applicableSalaries[0].value;
});

const distributionTotal = computed(() => {
  return Object.values(tempDistribution.value).reduce(
    (sum, val) => sum + (Number(val) || 0),
    0
  );
});

function openRuleDialog() {
  dialogError.value = null;
  tempDistribution.value = JSON.parse(JSON.stringify(idealDistribution.value));
  isRuleDialogOpen.value = true;
}

async function saveRules() {
  dialogError.value = null;

  if (distributionTotal.value !== 100) {
    dialogError.value = "A soma das porcentagens deve ser exatamente 100%.";
    return;
  }

  try {
    await categoriesStore.saveDistributionRules(tempDistribution.value);
    isRuleDialogOpen.value = false;
  } catch (error: any) {
    dialogError.value = error.message;
    console.error("Falha ao salvar regras:", error.message);
  }
}

watch(isRulesEnabled, (newValue) => {
  localStorage.setItem(RULES_ENABLED_KEY, String(newValue));
});

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
  { text: "Próximo mês", value: "next_month" },
  { text: "Ano atual", value: "current_year" },
  { text: "Ano anterior", value: "last_year" },
];

const formatCurrency = (value: number) =>
  value?.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }) ?? "R$ 0,00";
const formatNumber = (value: number) => value?.toLocaleString("pt-BR") ?? "0";
const formatDate = (date: string | Date, fmt = "dd/MM/yyyy") =>
  date ? format(new Date(date), fmt, { locale: ptBR }) : "";

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
  next_month: () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const lastDay = new Date(
      nextMonth.getFullYear(),
      nextMonth.getMonth() + 1,
      0
    );
    return { start: nextMonth, end: lastDay };
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

function getExpensesForPeriod(start: Date, end: Date) {
  end.setHours(23, 59, 59, 999);
  return expensesStore.expenses.filter((exp) => {
    const date = new Date(exp.date);
    return date >= start && date <= end && !isNaN(Number(exp.value));
  });
}

const filteredExpenses = computed(() => {
  if (!startDate.value || !endDate.value) return [];
  const start = new Date(startDate.value);
  const end = new Date(endDate.value);
  return getExpensesForPeriod(start, end);
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
const barChartData = computed(() => {
  const totals: Record<string, number> = {};
  categoriesStore.categories.forEach((c) => (totals[c.name] = 0));
  totals["SEM CATEGORIA"] = 0;
  filteredExpenses.value.forEach((exp) => {
    const category = categoriesStore.categories.find(
      (c) => c.id == (exp.categoryId || exp.category_id)
    );
    const name = category ? category.name : "SEM CATEGORIA";
    totals[name] = (totals[name] || 0) + Number(exp.value);
  });
  return Object.entries(totals)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
});

const summaryStats = computed(() => {
  const current = filteredExpenses.value;
  const currentTotal = current.reduce((sum, e) => sum + Number(e.value), 0);
  const currentCount = current.length;

  return [
    {
      title: "Total Gasto",
      value: currentTotal,
      change: null,
      changeLabel: "vs período anterior",
      icon: "mdi-cash-remove",
      color: "red-darken-1",
    },
    {
      title: "Média por Transação",
      value: currentCount > 0 ? currentTotal / currentCount : 0,
      change: null,
      icon: "mdi-chart-line",
      color: "primary",
    },
  ];
});

const groupByText = computed(() => {
  return (
    groupByOptions.find((opt) => opt.value === groupBy.value)?.text || "Dia"
  );
});

const selectedPeriodText = computed(() => {
  return (
    dateRanges.find((opt) => opt.value === selectedPeriod.value)?.text ||
    "Personalizado"
  );
});

function resetFilters() {
  selectedPeriod.value = "30d";
  groupBy.value = "day";
}

const refreshData = async () => {
  try {
    await Promise.all([
      expensesStore.fetchExpenses(),
      categoriesStore.fetchAllCategories(),
      expensesStore.fetchSalary(),
    ]);
  } catch (error) {
    console.error("Falha ao carregar dados do dashboard:", error);
  }
};

onMounted(() => {
  const savedRulePref = localStorage.getItem(RULES_ENABLED_KEY);
  isRulesEnabled.value = savedRulePref === "true";

  refreshData();
});
</script>
