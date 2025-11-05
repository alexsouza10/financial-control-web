<template>
  <v-container fluid class="pa-2 mt-4" style="max-width: 1600px">
    <!-- Cabeçalho -->
    <v-col cols="12">
      <v-card class="pa-4 rounded-md elevation-2">
        <v-row justify="center" align="center">
          <v-col cols="12" md="6" class="text-center">
            <v-row class="justify-center align-center mb-2">
              <v-icon color="primary" size="30" class="me-2">
                mdi-finance
              </v-icon>
              <h2 class="text-h5 font-weight-medium mb-0">Painel Financeiro</h2>
            </v-row>
            <p class="text-body-2">
              Organize seus gastos e mantenha suas finanças sob controle.
            </p>
          </v-col>
        </v-row>
      </v-card>
    </v-col>

    <!-- Skeletons enquanto carrega -->
    <div v-if="isLoading">
      <v-skeleton-loader type="image" height="110" class="mb-6" />
      <v-skeleton-loader type="list-item-avatar-two-line@5" />
    </div>

    <!-- Conteúdo principal -->
    <v-slide-y-transition group appear v-else>
      <v-row>
        <!-- Coluna esquerda: resumo e lista -->
        <v-col cols="12" md="5">
          <section class="mb-6">
            <ExpenseSummary />
            <v-row class="mb-2" justify="center" align="center">
              <v-col cols="auto">
                <v-btn
                  color="primary"
                  large
                  rounded="md"
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

        <!-- Coluna direita: dashboard -->
        <v-col cols="12" md="7">
          <ExpenseDashboard />
        </v-col>
      </v-row>
    </v-slide-y-transition>

    <!-- Dialog de registro de gasto -->
    <v-dialog v-model="isRegisterDialogOpen" max-width="700" scrollable>
      <ExpenseRegisterCard
        @close="isRegisterDialogOpen = false"
        @expense-saved="handleExpenseSaved"
      />
    </v-dialog>

    <!-- Snackbar -->
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

const expensesStore = useExpensesStore();
const categoriesStore = useCategoriesStore();

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

onMounted(refreshData);
</script>
