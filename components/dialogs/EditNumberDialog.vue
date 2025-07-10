<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
    max-width="500px"
  >
    <v-card outlined class="pa-4 text-center elevation-3 mt-6" :class="cardClasses">
      <v-card-title class="text-h6 font-weight-bold">{{ title }}</v-card-title>
      <v-card-text>
        <v-form ref="form" @submit.prevent="save">
          <v-select
            v-model="editedExpense.category"
            :items="categories"
            label="Categoria"
            variant="outlined"
            density="comfortable"
            hide-details
            class="mb-4"
          ></v-select>

          <v-select
            v-model="editedExpense.paymentMethod"
            :items="paymentMethods"
            label="Método de Pagamento"
            variant="outlined"
            density="comfortable"
            hide-details
            class="mb-4"
          ></v-select>

          <v-select
            v-model="editedExpense.card"
            :items="cardOptions"
            label="Cartão"
            variant="outlined"
            density="comfortable"
            hide-details
            class="mb-4"
          ></v-select>

          <v-text-field
            v-model.number="editedExpense.installments"
            label="Parcelas"
            type="number"
            variant="outlined"
            density="comfortable"
            :min="1"
            hide-details
            class="mb-4"
          ></v-text-field>

          <v-text-field
            v-model.number="editedExpense.value"
            label="Valor"
            type="number"
            variant="outlined"
            density="comfortable"
            suffix="R$"
            :rules="[valueRules.required, valueRules.minZero]"
            hide-details="auto"
            class="mb-4"
          ></v-text-field>

          <DatePickerField
            v-model="editedExpense.date"
            label="Data do Gasto"
            class="mb-4"
            :rules="[valueRules.required]"
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="cancel">Cancelar</v-btn>
        <v-btn :color="confirmColor" @click="save">Salvar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useTheme } from "vuetify";
import DatePickerField from "~/components/atoms/DatePickerField.vue";
import type { Expense } from '~/types/expense';
import { format, parseISO, formatISO } from "date-fns";

interface Props {
  modelValue: boolean;
  expense: Expense | null;
  title?: string;
  confirmColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "Editar Gasto",
  expense: null,
  confirmColor: "primary",
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "update:expense", value: Expense): void;
}>();

const editedExpense = ref<Expense | null>(null);
const form = ref<HTMLFormElement | null>(null);

const categories = ['Alimentação', 'Transporte', 'Saúde', 'Lazer', 'Contas', 'Outros'];
const paymentMethods = ['Cartão de Crédito', 'Débito', 'Dinheiro', 'Pix'];
const cardOptions = ['Nubank', 'Inter', 'Neon', 'PicPay', 'Outro'];

const valueRules = {
  required: (v: any) => (v !== null && v !== undefined && String(v).trim() !== '') || 'Campo obrigatório.',
  minZero: (v: number) => v >= 0 || 'O valor não pode ser negativo.',
};

const theme = useTheme();

const cardClasses = computed(() => {
  return theme.global.current.value.dark ? 'bg-surface-variant' : 'bg-surface';
});

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen && props.expense) {
      editedExpense.value = JSON.parse(JSON.stringify(props.expense));
      if (editedExpense.value && editedExpense.value.date) {
        try {
          editedExpense.value.date = format(parseISO(editedExpense.value.date), 'yyyy-MM-dd');
        } catch {
          editedExpense.value.date = '';
        }
      } else {
        editedExpense.value.date = '';
      }
      form.value?.resetValidation();
    }
  },
  { immediate: true }
);

watch(
  () => props.expense,
  (newExpense) => {
    if (!props.modelValue && newExpense) {
      editedExpense.value = JSON.parse(JSON.stringify(newExpense));
      if (editedExpense.value && editedExpense.value.date) {
        try {
          editedExpense.value.date = format(parseISO(editedExpense.value.date), 'yyyy-MM-dd');
        } catch {
          editedExpense.value.date = '';
        }
      } else {
        editedExpense.value.date = '';
      }
    }
  }
);

function cancel() {
  emit("update:modelValue", false);
  editedExpense.value = null;
  form.value?.resetValidation();
}

async function save() {
  const { valid } = await form.value!.validate();

  if (!valid || !editedExpense.value) {
    return;
  }

  if (editedExpense.value.date && typeof editedExpense.value.date === 'string') {
    try {
      const parsedDate = parseISO(editedExpense.value.date);
      editedExpense.value.date = formatISO(parsedDate, { representation: 'complete' });
    } catch {
      editedExpense.value.date = null as any;
    }
  } else {
    editedExpense.value.date = null as any;
  }

  emit("update:expense", editedExpense.value);
  emit("update:modelValue", false);
  editedExpense.value = null;
  form.value?.resetValidation();
}
</script>
