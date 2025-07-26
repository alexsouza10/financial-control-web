<template>
  <v-sheet class="mb-4 pa-2 rounded-lg" color="transparent">
    <v-row no-gutters>
      <!-- Salário -->
      <v-col cols="12" sm="4" class="pa-1">
        <ExpenseCard
          icon="mdi-wallet"
          title="Salário"
          :value="store.salary"
          color="success"
          :max-value="store.salary * 1.5"
          edit-icon="mdi-pencil"
          edit-title="Editar salário"
          @edit-click="openDialog"
        />
      </v-col>
      
      <!-- Total do Mês -->
      <v-col cols="12" sm="4" class="pa-1">
        <ExpenseCard
          icon="mdi-cash-multiple"
          title="Débito do Mês"
          :value="store.currentMonthExpenses"
          color="error"
          :max-value="store.salary || 1"
          :custom-class="getExpenseCardClass('debito')"
        />
      </v-col>
      
      <!-- Saldo -->
      <v-col cols="12" sm="4" class="pa-1">
        <ExpenseCard
          icon="mdi-cash-check"
          title="Saldo"
          :value="restante"
          color="warning"
          :max-value="Math.max(Math.abs(store.salary), Math.abs(restante) * 1.5, 1)"
          :custom-class="getExpenseCardClass('saldo')"
        />
      </v-col>
    </v-row>
  </v-sheet>

  <EditNumberDialog
    v-model="dialog"
    :value="store.salary"
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
import { useExpensesStore } from "~/stores/useExpensesStore";
import ExpenseCard from "../molecules/ExpenseCard.vue";
import EditNumberDialog from "../dialogs/EditNumberDialog.vue";

const store = useExpensesStore();
const dialog = ref(false);

const restante = computed(() => store.salary - store.currentMonthExpenses);

function openDialog() {
  dialog.value = true;
}

function updateSalary(newValue: number) {
  if (newValue >= 0) {
    store.setSalary(newValue);
  }
  dialog.value = false;
}

// Adiciona classes dinâmicas baseadas no estado
function getExpenseCardClass(type: string) {
  const classes = [];
  
  if (type === 'saldo') {
    if (restante.value >= 0) {
      classes.push('bg-success-lighten-5');
    } else {
      classes.push('bg-error-lighten-5');
    }
  } else if (type === 'debito') {
    // Always apply error color for 'Débito do Mês' card
    classes.push('bg-error-lighten-5');
  }
  
  return classes.join(' ');
}

// Carrega os dados iniciais
onMounted(() => {
  store.fetchSalary();
  store.fetchExpenses();
});
</script>

<style scoped>
/* Animações */
@keyframes subtlePulse {
  0% { box-shadow: 0 0 0 0 rgba(var(--v-theme-error), 0.2); }
  70% { box-shadow: 0 0 0 6px rgba(var(--v-theme-error), 0); }
  100% { box-shadow: 0 0 0 0 rgba(var(--v-theme-error), 0); }
}

/* Melhorias de responsividade */
@media (max-width: 960px) {
  :deep(.v-card) {
    margin-bottom: 8px;
  }
}
</style>