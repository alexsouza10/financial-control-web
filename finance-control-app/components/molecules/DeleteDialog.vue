<template>
  <v-dialog v-model="modelValue" max-width="400">
    <v-card>
      <v-card-title class="text-h6">Confirmar Exclusão</v-card-title>
      <v-card-text>Tem certeza que deseja excluir este gasto?</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" @click="$emit('update:modelValue', false)">Cancelar</v-btn>
        <v-btn color="red" @click="$emit('confirm')">Excluir</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
defineProps({ modelValue: Boolean })
defineEmits(['update:modelValue', 'confirm'])
</script>