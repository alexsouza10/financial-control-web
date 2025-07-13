<template>
  <v-text-field
    :model-value="formattedDate"
    :label="label"
    type="date"
    variant="outlined"
    density="comfortable"
    readonly
    @click="menu = true"
    v-bind="$attrs"
  >
    <template #append-inner>
      <v-icon @click="menu = true">mdi-calendar</v-icon>
    </template>
  </v-text-field>

  <v-menu v-model="menu" :close-on-content-click="false" location="bottom">
    <template #activator="{ props: menuProps }">
      <v-text-field
        v-bind="{ ...$attrs, ...menuProps }"
        :model-value="formattedDate"
        :label="label"
        type="date"
        variant="outlined"
        density="comfortable"
        readonly
        @click="menu = true"
        class="d-none"
      ></v-text-field>
    </template>
    <v-date-picker v-model="internalDate" @update:model-value="selectDate" />
  </v-menu>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { format, parseISO } from "date-fns";

const props = defineProps<{
  modelValue: string;
  label?: string;
}>();

const emit = defineEmits(["update:modelValue"]);

const menu = ref(false);
const internalDate = ref<Date | null>(null);

const formattedDate = computed(() => {
  if (props.modelValue) {
    try {
      return format(parseISO(props.modelValue), "yyyy-MM-dd");
    } catch (e) {
      console.error(
        "Erro ao formatar data para DatePickerField:",
        props.modelValue,
        e
      );
      return "";
    }
  }
  return "";
});

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      try {
        internalDate.value = parseISO(newVal);
      } catch (e) {
        console.error(
          "Erro ao parsear modelValue para DatePickerField:",
          newVal,
          e
        );
        internalDate.value = null;
      }
    } else {
      internalDate.value = null;
    }
  },
  { immediate: true }
);

function selectDate(date: Date) {
  emit("update:modelValue", format(date, "yyyy-MM-dd"));
  menu.value = false; 
}
</script>
