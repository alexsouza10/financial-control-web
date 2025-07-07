<template>
  <v-container class="py-2">
    <h1 class="text-h4 mb-6 text-center">Controle de Gastos</h1>

    <ExpenseSummary />
    <ExpenseForm @add="addExpense" />
    <ExpenseList :expenses="store.expenses" @delete="deleteExpense" />
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useExpensesStore } from "~/stores/expenses";
import ExpenseSummary from "~/components/organisms/ExpenseSummary.vue";
import ExpenseForm from "~/components/molecules/ExpenseForm.vue";
import ExpenseList from "~/components/organisms/ExpenseList.vue";

const store = useExpensesStore();

function addExpense(expense) {
  store.addExpense(expense);
}

function deleteExpense(id) {
  store.removeExpense(id);
}

onMounted(() => {
  store.fetchExpenses();
});
</script>
