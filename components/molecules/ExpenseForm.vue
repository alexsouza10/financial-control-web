<template>
  <v-card class="pa-4 mb-6 elevation-3">
    <v-card-title class="text-h6"> Registrar Novo Gasto </v-card-title>

    <v-card-text>
      <v-form @submit.prevent="submitForm" ref="formRef">
        <v-row>
          <v-col cols="12" md="6">
            <v-select
              v-model="editedExpense.category"
              :items="categoriesStore.categories"
              item-title="name"
              item-value="id"
              label="Categoria"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              class="mb-4"
              required
              :rules="[rules.required]"
              :loading="categoriesStore.loading"
              :disabled="categoriesStore.loading"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="editedExpense.value"
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
              v-model="editedExpense.paymentMethod"
              :items="paymentMethods"
              label="Método de Pagamento"
              variant="outlined"
              density="comfortable"
              clearable
              :rules="[rules.required]"
              required
            />
          </v-col>

          <v-col
            cols="12"
            md="6"
            v-if="editedExpense.paymentMethod === 'Cartão de Crédito'"
          >
            <v-text-field
              v-model.number="editedExpense.installments"
              label="Quantidade de Parcelas"
              type="number"
              variant="outlined"
              density="comfortable"
              clearable
              :rules="[rules.required, rules.minOneInstallment]"
              required
            />
          </v-col>

          <v-col
            cols="12"
            md="6"
            v-if="editedExpense.paymentMethod === 'Cartão de Crédito'"
          >
            <v-select
              v-model="editedExpense.card"
              :items="cards"
              label="Cartão"
              variant="outlined"
              density="comfortable"
              clearable
              :rules="[rules.required]"
              required
            />
          </v-col>

          <v-col
            cols="12"
            :md="editedExpense.paymentMethod === 'Cartão de Crédito' ? 6 : 12"
          >
            <DatePickerField
              v-model="editedExpense.date"
              label="Data"
              class="mt-0"
            />
          </v-col>

          <v-col cols="12" class="text-right">
            <v-btn color="primary" type="submit"> Salvar Gasto </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>

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
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import DatePickerField from "~/components/atoms/DatePickerField.vue";
import { useExpensesStore } from "~/stores/useExpensesStore";
import { useCategoriesStore } from "#imports";
import type { VForm } from "vuetify/components";
import { AxiosError } from "axios";
import type { Expense } from "~/types/expense";
import { addMonths, parseISO, format } from "date-fns";

const expensesStore = useExpensesStore();
const categoriesStore = useCategoriesStore();

const formRef = ref<VForm | null>(null);

const editedExpense = ref<Expense>({
  category: "",
  value: 0,
  paymentMethod: "",
  installments: 1,
  card: "",
  date: new Date().toISOString(),
} as Expense);

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
  message: "",
  color: "",
  timeout: 3000,
});

const rules = {
  required: (v: string | number | null | undefined) =>
    (v !== null && v !== undefined && v !== "") || "Campo obrigatório",
  positiveAmount: (v: number) => v > 0 || "Valor deve ser positivo",
  minOneInstallment: (v: number) => v >= 1 || "Deve ter ao menos 1 parcela",
};

watch(
  () => editedExpense.value.paymentMethod,
  (newMethod) => {
    if (newMethod !== "Cartão de Crédito") {
      editedExpense.value.installments = 1;
      editedExpense.value.card = "";
      formRef.value?.resetValidation();
    }
  }
);

const submitForm = async () => {
  const { valid } = await formRef.value!.validate();

  if (!valid) {
    snackbar.value = {
      show: true,
      message: "Por favor, preencha todos os campos corretamente.",
      color: "warning",
      timeout: 3000,
    };
    return;
  }

  try {
    const totalValue = editedExpense.value.value;
    const installmentsCount = editedExpense.value.installments;
    let initialDate = parseISO(editedExpense.value.date);

    const expensesToRegister: Expense[] = [];
    const installmentValue = totalValue / installmentsCount;

    for (let i = 0; i < installmentsCount; i++) {
      const currentInstallmentDate = addMonths(initialDate, i);
      const formattedDateForBackend = `${format(
        currentInstallmentDate,
        "yyyy-MM-dd"
      )}T00:00:00.000Z`;

      const expensePayload: Expense = {
        category: editedExpense.value.category,
        value: installmentValue,
        paymentMethod: editedExpense.value.paymentMethod,
        installments: 1,
        card: editedExpense.value.card,
        date: formattedDateForBackend,
        categoryId: editedExpense.value.category,
      };

      expensesToRegister.push(expensePayload);
    }

    console.log("Despesas a serem registradas:", expensesToRegister);

    await Promise.all(
      expensesToRegister.map((expense) => expensesStore.addExpense(expense))
    );

    formRef.value?.reset();
    editedExpense.value = {
      category: "",
      value: 0,
      paymentMethod: "",
      installments: 1,
      card: "",
      date: new Date().toISOString(),
    } as Expense;

    snackbar.value = {
      show: true,
      message:
        installmentsCount > 1
          ? "Gastos parcelados adicionados com sucesso!"
          : "Gasto adicionado com sucesso!",
      color: "success",
      timeout: 3000,
    };
  } catch (error: unknown) {
    let errorMessage = "Erro ao adicionar despesa. Verifique o console.";
    if (error instanceof AxiosError) {
      console.error(
        "Erro Axios ao adicionar despesa:",
        error.response?.data || error.message
      );
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
      color: "error",
      timeout: 5000,
    };
  }
};

onMounted(() => {
  categoriesStore.fetchAllCategories();
});
</script>

<style scoped>
/* Ensure this section is empty or contains only valid CSS */
</style>
