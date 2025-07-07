<template>
  <v-container fluid class="analytics-dashboard">
    <v-card class="pa-4 mb-6" elevation="2">
      <v-card-title class="text-h5 mb-2"
        >Financial Analytics Dashboard</v-card-title
      >
      <v-card-subtitle>Visualize e gerencie suas despesas</v-card-subtitle>

      <v-card-text>
        <v-row class="mb-6">
          <v-col cols="12" md="4">
            <DatePickerField v-model="startDateLocal" label="Data Início" />
          </v-col>

          <v-col cols="12" md="4">
            <DatePickerField v-model="endDateLocal" label="Data Fim" />
          </v-col>

          <v-col cols="12" md="4">
            <v-select
              :model-value="selectedCategoryLocal"
              @update:model-value="onCategoryChange"
              :items="['All', ...uniqueCategories]"
              label="Categoria"
              outlined
              dense
              clearable
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="6">
            <CategoryPieChart
              :data="pieChartData"
              title="Total Expenses by Category"
            />
          </v-col>
          <v-col cols="12" md="6">
            <ExpenseLineChart
              :data="lineChartData"
              title="Daily Expenses Trend"
            />
          </v-col>
        </v-row>

        <v-divider class="my-6" />

        <v-row>
          <v-col cols="12" md="12">
            <h3 class="text-h6 mb-3 text-center">Recent Expenses (Filtered)</h3>
            <ExpenseList :expenses="filteredExpenses" />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import DatePickerField from "~/components/atoms/DatePickerField.vue";
import CategoryPieChart from "~/components/molecules/CategoryPieChart.vue";
import ExpenseLineChart from "~/components/molecules/ExpenseLineChart.vue";
import ExpenseList from "./ExpenseList.vue";
import {
  filterExpensesByDateAndCategory,
  groupByCategory,
  groupExpensesByDate,
  getUniqueCategories,
  formatDate,
  type Expense,
} from "~/utils/expenseUtils";

// Dados iniciais
const expenses = ref<Expense[]>([
  { category: "Food", amount: 200, date: "2025-06-01" },
  { category: "Transport", amount: 100, date: "2025-06-02" },
  { category: "Education", amount: 300, date: "2025-06-03" },
  { category: "Food", amount: 150, date: "2025-06-04" },
  { category: "Shopping", amount: 250, date: "2025-06-05" },
  { category: "Utilities", amount: 120, date: "2025-06-06" },
  { category: "Entertainment", amount: 80, date: "2025-06-07" },
  { category: "Food", amount: 100, date: "2025-06-08" },
  { category: "Transport", amount: 50, date: "2025-06-09" },
  { category: "Shopping", amount: 180, date: "2025-06-10" },
  { category: "Utilities", amount: 90, date: "2025-06-11" },
  { category: "Education", amount: 200, date: "2025-06-12" },
  { category: "Entertainment", amount: 120, date: "2025-06-13" },
  { category: "Food", amount: 70, date: "2025-06-14" },
  { category: "Transport", amount: 30, date: "2025-06-15" },
]);

const startDate = ref<string | null>(null);
const endDate = ref<string | null>(null);
const selectedCategory = ref<string | null>(null);
const startDateLocal = ref(startDate.value);
const endDateLocal = ref(endDate.value);
const selectedCategoryLocal = ref(selectedCategory.value ?? "All");

watch(startDateLocal, (val) => {
  startDate.value = val;
});
watch(endDateLocal, (val) => {
  endDate.value = val;
});
watch(
  () => selectedCategoryLocal.value,
  (val) => {
    selectedCategory.value = val === "All" ? null : val;
  }
);

watch(startDate, (val) => {
  startDateLocal.value = val;
});
watch(endDate, (val) => {
  endDateLocal.value = val;
});
watch(selectedCategory, (val) => {
  selectedCategoryLocal.value = val ?? "All";
});

const uniqueCategories = computed(() => getUniqueCategories(expenses.value));
const filteredExpenses = computed(() =>
  filterExpensesByDateAndCategory(
    expenses.value,
    startDate.value,
    endDate.value,
    selectedCategory.value
  )
);

const pieChartData = computed(() => groupByCategory(filteredExpenses.value));
const lineChartData = computed(() =>
  groupExpensesByDate(filteredExpenses.value)
);

const addExpense = (expense: Expense) => {
  expenses.value.push(expense);
};

const onCategoryChange = (val: string | null) => {
  selectedCategoryLocal.value = val ?? "All";
};

onMounted(() => {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  startDate.value = formatDate(thirtyDaysAgo);
  endDate.value = formatDate(today);
});
</script>

<style scoped>
.analytics-dashboard {
  padding: 16px;
}
</style>
