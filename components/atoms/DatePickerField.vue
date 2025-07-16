<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    transition="scale-transition"
    offset-y
    min-width="auto"
  >
    <template #activator="{ props: menuProps }">
      <v-text-field
        :model-value="formattedDate"
        :label="label"
        prepend-icon="mdi-calendar"
        readonly
        v-bind="{ ...$attrs, ...menuProps }"
        :density="density"
        :rules="rules"
        :required="required"
        variant="outlined"
        @click="menu = true"
      ></v-text-field>
    </template>
    <v-date-picker v-model="internalDate" @update:model-value="selectDate" locale="pt-BR" />
  </v-menu>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { format, parseISO } from "date-fns";

const props = defineProps<{
  modelValue: string; // Espera string no formato 'YYYY-MM-DD'
  label?: string;
  density?: string;
  rules?: any[];
  required?: boolean;
}>();

const emit = defineEmits(["update:modelValue"]);

const menu = ref(false);
const internalDate = ref<Date | null>(null);

// Sincroniza o modelValue externo com a ref interna do date picker
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      try {
        internalDate.value = parseISO(newVal);
      } catch (e) {
        console.error("Erro ao parsear modelValue no DatePickerField:", newVal, e);
        internalDate.value = null;
      }
    } else {
      internalDate.value = null;
    }
  },
  { immediate: true }
);

// Formata a data para exibição no v-text-field (DD/MM/YYYY)
const formattedDate = computed(() => {
  if (internalDate.value) {
    return format(internalDate.value, "dd/MM/yyyy");
  }
  return "";
});

// Quando o date picker interno é atualizado, emite a data formatada para o pai (YYYY-MM-DD)
function selectDate(date: Date) {
  internalDate.value = date; // Atualiza a data interna
  emit("update:modelValue", format(date, "yyyy-MM-dd")); // Emite no formato esperado pelo pai
  menu.value = false; // Fecha o menu após a seleção
}
</script>

<style scoped>
/* Nenhum estilo específico necessário aqui, Vuetify cuida da maioria */
</style>