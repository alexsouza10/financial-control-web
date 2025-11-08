<template>
  <v-container fluid>
    <v-card elevation="2" class="mb-4">
      <v-card-title class="text-h8 text-center"
        >Filtros por Período</v-card-title
      >
      <v-divider></v-divider>
      <v-card-text>
        <v-row>
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
                :max="selectedPeriod !== 'custom' ? today : undefined"
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
                :max="selectedPeriod !== 'custom' ? today : undefined"
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

    <v-row class="mb-6" dense>
      <v-col cols="12">
        <v-card class="d-flex flex-column">
          <v-card-title class="d-flex align-center justify-space-between">
            
            <div style="width: 48px;"></div> <div class="d-flex align-center">
              <span class="text-h6">Distribuição por Categoria</span>
              
              <div class="d-flex align-center ml-2">
                <v-tooltip
                  :text="
                    isRulesEnabled
                      ? 'Desativar regras de gastos'
                      : 'Ativar regras de gastos'
                  "
                >
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      :icon="
                        isRulesEnabled
                          ? 'mdi-toggle-switch'
                          : 'mdi-toggle-switch-off-outline'
                      "
                      :color="isRulesEnabled ? 'primary' : 'grey-darken-1'"
                      variant="text"
                      size="small"
                      @click="isRulesEnabled = !isRulesEnabled"
                    ></v-btn>
                  </template>
                </v-tooltip>
                <span
                  class="ml-1 text-body-2"
                  @click="isRulesEnabled = !isRulesEnabled"
                  style="cursor: pointer"
                  :class="isRulesEnabled ? 'text-primary' : 'text-grey-darken-1'"
                >
                  Regras
                </span>
              </div>
            </div>

            <div style="width: 48px; text-align: right;">
              <v-btn
                v-if="isRulesEnabled"
                icon="mdi-pencil"
                variant="text"
                size="small"
                @click="openRuleDialog"
                title="Editar regras de distribuição"
              ></v-btn>
            </div>
          </v-card-title>
          
          <v-divider></v-divider>
          
          <v-card-text class="flex-grow-1 pt-4">
            <CategoryBarChart
              :data="barChartData"
              :height="400"
              class="w-100 h-100"
              :salary="salary"
              :ideal-distribution="isRulesEnabled ? idealDistribution : undefined"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card class="d-flex flex-column">
          <v-card-title class="text-h6 text-center">
            Despesas ao Longo do Tempo
          </v-card-title>
          <v-divider class="my-1"></v-divider>
          <v-card-text class="flex-grow-1">
            <ExpenseLineChart
              :data="lineChartData"
              :group-by="groupBy"
              :height="400"
              class="w-100 h-100"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <v-dialog
    v-if="isRulesEnabled"
    v-model="isRuleDialogOpen"
    max-width="600"
    persistent
  >
    <v-card>
      <v-card-title class="text-h5">
        Editar Regras de Distribuição
      </v-card-title>
      <v-card-text>
        <v-alert
          v-if="dialogError"
          type="error"
          variant="tonal"
          density="compact"
          class="mb-4"
        >
          {{ dialogError }}
        </v-alert>

        <p class="text-body-2 mb-4">
          Defina a porcentagem ideal do seu salário para cada categoria. A soma
          deve ser 100%.
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
          />
          <v-alert
            v-if="distributionTotal !== 100"
            type="warning"
            density="compact"
            variant="tonal"
            class="mt-2"
          >
            Total: {{ distributionTotal }}%. O ideal é 100%.
          </v-alert>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="isRuleDialogOpen = false">Cancelar</v-btn>
        <v-btn color="primary" @click="saveRules">Salvar</v-btn>
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
const { salary } = storeToRefs(expensesStore);
const { distributionRules: idealDistribution } = storeToRefs(categoriesStore);
const tempDistribution = ref<Record<string, number>>({});

const rules = reactive({
  required: (v: any) => !!v || "Obrigatório",
  number: (v: any) => !isNaN(parseFloat(v)) || "Inválido",
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

  if (distributionTotal.value > 100) {
    dialogError.value = "A soma das porcentagens não pode passar de 100%.";
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
