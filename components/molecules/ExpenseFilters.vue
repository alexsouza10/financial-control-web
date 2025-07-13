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
import { ref, watch, computed } from 'vue'
import DatePickerField from '~/components/atoms/DatePickerField.vue'
import { useExpensesStore } from '~/stores/useExpensesStore'; 
const props = defineProps<{
  startDate: string | null
  endDate: string | null
  selectedCategory: string | null
}>()

const emit = defineEmits([
  'update:startDate',
  'update:endDate',
  'update:selectedCategory',
  'apply-filters', 
])

const expensesStore = useExpensesStore(); 
const categories = computed(() => expensesStore.categories); 
const startDateLocal = ref(props.startDate)
const endDateLocal = ref(props.endDate)

watch(() => props.startDate, (val) => startDateLocal.value = val)
watch(() => props.endDate, (val) => endDateLocal.value = val)

watch(startDateLocal, (val) => {
  emit('update:startDate', val);
  emit('apply-filters');
})
watch(endDateLocal, (val) => {
  emit('update:endDate', val);
  emit('apply-filters');
})

const onCategoryChange = (val: string | null) => {
  emit('update:selectedCategory', val === 'All' ? null : val);
  emit('apply-filters');
}
</script>
