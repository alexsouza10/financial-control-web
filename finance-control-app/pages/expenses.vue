<template>
  <v-container class="py-8">
    <h1 class="text-h4 mb-6 text-center">Controle de Gastos</h1>

    <ExpenseSummary />

    <ExpenseForm />

    <ExpenseList />
  </v-container>
</template>

<script setup lang="ts">
import ExpenseSummary from "~/components/organisms/ExpenseSummary.vue";
import ExpenseForm from "~/components/molecules/ExpenseForm.vue";
import ExpenseList from "~/components/organisms/ExpensesList.vue";
</script>
