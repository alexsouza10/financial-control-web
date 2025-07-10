<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
    max-width="500"
  >
    <v-card class="pa-6 elevation-3 rounded-xl" :class="cardClasses" variant="flat">
      <v-card-title class="text-h6 font-weight-bold pb-2">{{ title }}</v-card-title>

      <v-card-text class="pb-0">
        <v-form ref="form" @submit.prevent="save">
          <v-select
            v-model="editedExpense.category"
            :items="categories"
            label="Categoria"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            class="mb-4"
            required
          />
          <v-select
            v-model="editedExpense.paymentMethod"
            :items="paymentMethods"
            label="Método de Pagamento"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            class="mb-4"
            required
          />
          <v-select
            v-model="editedExpense.card"
            :items="cardOptions"
            label="Cartão"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            class="mb-4"
          />
          <v-text-field
            v-model.number="editedExpense.installments"
            label="Parcelas"
            type="number"
            min="1"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            class="mb-4"
          />
          <v-text-field
            v-model.number="editedExpense.value"
            label="Valor"
            type="number"
            suffix="R$"
            variant="outlined"
            density="comfortable"
            :rules="[valueRules.required, valueRules.minZero]"
            hide-details="auto"
            class="mb-4"
          />
          <DatePickerField
            v-model="editedExpense.date"
            label="Data do Gasto"
            class="mb-2"
            :rules="[valueRules.required]"
          />
        </v-form>
      </v-card-text>

      <v-card-actions class="pt-4">
        <v-spacer />
        <v-btn variant="text" color="secondary" @click="cancel">Cancelar</v-btn>
        <v-btn variant="flat" :color="confirmColor" @click="save">Salvar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useTheme } from "vuetify";
import { parseISO, format } from "date-fns";
import DatePickerField from "~/components/atoms/DatePickerField.vue";
import type { Expense } from "~/types/expense";
import type { VForm } from "vuetify/components";

interface Props {
  modelValue: boolean;
  expense: Expense | null;
  title?: string;
  confirmColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "Editar Gasto",
  confirmColor: "primary",
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "update:expense", value: Expense): void;
}>();

const form = ref<VForm | null>(null);
const editedExpense = ref<Expense>({} as Expense);

const categories = ["Alimentação", "Transporte", "Saúde", "Lazer", "Contas", "Outros"];
const paymentMethods = ["Cartão de Crédito", "Débito", "Dinheiro", "Pix"];
const cardOptions = ["Nubank", "Inter", "Neon", "PicPay", "Outro"];

const valueRules = {
  required: (v: any) => (v !== null && v !== undefined && String(v).trim() !== "") || "Campo obrigatório.",
  minZero: (v: number) => v >= 0 || "O valor não pode ser negativo.",
};

const theme = useTheme();

const cardClasses = computed(() => (theme.global.current.value.dark ? "bg-surface-variant" : "bg-surface"));

function loadExpenseForEditing(expense: Expense | null) {
  if (expense) {
    editedExpense.value = { ...expense };

    try {
      const date = parseISO(editedExpense.value.date);
      if (!isNaN(date.getTime())) {
        editedExpense.value.date = format(date, "yyyy-MM-dd");
      }
    } catch {
      editedExpense.value.date = "";
    }
  } else {
    editedExpense.value = {} as Expense;
  }

  form.value?.resetValidation();
}

watch(() => props.modelValue, (val) => val && loadExpenseForEditing(props.expense));
watch(() => props.expense, (val) => !props.modelValue && loadExpenseForEditing(val));

function cancel() {
  emit("update:modelValue", false);
}

function save() {
  if (!form.value) return;

  form.value.validate().then((valid) => {
    if (!valid || !editedExpense.value) return;

    try {
      const localDate = new Date(editedExpense.value.date + "T00:00:00");
      const utcDate = new Date(Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate()));
      editedExpense.value.date = utcDate.toISOString();
    } catch {
      editedExpense.value.date = "";
    }

    emit("update:expense", editedExpense.value);
    emit("update:modelValue", false);
  });
}
</script>
