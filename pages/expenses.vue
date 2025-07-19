<template>
  <v-container fluid class="expenses-page-container">
    <h1
      class="page-title text-h4 text-sm-h3 font-weight-bold mb-4 text-center text-primary"
    >
      Painel Financeiro
    </h1>
    <p class="text-center text-body-1 mb-6">
      Acompanhe seus gastos e mantenha suas finanças sob controle
    </p>

    <!-- Summary Cards -->
    <section class="mb-6">
      <ExpenseSummary />
    </section>

    <!-- Analytics Chart -->
    <!-- <v-row class="mb-6" justify="center">
      <v-col cols="12">
        <AnalyticsChart />
      </v-col>
    </v-row> -->

    <!-- Main Content -->
    <v-row justify="center" class="mb-4" no-gutters>
      <v-col cols="12" lg="5" class="pr-lg-3">
        <ExpenseRegisterCard class="h-100" />
      </v-col>

      <v-col cols="12" lg="7" class="pl-lg-3 mt-4 mt-lg-0">
        <ExpenseList />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import ExpenseSummary from "~/components/organisms/ExpenseSummary.vue";
import ExpenseRegisterCard from "~/components/organisms/ExpenseRegisterCard.vue";
import ExpenseList from "~/components/organisms/ExpenseList.vue";
import AnalyticsChart from "~/components/organisms/AnalyticsChart.vue";

import { useExpensesStore } from "~/stores/useExpensesStore";
import { useCategoriesStore } from "~/stores/useCategoriesStore";

const expensesStore = useExpensesStore();
const categoriesStore = useCategoriesStore();

onMounted(() => {
  categoriesStore.fetchAllCategories();
  expensesStore.fetchExpenses();
  expensesStore.fetchSalary();
});
</script>

<style scoped>
.expenses-page-container {
  padding-top: 32px;
  padding-bottom: 64px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.page-title {
  animation: fadeInDown 0.8s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.v-col.d-flex {
  display: flex;
  flex-direction: column;
}

@media (max-width: 959px) {
  .expenses-page-container {
    padding-left: 16px;
    padding-right: 16px;
  }
  .v-col {
    margin-bottom: 24px;
  }
}

@media (max-width: 599px) {
  .page-title {
    font-size: 1.8rem !important;
  }
}
</style>
