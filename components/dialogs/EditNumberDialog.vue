<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
    max-width="500"
  >
    <v-card class="elevation-3 rounded-lg">
      <!-- Cabeçalho -->
      <v-card-title
        class="text-h6 font-weight-bold pa-4 pb-2 d-flex align-center justify-space-between"
        :style="{ background: `rgb(var(--v-theme-primary))`, color: 'white' }"
      >
        {{ title }}
        <v-btn
          icon
          variant="text"
          size="small"
          color="white"
          @click="cancel"
          class="ml-2"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-4 pb-0">
        <v-form ref="form" @submit.prevent="save">
          <v-text-field
            v-if="isSalaryEditMode"
            v-model.number="internalValue"
            :label="label"
            type="number"
            :min="min"
            :suffix="suffix"
            variant="outlined"
            density="comfortable"
            :rules="[valueRules.required, valueRules.minZero]"
            hide-details="auto"
            class="mb-4"
          />

          <template v-else>
            <v-row>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedExpense.categoryId"
                  :items="categoriesStore.categories"
                  item-title="name"
                  item-value="id"
                  label="Categoria"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                  required
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedExpense.paymentMethod"
                  :items="paymentMethods"
                  label="Método de Pagamento"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                  required
                />
              </v-col>
            </v-row>

            <v-expand-transition>
              <div v-if="editedExpense.paymentMethod === 'Cartão de Crédito'">
                <v-row class="mt-4">
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model.number="editedExpense.installments"
                      label="Parcelas"
                      type="number"
                      min="1"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                      :rules="[valueRules.minOneInstallment]"
                    />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="editedExpense.card"
                      :items="cardOptions"
                      label="Cartão"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    />
                  </v-col>
                </v-row>
              </div>
            </v-expand-transition>

            <v-row class="mt-4">
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="editedExpense.value"
                  label="Valor"
                  type="number"
                  suffix="R$"
                  variant="outlined"
                  density="comfortable"
                  :rules="[valueRules.required, valueRules.minZero]"
                  hide-details="auto"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <DatePickerField
                  v-model="editedExpense.date"
                  label="Data do Gasto"
                  :rules="[valueRules.required]"
                  density="comfortable"
                />
              </v-col>
            </v-row>

            <v-text-field
              v-model="editedExpense.description"
              label="Descrição"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              class="mt-4"
            />
          </template>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4 pt-2">
        <v-spacer />
        <v-btn variant="text" color="grey-darken-1" @click="cancel">
          Cancelar
        </v-btn>
        <v-btn
          variant="flat"
          :color="confirmColor"
          @click="save"
          class="font-weight-bold"
        >
          Salvar
        </v-btn>
      </v-card-actions>
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
  </v-dialog>
</template>


<script setup lang="ts">
import { ref, watch, computed, onMounted, PropType } from "vue";
import { useTheme } from "vuetify";
import { parseISO, format, addMonths } from "date-fns";
import DatePickerField from "~/components/ui/DatePickerField.vue";
import { useExpensesStore } from "~/stores/useExpensesStore";
import { useCategoriesStore } from "#imports";
import type { Expense } from "~/types/expense";
import type { VForm } from "vuetify/components";
import { AxiosError } from "axios";

interface Props {
  modelValue: boolean;
  value?: number | null;
  expense?: Expense | null;
  title?: string;
  label?: string;
  min?: number;
  suffix?: string;
  confirmColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "Editar",
  value: null,
  expense: null,
  label: "Valor",
  min: 0,
  suffix: "",
  confirmColor: "primary",
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "update:expense", value: Expense): void;
  (e: "update:value", value: number): void;
}>();

const expensesStore = useExpensesStore();
const categoriesStore = useCategoriesStore();

const form = ref<VForm | null>(null);
const editedExpense = ref<Expense>({
  id: "",
  description: "",
  value: 0,
  date: "",
  paymentMethod: "",
  card: "",
  installments: 1,
  categoryId: "",
} as Expense);
const internalValue = ref<number>(0);
const isSalaryEditMode = computed(
  () =>
    props.value !== undefined && props.value !== null && props.expense === null
);

const paymentMethods = ["Cartão de Crédito", "Débito", "Dinheiro", "Pix"];
const cardOptions = ["Nubank", "Hipercard", "Santander", "Outro"];

const valueRules = {
  required: (v: any) =>
    (v !== null && v !== undefined && String(v).trim() !== "") ||
    "Campo obrigatório.",
  minZero: (v: number) => v >= 0 || "O valor não pode ser negativo.",
  minOneInstallment: (v: number) => v >= 1 || "Deve ter ao menos 1 parcela",
};

const theme = useTheme();

const snackbar = ref({
  show: false,
  message: "",
  color: "",
  timeout: 3000,
});

function loadDataForEditing() {
  if (isSalaryEditMode.value) {
    internalValue.value = props.value !== null ? props.value : 0;
  } else if (props.expense) {
    editedExpense.value = { ...props.expense };
    if (!editedExpense.value.categoryId && editedExpense.value.category) {
      const foundCategory = categoriesStore.categories.find(
        (c) => c.name === editedExpense.value.category
      );
      if (foundCategory) {
        editedExpense.value.categoryId = foundCategory.id;
      } else {
        editedExpense.value.categoryId = "";
      }
    }
    try {
      const date = parseISO(editedExpense.value.date);
      if (!isNaN(date.getTime())) {
        editedExpense.value.date = format(date, "yyyy-MM-dd");
      }
    } catch {
      editedExpense.value.date = "";
    }
  } else {
    editedExpense.value = {
      id: "",
      description: "",
      value: 0,
      date: "",
      paymentMethod: "",
      card: "",
      installments: 1,
      categoryId: "",
      category: "",
    };
    internalValue.value = 0;
  }
  form.value?.resetValidation();
}

watch(
  () => props.modelValue,
  (val) => val && loadDataForEditing()
);
watch(
  () => props.expense,
  (val) => !props.modelValue && loadDataForEditing()
);
watch(
  () => props.value,
  (val) => !props.modelValue && loadDataForEditing()
);

watch(
  () => editedExpense.value.paymentMethod,
  (newMethod) => {
    if (newMethod !== "Cartão de Crédito") {
      editedExpense.value.installments = 1;
      editedExpense.value.card = "";
      form.value?.resetValidation();
    }
  }
);

function cancel() {
  emit("update:modelValue", false);
}

async function save() {
  if (!form.value) return;

  const { valid } = await form.value.validate();

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
    if (isSalaryEditMode.value) {
      emit("update:value", internalValue.value);
    } else if (editedExpense.value) {
      const originalExpenseId = props.expense?.id;
      const totalValue = editedExpense.value.value;
      const installmentsCount = editedExpense.value.installments;
      const initialDate = parseISO(editedExpense.value.date);

      if (installmentsCount > 1) {
        const expensesToRegister: Expense[] = [];
        const installmentValue = totalValue / installmentsCount;

        for (let i = 0; i < installmentsCount; i++) {
          const currentInstallmentDate = addMonths(initialDate, i);
          const formattedDate = format(currentInstallmentDate, "yyyy-MM-dd");

          expensesToRegister.push({
            ...editedExpense.value,
            id: undefined,
            value: installmentValue,
            installments: 1,
            date: `${formattedDate}T00:00:00.000Z`,
            categoryId: editedExpense.value.categoryId,
          });
        }

        if (originalExpenseId) {
          await expensesStore.deleteExpense(originalExpenseId);
        }

        await Promise.all(
          expensesToRegister.map((expense) => expensesStore.addExpense(expense))
        );

        snackbar.value = {
          show: true,
          message: "Gastos parcelados atualizados com sucesso!",
          color: "success",
          timeout: 3000,
        };
      } else {
        try {
          const localDate = new Date(editedExpense.value.date + "T00:00:00");
          const utcDate = new Date(
            Date.UTC(
              localDate.getFullYear(),
              localDate.getMonth(),
              localDate.getDate()
            )
          );
          editedExpense.value.date = utcDate.toISOString();
        } catch {
          editedExpense.value.date = "";
        }

        if (originalExpenseId) {
          await expensesStore.updateExpense(originalExpenseId, {
            categoryId: editedExpense.value.categoryId,
            paymentMethod: editedExpense.value.paymentMethod,
            card: editedExpense.value.card,
            installments: editedExpense.value.installments,
            value: editedExpense.value.value,
            date: editedExpense.value.date,
            description: editedExpense.value.description,
          });
          snackbar.value = {
            show: true,
            message: "Gasto atualizado com sucesso!",
            color: "success",
            timeout: 3000,
          };
        } else {
          await expensesStore.addExpense(editedExpense.value);
          snackbar.value = {
            show: true,
            message: "Gasto adicionado com sucesso!",
            color: "success",
            timeout: 3000,
          };
        }
      }
    }
    emit("update:modelValue", false);
    await expensesStore.fetchExpenses();
  } catch (error: unknown) {
    let errorMessage = "Erro ao salvar despesa. Verifique o console.";
    if (error instanceof AxiosError) {
      console.error(
        "Erro Axios ao salvar despesa:",
        error.response?.data || error.message
      );
      if (error.response?.data?.message) {
        errorMessage = `Erro: ${error.response.data.message}`;
      } else if (error.response?.status) {
        errorMessage = `Erro ${error.response.status}: ${error.message}`;
      }
    } else {
      console.error("Erro inesperado ao salvar despesa:", error);
    }

    snackbar.value = {
      show: true,
      message: errorMessage,
      color: "error",
      timeout: 5000,
    };
  }
}

onMounted(() => {
  if (categoriesStore.categories.length === 0) {
    categoriesStore.fetchAllCategories();
  }
});
</script>

<style scoped></style>
