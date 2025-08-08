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

    <section class="mb-6">
      <ExpenseSummary />
    </section>

    <v-row justify="center" class="mb-4" align="start">
      <v-col cols="12" md="6" lg="5" class="pr-md-3 pb-4 pb-md-0">
        <ExpenseRegisterCard />
      </v-col>

      <v-col cols="12" md="6" lg="7" class="pl-md-3 pt-md-0">
        <ExpenseList />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import ExpenseSummary from "~/components/modules/expenses/ExpenseSummary.vue";
import ExpenseRegisterCard from "~/components/modules/expenses/ExpenseRegisterCard.vue";
import ExpenseList from "~/components/modules/expenses/ExpenseList.vue";

import { useExpensesStore } from "~/stores/useExpensesStore";
import { useCategoriesStore } from "~/stores/useCategoriesStore";

const expensesStore = useExpensesStore();
const categoriesStore = useCategoriesStore();

onMounted(() => {
  categoriesStore.fetchAllCategories().then(() => {
    expensesStore.fetchExpenses();
    expensesStore.fetchSalary();
  });
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

@media (max-width: 959px) {
  .expenses-page-container {
    padding-left: 16px;
    padding-right: 16px;
  }
}

@media (max-width: 599px) {
  .page-title {
    font-size: 1.8rem !important;
  }
}
</style>
