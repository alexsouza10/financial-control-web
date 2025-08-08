<template>
  <v-list-item class="py-2">
    <template v-slot:prepend>
      <v-icon color="grey-darken-1">mdi-circle-small</v-icon>
    </template>
    <v-list-item-title class="font-weight-medium">
      {{ expense.category }}
    </v-list-item-title>
    <v-list-item-subtitle>{{ formatDate(expense.date) }}</v-list-item-subtitle>
    <template v-slot:append>
      <span class="font-weight-bold text-red-darken-2 mr-4">R$ {{ expense.value.toFixed(2) }}</span> <v-btn icon flat size="small" @click="$emit('delete', expense.id)">
        <v-icon color="red">mdi-delete</v-icon>
      </v-btn>
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/formatters'
import type { Expense } from '~/types/expense'

defineProps<{ expense: Expense }>()
defineEmits(['delete'])
</script>