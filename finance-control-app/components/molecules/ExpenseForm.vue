<template>
  <v-card class="pa-4 mb-6">
    <v-form @submit.prevent="addExpense">
      <v-row>
        <v-col cols="12" sm="6" md="4">
          <v-text-field v-model="description" label="Descrição" required />
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <v-text-field
            v-model.number="totalValue"
            label="Valor Total (R$)"
            type="number"
            min="0.01"
            required
          />
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <v-select
            v-model="paymentMethod"
            :items="paymentMethods"
            label="Método de Pagamento"
            required
          />
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <v-text-field
            v-model.number="installments"
            label="Número de Parcelas"
            type="number"
            min="1"
            required
          />
        </v-col>
      </v-row>

      <v-card class="pa-4 mt-4">
        <strong>Valor de cada parcela:</strong> R$ {{ installmentValue.toFixed(2) }}
      </v-card>

      <v-btn type="submit" color="primary" class="mt-4">
        Salvar Gasto
      </v-btn>
    </v-form>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useExpensesStore } from '~/stores/expenses'

const expensesStore = useExpensesStore()

const description = ref('')
const totalValue = ref(0)
const paymentMethod = ref('')
const installments = ref(1)

const paymentMethods = ['Cartão de Crédito', 'Dinheiro', 'Pix', 'Débito', 'Boleto']

const installmentValue = computed(() => {
  return installments.value > 0 ? totalValue.value / installments.value : 0
})

function addExpense() {
  if (!description.value || !paymentMethod.value || totalValue.value <= 0 || installments.value < 1) {
    alert('Preencha todos os campos corretamente!')
    return
  }

  expensesStore.addExpense({
    description: `${description.value} (${paymentMethod.value} - ${installments.value}x)`,
    amount: totalValue.value,
    date: new Date().toISOString().split('T')[0],
  })

  description.value = ''
  totalValue.value = 0
  paymentMethod.value = ''
  installments.value = 1
}
</script>
