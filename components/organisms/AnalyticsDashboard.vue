<!-- <template>
  <v-container fluid class="analytics-dashboard">
    <v-card class="pa-4 mb-6" elevation="2">
      <v-card-title class="text-h5 mb-2"
        >Financial Analytics Dashboard</v-card-title
      >
      <v-card-subtitle>Visualize e gerencie suas despesas</v-card-subtitle>

      <v-card-text>
        <v-row class="mb-6">
          <v-col cols="12" md="4">
            <v-menu
              v-model="showStartDatePicker"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ props }">
                <v-text-field
                  v-model="startDate"
                  label="Data Início"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="props"
                  outlined
                  dense
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="startDate"
                @update:model-value="showStartDatePicker = false"
                no-title
                scrollable
              ></v-date-picker>
            </v-menu>
          </v-col>

          <v-col cols="12" md="4">
            <v-menu
              v-model="showEndDatePicker"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ props }">
                <v-text-field
                  v-model="endDate"
                  label="Data Fim"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="props"
                  outlined
                  dense
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="endDate"
                @update:model-value="showEndDatePicker = false"
                no-title
                scrollable
              ></v-date-picker>
            </v-menu>
          </v-col>

          <v-col cols="12" md="4">
            <v-select
              v-model="selectedCategory"
              :items="['All', ...uniqueCategories]"
              label="Categoria"
              outlined
              dense
              clearable
              @update:model-value="
                (val) => (selectedCategory = val === 'All' ? null : val)
              "
            ></v-select>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="6">
            <h3 class="text-h6 mb-3">Expenses Distribution</h3>
            <CategoryPieChart
              :data="pieChartData"
              title="Total Expenses by Category"
            />
          </v-col>

          <v-col cols="12" md="6">
            <h3 class="text-h6 mb-3">Expenses Over Time</h3>
            <ExpenseLineChart
              :data="lineChartData"
              title="Daily Expenses Trend"
            />
          </v-col>
        </v-row>

        <v-divider class="my-6"></v-divider>

        <v-row>
          <v-col cols="12" md="6">
            <h3 class="text-h6 mb-3">Recent Expenses (Filtered)</h3>
            <v-list dense>
              <v-list-item
                v-for="(expense, index) in filteredExpenses"
                :key="index"
              >
                <v-list-item-content>
                  <v-list-item-title>
                    {{ expense.date }} - {{ expense.category }}: R$
                    {{ expense.amount.toFixed(2) }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item v-if="filteredExpenses.length === 0">
                <v-list-item-content>
                  <v-list-item-title
                    >Nenhuma despesa encontrada para os filtros
                    selecionados.</v-list-item-title
                  >
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-col>

          <v-col cols="12" md="6">
            <h3 class="text-h6 mb-3">Add New Expense</h3>
            <v-form @submit.prevent="addExpense">
              <v-text-field
                v-model="newCategory"
                label="Category"
                outlined
                dense
                class="mb-2"
              ></v-text-field>
              <v-text-field
                v-model.number="newAmount"
                label="Amount"
                type="number"
                outlined
                dense
                class="mb-2"
              ></v-text-field>
              <v-menu
                v-model="showNewDatePicker"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ props }">
                  <v-text-field
                    v-model="newDate"
                    label="Date"
                    prepend-icon="mdi-calendar"
                    readonly
                    v-bind="props"
                    outlined
                    dense
                    class="mb-4"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="newDate"
                  @update:model-value="showNewDatePicker = false"
                  no-title
                  scrollable
                ></v-date-picker>
              </v-menu>
              <v-btn color="primary" type="submit" block>Add Expense</v-btn>
            </v-form>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import CategoryPieChart from "~/components/molecules/CategoryPieChart.vue";
import ExpenseLineChart from "~/components/molecules/ExpenseLineChart.vue";
import {
  groupByCategory,
  filterExpensesByDateAndCategory,
  groupExpensesByDate,
  getUniqueCategories,
  type Expense,
  formatDate,
} from "~/utils/expenseUtils";

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

const showStartDatePicker = ref(false);
const showEndDatePicker = ref(false);
const showNewDatePicker = ref(false);
const startDate = ref<string | null>(null);
const endDate = ref<string | null>(null);
const selectedCategory = ref<string | null>(null);
const uniqueCategories = computed(() => getUniqueCategories(expenses.value));

const filteredExpenses = computed(() => {
  return filterExpensesByDateAndCategory(
    expenses.value,
    startDate.value,
    endDate.value,
    selectedCategory.value
  );
});

const pieChartData = computed(() => groupByCategory(filteredExpenses.value));
const lineChartData = computed(() =>
  groupExpensesByDate(filteredExpenses.value)
);
const newCategory = ref("");
const newAmount = ref(0);
const newDate = ref(formatDate(new Date()));

const addExpense = () => {
  if (newCategory.value && newAmount.value > 0 && newDate.value) {
    expenses.value.push({
      category: newCategory.value,
      amount: newAmount.value,
      date: newDate.value,
    });
    newCategory.value = "";
    newAmount.value = 0;
    newDate.value = formatDate(new Date());
  }
};

onMounted(() => {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  endDate.value = formatDate(today);
  startDate.value = formatDate(thirtyDaysAgo);
});
</script>

<style scoped>
.analytics-dashboard {
  padding: 16px;
}
</style> -->
