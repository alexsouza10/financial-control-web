<template>
  <v-card class="mb-6 elevation-3">
    <v-card-title class="text-h6 d-flex align-center">
      <v-icon left class="mr-2">mdi-plus-circle</v-icon>
      Registrar Novo Gasto
    </v-card-title>

    <v-card-text>
      <v-form ref="expenseForm" @submit.prevent="submitExpense" validate-on="submit">
        <v-row>
          <v-col cols="12" sm="6">
            <v-select
              v-model="selectedCategory"
              :items="categoryItems"
              item-title="name"
              item-value="id"
              label="Categoria"
              variant="outlined"
              density="compact"
              :rules="categoryRules"
              required
              :loading="categoriesLoading"
              :disabled="categoriesLoading"
            />
          </v-col>

          <v-col cols="12" sm="6">
            <v-text-field
              v-model="formattedValue"
              @input="formatCurrencyInput"
              @blur="handleCurrencyBlur"
              @click:clear="handleCurrencyClear"
              label="Valor Total (R$)"
              variant="outlined"
              clearable
              density="compact"
              :rules="totalValueRules"
              required
            />
          </v-col>

          <v-col cols="12" sm="6">
            <v-select
              v-model="selectedPaymentMethod"
              :items="paymentMethods"
              label="Método de Pagamento"
              variant="outlined"
              density="compact"
              required
              :rules="paymentMethodRules"
            />
          </v-col>

          <v-col cols="12" sm="6">
            <DatePickerField
              v-model="selectedExpenseDate"
              label="Data"
              density="compact"
              :rules="dateRules"
              required
            />
          </v-col>

          <v-col cols="12" sm="6" v-if="isCreditCardPayment">
            <v-text-field
              v-model.number="numberOfInstallments"
              label="Número de Parcelas"
              type="number"
              min="1"
              variant="outlined"
              density="compact"
              :rules="installmentRules"
              required
            />
          </v-col>

          <v-col cols="12" sm="6" v-if="isCreditCardPayment">
            <v-select
              v-model="selectedCard"
              :items="cardOptions"
              label="Cartão"
              variant="outlined"
              density="compact"
              :rules="cardRules"
              required
            />
          </v-col>

          <v-col cols="12" :sm="isCreditCardPayment ? 6 : 12">
            <v-text-field
              label="Valor de Cada Parcela (R$)"
              :model-value="formattedInstallmentValue"
              readonly
              variant="outlined"
              density="compact"
            />
          </v-col>

          <v-col cols="12" class="text-right">
            <v-btn
              type="submit"
              color="primary"
              class="mt-2"
              :loading="isSavingExpense"
            >
              <v-icon left>mdi-content-save</v-icon>
              Salvar Gasto
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>

    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      timeout="3000"
      location="top right"
      rounded="pill"
      class="mt-4"
    >
      <div class="d-flex align-center">
        <v-icon v-if="snackbarColor === 'success'" class="me-2"
          >mdi-check-circle</v-icon
        >
        <v-icon v-else-if="snackbarColor === 'error'" class="me-2"
          >mdi-alert-circle</v-icon
        >
        <span>{{ snackbarMessage }}</span>
      </div>
      <template #actions>
        <v-btn
          color="white"
          variant="text"
          @click="showSnackbar = false"
          icon="mdi-close"
          size="small"
        ></v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import DatePickerField from "~/components/atoms/DatePickerField.vue";
import { useExpensesStore } from "~/stores/useExpensesStore";
import { useNuxtApp } from "#app";
import { addMonths, parseISO, format } from "date-fns";
import type { CreateExpensePayload } from "~/types/expense";

// --- State Variables ---
const expensesStore = useExpensesStore();
const { $api } = useNuxtApp();

const expenseForm = ref(null);

const rawTotalValue = ref(0);
const formattedValue = ref("");

const selectedPaymentMethod = ref("");
const numberOfInstallments = ref(1);
const selectedCategory = ref(null);
const selectedExpenseDate = ref(new Date().toISOString().split("T")[0]);
const selectedCard = ref("");

// Snackbar
const showSnackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("success");

const categories = ref([]);
const categoriesLoading = ref(false);
const isSavingExpense = ref(false);

// --- Constants ---
const paymentMethods = [
  "Cartão de Crédito",
  "Débito",
  "Dinheiro",
  "Pix",
  "Boleto",
];

const cardOptions = ["Nubank", "Hipercard", "Santander", "Outro"];

// --- Computed Properties ---
const categoryItems = computed(() => {
  return categories.value.map((cat) => ({
    id: cat.id,
    name: cat.name.toUpperCase(),
  }));
});

const isCreditCardPayment = computed(
  () => selectedPaymentMethod.value === "Cartão de Crédito"
);

const installmentValue = computed(() =>
  numberOfInstallments.value > 0 ? rawTotalValue.value / numberOfInstallments.value : 0
);

const formattedInstallmentValue = computed(() =>
  formatCurrency(installmentValue.value)
);

// --- Validation Rules ---
const categoryRules = [(v: any) => !!v || 'Escolha uma categoria'];
const paymentMethodRules = [(v: any) => !!v || 'Escolha um método de pagamento'];
const dateRules = [(v: any) => !!v || 'Data obrigatória'];
const installmentRules = [(v: any) => v >= 1 || 'Deve ter pelo menos 1 parcela'];
const cardRules = [(v: any) => !!v || 'Escolha um cartão'];
const totalValueRules = [
  (v: string) => {
    if (!v) return 'Campo obrigatório';
    const num = parseFloat(v?.replace(/\./g, '').replace(',', '.') || '0');
    return num > 0 || 'Valor deve ser positivo';
  }
];

// --- Watchers ---
watch(selectedPaymentMethod, (newMethod) => {
  if (newMethod !== "Cartão de Crédito") {
    numberOfInstallments.value = 1;
    selectedCard.value = "";
  }
});

// --- Functions ---

const formatCurrencyInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  let value = input.value.replace(/\D/g, "");

  value = value.replace(/^0+/, "");

  if (value === "") {
    formattedValue.value = "";
    rawTotalValue.value = 0;
    return;
  }

  const numberValue = parseInt(value) / 100;
  rawTotalValue.value = numberValue;

  formattedValue.value = numberValue.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatCurrency = (value: number) => {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const handleCurrencyBlur = () => {
  if (rawTotalValue.value === 0) {
    formattedValue.value = "";
  } else {
    formattedValue.value = formatCurrency(rawTotalValue.value);
  }
};

const handleCurrencyClear = () => {
  rawTotalValue.value = 0;
  formattedValue.value = "";
};

const showFeedback = (color: string, message: string) => {
  snackbarColor.value = color;
  snackbarMessage.value = message;
  showSnackbar.value = true;
};

const fetchCategories = async () => {
  categoriesLoading.value = true;
  try {
    const response = await $api.get("/categories");
    categories.value = response.data;
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    showFeedback(
      "error",
      "Erro ao carregar categorias. Tente recarregar a página."
    );
  } finally {
    categoriesLoading.value = false;
  }
};

const resetForm = () => {
  rawTotalValue.value = 0;
  formattedValue.value = "";
  selectedPaymentMethod.value = "";
  numberOfInstallments.value = 1;
  selectedCategory.value = null;
  selectedExpenseDate.value = new Date().toISOString().split("T")[0];
  selectedCard.value = "";
  if (expenseForm.value) {
    (expenseForm.value as any).resetValidation();
  }
};

async function submitExpense() {
  const { valid } = await (expenseForm.value as any).validate();

  if (!valid) {
    showFeedback(
      "error",
      "Por favor, preencha todos os campos obrigatórios corretamente."
    );
    return;
  }

  isSavingExpense.value = true;
  try {
    const total = rawTotalValue.value;
    const installmentsCount = numberOfInstallments.value;
    const initialDate = parseISO(selectedExpenseDate.value);

    const expensesToRegister: CreateExpensePayload[] = [];
    const installmentAmount = total / installmentsCount;

    for (let i = 0; i < installmentsCount; i++) {
      const currentInstallmentDate = addMonths(initialDate, i);
      const formattedDateForBackend = `${format(
        currentInstallmentDate,
        "yyyy-MM-dd"
      )}T00:00:00.000Z`;

      expensesToRegister.push({
        categoryId: selectedCategory.value as string,
        value: installmentAmount,
        paymentMethod: selectedPaymentMethod.value,
        card: selectedCard.value,
        installments: 1, // Each entry represents one installment
        date: formattedDateForBackend,
      });
    }

    await Promise.all(
      expensesToRegister.map((expense) => expensesStore.addExpense(expense))
    );

    resetForm();
    showFeedback("success", "Gasto(s) adicionado(s) com sucesso!");
  } catch (error) {
    console.error("Erro ao adicionar gasto:", error);
    showFeedback("error", "Erro ao adicionar gasto. Tente novamente.");
  } finally {
    isSavingExpense.value = false;
  }
}

// --- Lifecycle Hooks ---
onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
</style>