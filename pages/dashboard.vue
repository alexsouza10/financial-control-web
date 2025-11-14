<template>
  <v-container fluid class="pa-4" style="max-width: 1600px">
    <div v-if="isLoading">
      <v-skeleton-loader type="image" height="110" class="mb-6" />
      <v-skeleton-loader type="list-item-avatar-two-line@5" />
    </div>

    <v-slide-y-transition group appear v-else>
      <v-row>
        <v-col cols="12" md="5">
          <section class="mb-6">
            <ExpenseSummary />
            <v-row class="mt-4" justify="center" align="center">
              <v-col cols="auto">
                <v-btn
                  color="primary"
                  size="large"
                  rounded="lg"
                  elevation="6"
                  prepend-icon="mdi-plus-circle-outline"
                  @click="isRegisterDialogOpen = true"
                >
                  Novo Gasto
                </v-btn>
              </v-col>
            </v-row>
          </section>
          <ExpenseList />
        </v-col>

        <v-col cols="12" md="7">
          <ExpenseDashboard />
        </v-col>
      </v-row>
    </v-slide-y-transition>

    <v-dialog v-model="isRegisterDialogOpen" max-width="700" scrollable>
      <ExpenseRegisterCard
        @close="isRegisterDialogOpen = false"
        @expense-saved="handleExpenseSaved"
      />
    </v-dialog>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      location="top right"
      rounded="md"
    >
      <v-icon start>{{ snackbar.icon }}</v-icon>
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import ExpenseSummary from "~/components/modules/expenses/ExpenseSummary.vue";
import ExpenseRegisterCard from "~/components/modules/expenses/ExpenseRegisterCard.vue";
import ExpenseList from "~/components/modules/expenses/ExpenseList.vue";
import ExpenseDashboard from "~/components/modules/expenses/ExpenseDashboard.vue";
import { useExpensesStore } from "~/stores/useExpensesStore";
import { useCategoriesStore } from "~/stores/useCategoriesStore";
import { useAuthStore } from "~/stores/useAuthStore";

const expensesStore = useExpensesStore();
const categoriesStore = useCategoriesStore();
const authStore = useAuthStore();

const isLoading = ref(true);
const isRegisterDialogOpen = ref(false);

const snackbar = reactive({
  show: false,
  message: "",
  color: "success",
  icon: "mdi-check-circle",
});

function showSnackbar(
  message: string,
  color = "success",
  icon = "mdi-check-circle"
) {
  snackbar.message = message;
  snackbar.color = color;
  snackbar.icon = icon;
  snackbar.show = true;
}

function handleExpenseSaved() {
  isRegisterDialogOpen.value = false;
  showSnackbar("Gasto registrado com sucesso!");
  refreshData();
}

async function refreshData() {
  isLoading.value = true;
  try {
    await Promise.all([
      categoriesStore.fetchAllCategories(),
      expensesStore.fetchExpenses(),
      expensesStore.fetchSalary(),
    ]);
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    showSnackbar("Falha ao carregar dados.", "error", "mdi-alert-circle");
  } finally {
    isLoading.value = false;
  }
}

const dashboardLabel = computed(() => {
  if (authStore.isPersonalDashboard) return "Pessoal";
  if (authStore.isLinked) return "Compartilhado";
  return null;
});

onMounted(refreshData);
</script>
