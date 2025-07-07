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
              outlined
              dense
              clearable
              :rules="[(v) => !!v || 'Categoria é obrigatória']"
              required
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="amount"
              label="Valor Total (R$)"
              type="number"
              min="0.01"
              outlined
              dense
              clearable
              :rules="[(v) => v > 0 || 'Valor deve ser positivo']"
              required
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="paymentMethod"
              :items="paymentMethods"
              label="Método de Pagamento"
              outlined
              dense
              clearable
              :rules="[(v) => !!v || 'Escolha um método']"
              required
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="installments"
              label="Quantidade de Parcelas"
              type="number"
              min="1"
              outlined
              dense
              clearable
              :rules="[(v) => v >= 1 || 'Deve ter ao menos 1 parcela']"
              required
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="card"
              :items="cards"
              label="Cartão"
              outlined
              dense
              clearable
              :rules="[(v) => !!v || 'Selecione um cartão']"
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
</template>

<script setup lang="ts">
import { ref } from "vue";
import DatePickerField from "~/components/atoms/DatePickerField.vue";
import { formatDate } from "~/utils/expenseUtils";

const emit = defineEmits<{
  (
    e: "add",
    expense: {
      category: string;
      amount: number;
      paymentMethod: string;
      installments: number;
      card: string;
      date: string;
    }
  ): void;
}>();

const category = ref("");
const amount = ref(0);
const paymentMethod = ref("");
const installments = ref(1);
const card = ref("");
const date = ref(formatDate(new Date()));

const paymentMethods = [
  "Cartão de Crédito",
  "Débito",
  "Dinheiro",
  "Pix",
  "Boleto",
];

const cards = ["Nubank", "Banco Inter", "Santander", "Bradesco", "Itaú"];

const submitForm = () => {
  if (
    !category.value ||
    amount.value <= 0 ||
    !paymentMethod.value ||
    installments.value < 1 ||
    !card.value
  ) {
    alert("Por favor, preencha todos os campos corretamente.");
    return;
  }

  emit("add", {
    category: category.value,
    amount: amount.value,
    paymentMethod: paymentMethod.value,
    installments: installments.value,
    card: card.value,
    date: date.value,
  });

  category.value = "";
  amount.value = 0;
  paymentMethod.value = "";
  installments.value = 1;
  card.value = "";
  date.value = formatDate(new Date());
};
</script>
