<template>
  <v-card class="mb-6 elevation-3">
    <v-card-title class="text-h6 d-flex align-center">
      <v-icon left class="mr-2">mdi-plus-circle</v-icon>
      Registrar Novo Gasto
    </v-card-title>

    <v-card-text>
      <v-form @submit.prevent="addExpense">
        <v-row>
          <v-col cols="12" md="6">
            <v-select
              v-model="selectedCategory"
              :items="categoryItems"
              item-title="name"
              item-value="id"
              label="Categoria"
              variant="outlined"
              density="compact"
              :rules="[(v) => !!v || 'Escolha uma categoria']"
              required
              :loading="categoriesLoading"
              :disabled="categoriesLoading"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="formattedValue"
              @input="formatInput"
              @blur="handleBlur"
              @click:clear="handleClear"
              label="Valor Total (R$)"
              variant="outlined"
              clearable
              density="compact"
              :rules="[(v) => {
                if (!v) return 'Campo obrigatório';
                const num = parseFloat(v?.replace(/\./g, '').replace(',', '.') || '0');
                return num > 0 || 'Valor deve ser positivo';
              }]"
              required
            />
          </v-col>

          <v-col cols="12" md="6">
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

          <v-col cols="12" md="6">
            <DatePickerField
              v-model="editedExpenseDate"
              label="Data"
              density="compact"
              :rules="[(v) => !!v || 'Data obrigatória']"
              required
            />
          </v-col>

          <v-col cols="12" md="6" v-if="paymentMethod === 'Cartão de Crédito'">
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

          <v-col cols="12" md="6" v-if="paymentMethod === 'Cartão de Crédito'">
            <v-select
              v-model="selectedCard"
              :items="cards"
              label="Cartão"
              variant="outlined"
              density="compact"
              :rules="[(v) => !!v || 'Escolha um cartão']"
              required
            />
          </v-col>

          <v-col cols="12" :md="paymentMethod === 'Cartão de Crédito' ? 6 : 12">
            <v-text-field
              label="Valor de Cada Parcela (R$)"
              :model-value="formatCurrency(installmentValue)"
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
              :loading="savingExpense"
            >
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
import { ref, computed, onMounted, watch } from "vue";
import DatePickerField from "~/components/atoms/DatePickerField.vue";
import { useExpensesStore } from "~/stores/useExpensesStore";
import { useNuxtApp } from "#app";
import { addMonths, parseISO, format } from "date-fns";
import type { CreateExpensePayload } from "~/types/expense";

const expensesStore = useExpensesStore();
const { $api } = useNuxtApp();

const totalValue = ref(0);
const formattedValue = ref('');

const formatInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  let value = input.value.replace(/\D/g, '');
  
  // Remove leading zeros
  value = value.replace(/^0+/, '');
  
  if (value === '') {
    formattedValue.value = '';
    totalValue.value = 0;
    return;
  }
  
  // Convert to number and format with 2 decimal places
  const numberValue = parseInt(value) / 100;
  totalValue.value = numberValue;
  
  // Format with thousands separator and 2 decimal places
  formattedValue.value = numberValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const handleBlur = () => {
  if (totalValue.value === 0) {
    formattedValue.value = '';
  } else {
    formattedValue.value = formatCurrency(totalValue.value);
  }
};

const handleClear = () => {
  totalValue.value = 0;
  formattedValue.value = '';
};
const paymentMethod = ref("");
const installments = ref(1);
const selectedCategory = ref(null);
const editedExpenseDate = ref(new Date().toISOString().split("T")[0]);
const selectedCard = ref("");

const paymentMethods = [
  "Cartão de Crédito",
  "Débito",
  "Dinheiro",
  "Pix",
  "Boleto",
];

const cards = ["Nubank", "Hipercard", "Santander", "Outro"];

const categories = ref([]);
const categoriesLoading = ref(false);
const savingExpense = ref(false);

const categoryItems = computed(() => {
  return categories.value.map((cat) => ({
    id: cat.id,
    name: cat.name.toUpperCase(),
  }));
});

const installmentValue = computed(() =>
  installments.value > 0 ? totalValue.value / installments.value : 0
);

watch(paymentMethod, (newMethod) => {
  if (newMethod !== "Cartão de Crédito") {
    installments.value = 1;
    selectedCard.value = "";
  }
});

const fetchCategories = async () => {
  categoriesLoading.value = true;
  try {
    const response = await $api.get("/categories");
    categories.value = response.data;
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
  } finally {
    categoriesLoading.value = false;
  }
};

async function addExpense() {
  if (
    !paymentMethod.value ||
    totalValue.value <= 0 ||
    installments.value < 1 ||
    !selectedCategory.value ||
    !editedExpenseDate.value ||
    (paymentMethod.value === "Cartão de Crédito" && !selectedCard.value)
  ) {
    alert("Por favor, preencha todos os campos corretamente!");
    return;
  }

  savingExpense.value = true;
  try {
    const total = totalValue.value;
    const installmentsCount = installments.value;
    const initialDate = parseISO(editedExpenseDate.value);

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
        paymentMethod: paymentMethod.value,
        card: selectedCard.value,
        installments: 1, 
        date: formattedDateForBackend,
      });
    }

    console.log("Despesas a serem registradas:", expensesToRegister);

    await Promise.all(
      expensesToRegister.map((expense) => expensesStore.addExpense(expense))
    );

    totalValue.value = 0;
    paymentMethod.value = "";
    installments.value = 1;
    selectedCategory.value = null;
    editedExpenseDate.value = new Date().toISOString().split("T")[0];
    selectedCard.value = "";

    alert("Gasto(s) adicionado(s) com sucesso!");
  } catch (error) {
    console.error("Erro ao adicionar gasto:", error);
    alert("Erro ao adicionar gasto. Verifique o console.");
  } finally {
    savingExpense.value = false;
  }
}

onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
/* Estilos existentes aqui */
</style>
