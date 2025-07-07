<template>
  <v-dialog v-model="modelValue" max-width="400" persistent>
    <v-card>
      <v-card-title class="text-h6">Confirmar Exclusão</v-card-title>
      <v-card-text>Tem certeza que deseja excluir este gasto?</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="secondary" variant="outlined" @click="cancel">
          Cancelar
        </v-btn>
        <v-btn color="error" variant="flat" @click="confirmDelete">
          Excluir
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(["update:modelValue", "confirm"]);

function cancel() {
  emit("update:modelValue", false);
}

function confirmDelete() {
  emit("confirm");
  emit("update:modelValue", false);
}
</script>
