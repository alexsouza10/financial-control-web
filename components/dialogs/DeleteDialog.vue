<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="450"
    persistent
  >
    <v-card rounded="lg">
      <v-card-title class="text-h6 text-center text-red-darken-2 py-4">
        <v-icon left class="mr-2">mdi-alert-circle</v-icon>
        Confirmar Exclusão
      </v-card-title>
      <v-card-text class="text-center text-body-1 text-grey-darken-2 pb-6">
        Tem certeza de que deseja excluir
        <span v-if="itemType" class="font-weight-bold">{{ itemType }}</span>
        "<span class="font-weight-bold">{{ itemName }}</span>"?
        Esta ação não pode ser desfeita.
      </v-card-text>
      <v-card-actions class="justify-center pb-4">
        <v-btn color="grey-darken-1" variant="flat" @click="cancel" class="text-capitalize" rounded>
          Cancelar
        </v-btn>
        <v-btn
          color="red-darken-2"
          variant="flat"
          @click="confirmDelete"
          :loading="loading"
          class="text-capitalize"
          rounded
        >
          Excluir
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  itemName: string; // O nome do item a ser excluído (ex: nome da categoria)
  itemType?: string; // O tipo do item (ex: "o gasto", "a categoria")
  loading?: boolean; // Para controlar o estado de carregamento do botão
}>();

const emit = defineEmits(["update:modelValue", "confirm"]);

function cancel() {
  emit("update:modelValue", false);
}

function confirmDelete() {
  emit("confirm");
  // Não feche o modal aqui se `loading` for true, deixe o pai controlar o fechamento
  // após a conclusão da operação de exclusão (sucesso ou falha).
  // Se não houver loading, pode fechar.
  // **Importante: remova esta linha se o pai SEMPRE for gerenciar o fechamento após o "confirm"**
  // Se o pai sempre chamar o `update:modelValue` após `confirm`, esta linha pode ser removida.
  // No seu `pages/category.vue`, o pai gerencia, então podemos remover esta `if` aqui.
  // if (!props.loading) {
  //   emit("update:modelValue", false);
  // }
}
</script>

<style scoped>
/* Adicione estilos específicos se desejar para o diálogo de confirmação */
</style>