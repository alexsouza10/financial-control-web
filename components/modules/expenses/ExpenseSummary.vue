<template>
  <v-sheet class="mb-4 mt-1 pa-2 rounded-md" color="transparent">
    <v-row no-gutters>
      <v-col cols="12" sm="4" class="pa-1">
        <ExpenseCard
          icon="mdi-wallet"
          title="Salário"
          :value="currentSalary"
          color="success"
          :max-value="currentSalary * 1.5"
          edit-icon="mdi-pencil"
          edit-title="Editar salário"
          @edit-click="openDialog"
        />
      </v-col>

      <v-col cols="12" sm="4" class="pa-1">
        <ExpenseCard
          icon="mdi-cash-multiple"
          title="Débito"
          :value="currentMonthTotal"
          color="error"
          :max-value="currentSalary || 1"
          :custom-class="getExpenseCardClass('debito')"
        />
      </v-col>

      <v-col cols="12" sm="4" class="pa-1">
        <ExpenseCard
          icon="mdi-cash-check"
          title="Saldo"
          :value="restante"
          color="warning"
          :max-value="
            Math.max(Math.abs(currentSalary), Math.abs(restante) * 1.5, 1)
          "
          :custom-class="getExpenseCardClass('saldo')"
        />
      </v-col>
    </v-row>
  </v-sheet>

  <EditNumberDialog
    v-model="dialog"
    :value="currentSalary"
    :expense="null"
    title="Editar Salário"
    label="Novo salário"
    :min="0"
    suffix="R$"
    confirm-color="warning"
    @update:value="updateSalary"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useExpensesStore } from "~/stores/useExpensesStore";
import ExpenseCard from "./ExpenseCard.vue";
import EditNumberDialog from "~/components/dialogs/EditNumberDialog.vue";

const store = useExpensesStore();
const dialog = ref(false);

// MUDANÇA: 'salary' não é mais pego daqui
const { expenses, currentMonthKey } = storeToRefs(store);

// **** NOVA COMPUTED ****
// Busca o salário reativamente do NOVO getter da store
const currentSalary = computed(() => store.salaryForSelectedMonth);

// Calcular o total de débitos (sem mudanças, já usava currentMonthKey)
const currentMonthTotal = computed(() => {
  return expenses.value
    .filter((exp) => exp.date && exp.date.startsWith(currentMonthKey.value))
    .reduce((total, exp) => total + exp.value, 0);
});

// MUDANÇA: O saldo agora usa a nova 'currentSalary'
const restante = computed(() => currentSalary.value - currentMonthTotal.value);

function openDialog() {
  dialog.value = true;
}

// Esta função agora está correta. Ela chama a 'setSalary' da store,
// que foi modificada para salvar o salário no mês *selecionado*.
function updateSalary(newValue: number) {
  if (newValue >= 0) {
    store.setSalary(newValue);
  }
  dialog.value = false;
}

function getExpenseCardClass(type: string) {
  const classes = [];

  if (type === "saldo") {
    if (restante.value >= 0) {
      // 'restante' agora é reativo
      classes.push("bg-success-lighten-5");
    } else {
      classes.push("bg-error-lighten-5");
    }
  } else if (type === "debito") {
    classes.push("bg-error-lighten-5");
  }

  return classes.join(" ");
}

// Carrega os dados iniciais
onMounted(() => {
  store.fetchSalary(); // Agora busca *todos* os salários
  store.fetchExpenses();
});
</script>

<style scoped>
/* Animações */
@keyframes subtlePulse {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-error), 0.2);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(var(--v-theme-error), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-error), 0);
  }
}

/* Melhorias de responsividade */
@media (max-width: 960px) {
  :deep(.v-card) {
    margin-bottom: 8px;
  }
}
</style>
