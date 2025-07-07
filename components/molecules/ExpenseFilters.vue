<template>
  <v-row class="mb-6">
    <v-col cols="12" md="4">
      <DatePickerField
        v-model="startDateLocal"
        label="Data Início"
      />
    </v-col>

    <v-col cols="12" md="4">
      <DatePickerField
        v-model="endDateLocal"
        label="Data Fim"
      />
    </v-col>

    <v-col cols="12" md="4">
      <v-select
        :model-value="selectedCategory"
        @update:model-value="onCategoryChange"
        :items="['All', ...categories]"
        label="Categoria"
        outlined
        dense
        clearable
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import DatePickerField from '~/components/atoms/DatePickerField.vue'

const props = defineProps<{
  startDate: string | null
  endDate: string | null
  selectedCategory: string | null
  categories: string[]
}>()

const emit = defineEmits([
  'update:startDate',
  'update:endDate',
  'update:selectedCategory',
])

// Variáveis locais reativas para permitir v-model
const startDateLocal = ref(props.startDate)
const endDateLocal = ref(props.endDate)

// Atualiza o prop quando ele mudar externamente
watch(() => props.startDate, (val) => startDateLocal.value = val)
watch(() => props.endDate, (val) => endDateLocal.value = val)

// Emite as mudanças para o componente pai
watch(startDateLocal, (val) => emit('update:startDate', val))
watch(endDateLocal, (val) => emit('update:endDate', val))

const onCategoryChange = (val: string | null) => {
  emit('update:selectedCategory', val === 'All' ? null : val)
}
</script>
