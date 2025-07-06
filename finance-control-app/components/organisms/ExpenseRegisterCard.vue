<template>
  <v-card class="mb-6 elevation-3">
    <v-card-title class="text-h6 d-flex align-center">
      <v-icon left class="mr-2">mdi-plus-circle</v-icon>
      Registrar Novo Gasto
    </v-card-title>

    <v-card-text>
      <v-form @submit.prevent="addExpense">
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="description"
              label="Descrição"
              variant="outlined"
              clearable
              density="compact"
              :rules="[(v) => !!v || 'Descrição obrigatória']"
              required
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field
              v-model.number="totalValue"
              label="Valor Total (R$)"
              type="number"
              variant="outlined"
              clearable
              density="compact"
              min="0.01"
              :rules="[(v) => v > 0 || 'Valor deve ser positivo']"
              required
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-select
              v-model="paymentMethod"
              :items="paymentMethods"
              label="Método de Pagamento"
              variant="outlined"
              density="compact"
              required
              :rules="[(v) => !!v || 'Escolha um método de pagamento']"
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field
              v-model.number="installments"
              label="Número de Parcelas"
              type="number"
              min="1"
              variant="outlined"
              density="compact"
              :rules="[(v) => v >= 1 || 'Deve ter pelo menos 1 parcela']"
              required
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field
              label="Valor de Cada Parcela (R$)"
              :model-value="installmentValue.toFixed(2)"
              readonly
              variant="outlined"
              density="compact"
            />
          </v-col>

          <v-col cols="12" class="text-right">
            <v-btn type="submit" color="primary" class="mt-2">
              <v-icon left>mdi-content-save</v-icon>
              Salvar Gasto
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
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

const paymentMethods = ['Cartão de Crédito', 'Débito', 'Dinheiro', 'Pix', 'Boleto']

const installmentValue = computed(() =>
  installments.value > 0 ? totalValue.value / installments.value : 0
)

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
