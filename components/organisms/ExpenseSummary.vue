<template>
  <v-row class="mb-6" justify="center" align="center" dense>
    <v-col cols="12" sm="6">
      <ExpenseCard
        icon="mdi-cash-multiple"
        title="Total"
        :value="store.totalExpenses"
        color="green darken-2"
      />
    </v-col>

    <v-col cols="12" sm="6">
      <ExpenseCard
        icon="mdi-calculator"
        title="Média"
        :value="store.averageExpense"
        color="blue darken-2"
      />
    </v-col>

    <v-col cols="12" sm="6">
      <ExpenseCard
        icon="mdi-wallet"
        title="Salário"
        :value="store.salary"
        color="orange darken-2"
        edit-icon="mdi-pencil"
        edit-title="Editar salário"
        @edit-click="openDialog"
      />
    </v-col>

    <v-col cols="12" sm="6">
      <ExpenseCard
        icon="mdi-cash-check"
        title="Sobra"
        :value="restante"
        color="teal darken-2"
      />
    </v-col>
  </v-row>

  <EditNumberDialog
    v-model="dialog"
    :value="store.salary"
    :expense="null"
    title="Editar Salário"
    label="Novo salário"
    :min="0"
    suffix="R$"
    confirm-color="orange darken-2"
    @update:value="updateSalary"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useExpensesStore } from "~/stores/useExpensesStore";
import ExpenseCard from "../molecules/ExpenseCard.vue";
import EditNumberDialog from "../dialogs/EditNumberDialog.vue";

const store = useExpensesStore();
const dialog = ref(false);

const restante = computed(() => store.salary - store.totalExpenses);

function openDialog() {
  dialog.value = true;
}

function updateSalary(newValue: number) {
  if (newValue >= 0) {
    store.setSalary(newValue);
  }
  dialog.value = false;
}

onMounted(() => {
  store.fetchSalary();
});
</script>
