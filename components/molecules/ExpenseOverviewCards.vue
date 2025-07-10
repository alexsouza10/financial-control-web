<template>
  <v-row class="mb-6" justify="center" align="center" dense>
    <v-col cols="12" md="4">
      <ExpenseCard
        icon="mdi-cash-multiple"
        title="Total Gasto"
        :value="expensesStore.totalExpenses"
        color="green darken-2"
        custom-class="bg-green-lighten-5"
      />
    </v-col>

    <v-col cols="12" md="4">
      <ExpenseCard
        icon="mdi-calculator"
        title="Média Gasto"
        :value="expensesStore.averageExpense"
        color="blue darken-2"
        custom-class="bg-blue-lighten-5"
      />
    </v-col>

    <v-col cols="12" md="4">
      <ExpenseCard
        icon="mdi-wallet"
        title="Salário"
        :value="expensesStore.salary"
        color="orange darken-2"
        edit-icon="mdi-pencil"
        edit-title="Editar salário"
        @edit-click="openDialog"
        custom-class="bg-orange-lighten-5"
      />
    </v-col>
  </v-row>

  <v-row justify="center" align="center" dense class="mb-6">
    <v-col cols="12" md="4">
      <ExpenseCard
        icon="mdi-cash-check"
        title="Sobra"
        :value="restante"
        color="teal darken-2"
        custom-class="bg-teal-lighten-5"
      />
    </v-col>
  </v-row>

  <EditNumberDialog
    v-model="dialog"
    :value="expensesStore.salary"
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
import { useExpensesStore } from "~/stores/expenses";
import ExpenseCard from "../molecules/ExpenseCard.vue";
import EditNumberDialog from "../dialogs/EditNumberDialog.vue";

const expensesStore = useExpensesStore(); 
const dialog = ref(false);

const restante = computed(() => expensesStore.salary - expensesStore.totalExpenses);

function openDialog() {
  dialog.value = true;
}

async function updateSalary(newValue: number) { 
  if (newValue >= 0) {
    try {
      await expensesStore.setSalary(newValue); 
      alert('Salário atualizado com sucesso!');
    } catch (error) {
      console.error("Erro ao atualizar salário:", error);
      alert('Erro ao atualizar salário. Verifique o console.');
    }
  }
  dialog.value = false;
}

onMounted(() => {
  expensesStore.fetchSalary();
});
</script>