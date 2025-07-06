<template>
  <v-snackbar v-model="modelValue" :color="color" :timeout="timeout">
    {{ text }}
    <template v-slot:actions>
      <v-btn color="white" variant="text" @click="$emit('update:modelValue', false)">Fechar</v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
defineProps({
  modelValue: Boolean,
  text: String,
  color: String,
  timeout: { type: Number, default: 3000 },
})
defineEmits(['update:modelValue'])
</script>