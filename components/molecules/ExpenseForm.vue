<template>
  <v-card class="pa-4 mb-6 elevation-3">
    <v-card-title class="text-h6"> Registrar Novo Gasto </v-card-title>

    <v-card-text>
      <v-form @submit.prevent="submitForm" ref="formRef">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="category"
              label="Categoria"
              variant="outlined"
              density="comfortable"
              clearable
              :rules="[rules.required]"
              required
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="amount"
              label="Valor Total (R$)"
              type="number"
              variant="outlined"
              density="comfortable"
              clearable
              :rules="[rules.required, rules.positiveAmount]"
              required
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="paymentMethod"
              :items="paymentMethods"
              label="Método de Pagamento"
              variant="outlined"
              density="comfortable"
              clearable
              :rules="[rules.required]"
              required
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="installments"
              label="Quantidade de Parcelas"
              type="number"
              variant="outlined"
              density="comfortable"
              clearable
              :rules="[rules.required, rules.minOneInstallment]"
              required
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="card"
              :items="cards"
              label="Cartão"
              variant="outlined"
              density="comfortable"
              clearable
              :rules="[rules.required]"
              required
            />
          </v-col>

          <v-col cols="12" md="6">
            <DatePickerField v-model="date" label="Data" class="mt-0" />
          </v-col>

          <v-col cols="12" class="text-right">
            <v-btn color="primary" type="submit"> Salvar Gasto </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>

  <v-snackbar
    v-model="snackbar.show"
    :color="snackbar.color"
    :timeout="snackbar.timeout"
  >
    {{ snackbar.message }}
    <template #actions>
      <v-btn text @click="snackbar.show = false"> Fechar </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref } from "vue";
import DatePickerField from "~/components/atoms/DatePickerField.vue";
import { useExpensesStore } from '~/stores/expenses';
import type { VForm } from 'vuetify/components'; 
import { AxiosError } from "axios"; 

const expensesStore = useExpensesStore();

const formRef = ref<VForm | null>(null);

const category = ref("");
const amount = ref(0);
const paymentMethod = ref("");
const installments = ref(1);
const card = ref("");
const date = ref(new Date().toISOString().split('T')[0]);

const paymentMethods = [
  "Cartão de Crédito",
  "Débito",
  "Dinheiro",
  "Pix",
  "Boleto",
];

const cards = ["Nubank", "Banco Inter", "Santander", "Bradesco", "Itaú"]; 

const snackbar = ref({
  show: false,
  message: '',
  color: '',
  timeout: 3000,
});

const rules = {
  required: (v: string | number | null | undefined) => !!v || 'Campo obrigatório',
  positiveAmount: (v: number) => v > 0 || 'Valor deve ser positivo',
  minOneInstallment: (v: number) => v >= 1 || 'Deve ter ao menos 1 parcela',
};

const submitForm = async () => {
  const { valid } = await formRef.value!.validate();

  if (!valid) {
    snackbar.value = {
      show: true,
      message: 'Por favor, preencha todos os campos corretamente.',
      color: 'warning',
      timeout: 3000,
    };
    return;
  }

  try {
    await expensesStore.addExpense({
      category: category.value,
      value: amount.value,
      paymentMethod: paymentMethod.value,
      installments: installments.value,
      card: card.value,
      date: `${date.value}T00:00:00.000Z`,
    });

    formRef.value?.reset();
    date.value = new Date().toISOString().split('T')[0];

    snackbar.value = {
      show: true,
      message: 'Gasto adicionado com sucesso!',
      color: 'success',
      timeout: 3000,
    };
  } catch (error: unknown) { 
    let errorMessage = 'Erro ao adicionar despesa. Verifique o console.';
    if (error instanceof AxiosError) {
      console.error("Erro Axios ao adicionar despesa:", error.response?.data || error.message);
      if (error.response?.data?.message) {
        errorMessage = `Erro: ${error.response.data.message}`; 
      } else if (error.response?.status) {
        errorMessage = `Erro ${error.response.status}: ${error.message}`; 
      }
    } else {
      console.error("Erro inesperado ao adicionar despesa:", error);
    }

    snackbar.value = {
      show: true,
      message: errorMessage,
      color: 'error',
      timeout: 5000,
    };
  }
};
</script>