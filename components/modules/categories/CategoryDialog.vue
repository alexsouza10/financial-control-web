<template>
  <v-dialog
    :model-value="isVisible"
    @update:model-value="closeModal"
    max-width="500px"
    persistent
    scrollable
  >
    <v-card rounded="lg">
      <v-toolbar color="primary" flat rounded="0">
        <v-toolbar-title class="text-h6 text-white">
          {{ isEditing ? 'Editar Categoria' : 'Adicionar Nova Categoria' }}
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon dark @click="closeModal" aria-label="Fechar">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="py-6 px-4">
        <v-form @submit.prevent="saveCategory">
          <v-text-field
            v-model="form.name"
            label="Nome da Categoria"
            variant="outlined"
            density="comfortable"
            :error-messages="errors.name"
            placeholder="Ex: Alimentação, Transporte"
            required
            maxlength="100"
            counter
          ></v-text-field>

          <v-alert
            v-if="apiError"
            type="error"
            density="compact"
            class="mt-4"
            icon="mdi-alert-circle-outline"
            closable
            @click:close="apiError = ''"
          >
            {{ apiError }}
          </v-alert>
        </v-form>
      </v-card-text>

      <v-card-actions class="d-flex justify-end pt-0 pb-4 pr-4">
        <v-btn
          color="grey-darken-1"
          variant="flat"
          @click="closeModal"
          class="mr-3 text-capitalize"
          rounded
        >
          Cancelar
        </v-btn>
        <v-btn
          color="success"
          variant="flat"
          type="submit"
          :loading="saving"
          :disabled="saving"
          class="text-capitalize"
          rounded
          @click="saveCategory"
        >
          {{ saving ? 'Salvando...' : 'Salvar' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useNuxtApp } from '#app';

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  categoryToEdit: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close', 'categorySaved']);

const { $api } = useNuxtApp();

const form = ref({
  id: null,
  name: '',
});

const errors = ref({
  name: '',
});

const saving = ref(false);
const apiError = ref('');

const isEditing = computed(() => !!form.value.id);

// **FUNÇÕES MOVIDAS PARA O TOPO DO SCRIPT PARA GARANTIR INICIALIZAÇÃO**
const resetForm = () => {
  form.value.id = null;
  form.value.name = '';
  errors.value.name = '';
  apiError.value = '';
};

const validateForm = () => {
  errors.value.name = '';
  let isValid = true;
  if (!form.value.name.trim()) {
    errors.value.name = 'O nome da categoria é obrigatório.';
    isValid = false;
  } else if (form.value.name.trim().length > 100) {
    errors.value.name = 'O nome da categoria não pode exceder 100 caracteres.';
    isValid = false;
  }
  return isValid;
};

// Observa a prop 'isVisible' para inicializar o formulário quando o modal abre
watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    if (props.categoryToEdit) {
      form.value.id = props.categoryToEdit.id;
      form.value.name = props.categoryToEdit.name;
    } else {
      resetForm();
    }
    apiError.value = '';
  } else {
    resetForm();
  }
}, { immediate: true });

const saveCategory = async () => {
  apiError.value = '';
  if (!validateForm()) {
    return;
  }

  saving.value = true;
  try {
    const categoryNameUpperCase = form.value.name.trim().toUpperCase();

    if (isEditing.value) {
      await $api.put(`/categories/${form.value.id}`, { name: categoryNameUpperCase });
    } else {
      await $api.post('/categories', { name: categoryNameUpperCase });
    }
    emit('categorySaved');
    closeModal();
  } catch (error) {
    console.error('Erro ao salvar categoria:', error.response?.data || error.message);
    if (error.response && error.response.status === 409) {
      apiError.value = error.response.data.message || 'Uma categoria com este nome já existe.';
    } else if (error.response && error.response.data && error.response.data.errors) {
      if (error.response.data.errors.Name) {
        errors.value.name = error.response.data.errors.Name[0];
      }
      apiError.value = 'Verifique os erros no formulário.';
    } else {
      apiError.value = 'Ocorreu um erro ao salvar a categoria. Tente novamente.';
    }
  } finally {
    saving.value = false;
  }
};

const closeModal = () => {
  emit('close');
};
</script>

<style scoped>
/* Não adicione nada aqui, a menos que seja CSS válido */
</style>