<template>
  <v-container fluid class="pa-4">
    <v-card class="mb-6 pa-4 rounded-xl elevation-3" height="auto">
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

    <div v-if="isLoading">
      <v-skeleton-loader type="image" height="110" class="mb-6" />
      <v-skeleton-loader type="list-item-avatar-two-line@5" />
    </div>

    <v-slide-y-transition group appear v-else>
      <v-row>
        <v-col cols="12" md="4">
          <section class="mb-6">
            <ExpenseSummary />
            <v-row class="mb-4" justify="center" align="center">
              <v-col cols="auto">
                <v-btn
                  color="primary"
                  large
                  rounded="pill"
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

        <v-col cols="12" md="8">
          <ExpenseDashboard />
        </v-col>
      </v-row>
    </v-slide-y-transition>

    <v-btn
      v-if="$vuetify.display.smAndDown"
      icon="mdi-plus"
      color="primary"
      fixed
      bottom
      right
      large
      class="ma-4 elevation-8"
      @click="isRegisterDialogOpen = true"
    />

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
      rounded="pill"
    >
      <v-icon start>{{ snackbar.icon }}</v-icon>
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
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
}

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
</script>
