<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    transition="scale-transition"
    offset-y
    min-width="auto"
  >
    <template v-slot:activator="{ props }">
      <v-text-field
        :model-value="displayDate"
        :label="label"
        prepend-icon="mdi-calendar"
        readonly
        v-bind="props"
        outlined
        dense
      />
    </template>
    <v-date-picker
      v-model="selectedDate"
      @update:model-value="onDateSelected"
      no-title
      scrollable
    />
  </v-menu>
</template>


<script setup lang="ts">
import { computed, ref } from 'vue'
import { format } from 'date-fns'

const props = defineProps<{
  modelValue: string | null
  label: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

const menu = ref(false)

// Computed para data formatada no input
const displayDate = computed(() => {
  if (!props.modelValue) return ''
  try {
    return format(new Date(props.modelValue), 'dd/MM/yyyy')
  } catch {
    return props.modelValue
  }
})

const selectedDate = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const onDateSelected = () => {
  menu.value = false
}
</script>
