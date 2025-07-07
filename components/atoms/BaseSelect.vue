<template>
  <v-select
    v-bind="$attrs"
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
defineProps(['modelValue'])
defineEmits(['update:modelValue'])
</script>