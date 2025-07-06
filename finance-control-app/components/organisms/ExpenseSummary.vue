<template>
  <v-row class="mb-6">
    <v-col cols="12" md="6">
      <v-card outlined class="pa-4 text-center">
        <v-icon size="60" color="green-darken-2" class="mb-2">mdi-cash-multiple</v-icon>
        <v-card-title class="text-h5 font-weight-bold">Total</v-card-title>
        <v-card-text class="text-h4 font-weight-bold text-green-darken-2">
          R$ {{ store.totalExpenses.toFixed(2) }}
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="6">
      <v-card outlined class="pa-4 text-center">
        <v-icon size="60" color="blue-darken-2" class="mb-2">mdi-calculator</v-icon>
        <v-card-title class="text-h5 font-weight-bold">Média</v-card-title>
        <v-card-text class="text-h4 font-weight-bold text-blue-darken-2">
          R$ {{ store.averageExpense.toFixed(2) }}
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { useExpensesStore } from '~/stores/expenses'
const store = useExpensesStore()
</script>