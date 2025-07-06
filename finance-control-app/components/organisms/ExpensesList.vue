<template>
  <v-card class="elevation-3">
    <v-card-title class="text-h6 d-flex align-center">
      <v-icon left>mdi-format-list-bulleted</v-icon>
      Lista de Gastos
    </v-card-title>

    <v-card-text>
      <v-expansion-panels variant="accordion" v-if="Object.keys(expensesByMonth).length">
        <v-expansion-panel
          v-for="(expensesInMonth, month) in expensesByMonth"
          :key="month"
          :title="formatMonthYear(String(month))"
        >
          <v-expansion-panel-text>
            <v-list density="compact">
              <v-list-item
                v-for="expense in expensesInMonth"
                :key="expense.id"
                class="py-2"
              >
                <v-list-item-title class="font-weight-medium">
                  {{ expense.description }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatDate(expense.date) }}
                </v-list-item-subtitle>
                <template v-slot:append>
                  <span class="font-weight-bold text-red-darken-2 mr-4">
                    R$ {{ expense.amount.toFixed(2) }}
                  </span>
                  <v-btn icon flat size="small" @click="removeExpense(expense.id)">
                    <v-icon color="red">mdi-delete</v-icon>
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <v-alert v-else type="info" class="mt-4">
        Nenhum gasto adicionado.
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useExpensesStore } from '~/stores/expenses'
import { computed } from 'vue'

const expensesStore = useExpensesStore()

const expensesByMonth = computed(() => expensesStore.expensesByMonth)

function removeExpense(id: string) {
  expensesStore.removeExpense(id)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR')
}

function formatMonthYear(month: string) {
  const [year, monthNum] = month.split('-')
  const date = new Date(Number(year), Number(monthNum) - 1)
  return date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' })
}
</script>
