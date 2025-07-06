<template>
  <v-container class="py-8">
    <ExpenseSummary />
    <ExpenseRegisterCard @delete="onDelete" />
    <ExpensesList @delete="onDelete" />
    <DeleteDialog v-model="showDialog" @confirm="removeConfirmed" />
    <BaseSnackbar
      v-model="snackbar.show"
      :text="snackbar.text"
      :color="snackbar.color"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ExpenseSummary from "~/components/organisms/ExpenseSummary.vue";
import ExpenseRegisterCard from "~/components/organisms/ExpenseRegisterCard.vue";
import ExpensesList from "~/components/organisms/ExpensesList.vue";
import DeleteDialog from "~/components/molecules/DeleteDialog.vue";
import BaseSnackbar from "~/components/atoms/BaseSnackbar.vue";
import { useExpensesStore } from "~/stores/expenses";

const store = useExpensesStore();

const showDialog = ref(false);
const expenseIdToDelete = ref<string | null>(null);

const snackbar = ref({ show: false, text: "", color: "success" });

function onDelete(id: string) {
  expenseIdToDelete.value = id;
  showDialog.value = true;
}

function removeConfirmed() {
  if (expenseIdToDelete.value) {
    store.removeExpense(expenseIdToDelete.value);
    snackbar.value = {
      show: true,
      text: "Gasto excluído com sucesso",
      color: "info",
    };
  }
  expenseIdToDelete.value = null;
}
</script>
