<template>
  <v-container class="py-8">
    <v-row class="mb-6">
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold text-grey-darken-3">
          Gerenciamento de Categorias
        </h1>
      </v-col>
    </v-row>

    <v-row align="center" class="mb-6">
      <v-col cols="12" md="6">
        <h2 class="text-h5 font-weight-medium text-grey-darken-2">
          Minhas Categorias
        </h2>
      </v-col>
      <v-col cols="12" md="6" class="text-md-right">
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openAddModal"
          size="large"
          class="text-capitalize"
          rounded="lg"
        >
          Adicionar Nova Categoria
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card flat rounded="lg" class="pa-4 custom-card">
          <v-overlay
            :model-value="loading"
            class="align-center justify-center"
            contained
            persistent
            v-if="loading"
          >
            <v-progress-circular
              color="primary"
              indeterminate
              size="64"
            ></v-progress-circular>
            <p class="mt-4 text-white text-subtitle-1">
              Carregando categorias...
            </p>
          </v-overlay>

          <v-card-text
            v-else-if="categories.length === 0"
            class="text-center py-8"
          >
            <v-icon size="64" color="grey-lighten-1"
              >mdi-folder-open-outline</v-icon
            >
            <p class="text-h6 text-grey-darken-1 mt-4">
              Nenhuma categoria encontrada. Crie a primeira!
            </p>
          </v-card-text>

          <v-list v-else lines="one" class="py-0">
            <template
              v-for="(category, index) in categories"
              :key="category.id"
            >
              <v-list-item
                class="py-3 px-4"
                :class="{ 'hover-bg-grey-lighten-5': !isMobile }"
              >
                <template #prepend>
                  <v-icon color="grey-darken-1">mdi-tag-outline</v-icon>
                </template>
                <v-list-item-title
                  class="text-body-1 font-weight-medium text-grey-darken-3"
                >
                  {{ category.name.toUpperCase() }}
                </v-list-item-title>
                <template #append>
                  <v-btn
                    icon
                    variant="text"
                    color="yellow-darken-2"
                    size="small"
                    @click="openEditModal(category)"
                    aria-label="Editar Categoria"
                    class="mr-2"
                  >
                    <v-icon>mdi-pencil</v-icon>
                    <v-tooltip activator="parent" location="top"
                      >Editar</v-tooltip
                    >
                  </v-btn>
                  <v-btn
                    icon
                    variant="text"
                    color="red-darken-2"
                    size="small"
                    @click="confirmDelete(category.id, category.name)"
                    aria-label="Excluir Categoria"
                  >
                    <v-icon>mdi-delete</v-icon>
                    <v-tooltip activator="parent" location="top"
                      >Excluir</v-tooltip
                    >
                  </v-btn>
                </template>
              </v-list-item>
              <v-divider v-if="index < categories.length - 1"></v-divider>
            </template>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <CategoryDialog
      :isVisible="showFormModal"
      :categoryToEdit="selectedCategory"
      @close="closeFormModal"
      @categorySaved="handleCategorySaved"
    />

    <DeleteDialog
      v-model="showDeleteConfirm"
      :item-name="categoryToDeleteName.toUpperCase()"
      item-type="a categoria"
      :loading="deleting"
      @confirm="deleteCategory"
    />

    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      timeout="3000"
      location="top right"
      rounded="pill"
      class="mt-4"
    >
      <div class="d-flex align-center">
        <v-icon v-if="snackbarColor === 'success'" class="me-2">mdi-check-circle</v-icon>
        <v-icon v-else-if="snackbarColor === 'error'" class="me-2">mdi-alert-circle</v-icon>
        <span>{{ snackbarMessage }}</span>
      </div>
      <template #actions>
        <v-btn
          color="white"
          variant="text"
          @click="showSnackbar = false"
          icon="mdi-close"
          size="small"
        ></v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useDisplay } from "vuetify";
import { useNuxtApp } from "#app";
import CategoryDialog from "~/components/modules/categories/CategoryDialog.vue";
import DeleteDialog from "~/components/dialogs/DeleteDialog.vue";

const display = useDisplay();
const isMobile = computed(() => display.smAndDown.value);
const { $api } = useNuxtApp();

// Data Properties
const categories = ref([]);
const loading = ref(true);
const showFormModal = ref(false);
const selectedCategory = ref(null);

// **Mudança aqui: `showDeleteConfirm` e `deleting` controlam o novo componente**
const showDeleteConfirm = ref(false);
const categoryToDeleteId = ref(null);
const categoryToDeleteName = ref("");
const deleting = ref(false); // Mantido para o estado de loading no diálogo

// Snackbar
const showSnackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("success");

// Methods
const fetchCategories = async () => {
  loading.value = true;
  try {
    const response = await $api.get("/categories");
    if (response.data) {
      categories.value = response.data;
    } else {
      categories.value = [];
    }
    showFeedback("success", "Categorias carregadas com sucesso!");
  } catch (error) {
    console.error(
      "Erro ao buscar categorias:",
      error.response?.data || error.message
    );
    showFeedback("error", "Erro ao carregar categorias. Tente novamente.");
  } finally {
    loading.value = false;
  }
};

const openAddModal = () => {
  selectedCategory.value = null;
  showFormModal.value = true;
};

const openEditModal = (category) => {
  selectedCategory.value = { ...category };
  showFormModal.value = true;
};

const closeFormModal = () => {
  showFormModal.value = false;
  selectedCategory.value = null;
};

const handleCategorySaved = async () => {
  showFeedback(
    "success",
    selectedCategory.value
      ? "Categoria atualizada com sucesso!"
      : "Categoria adicionada com sucesso!"
  );
  await fetchCategories();
};

const confirmDelete = (id, name) => {
  categoryToDeleteId.value = id;
  categoryToDeleteName.value = name;
  showDeleteConfirm.value = true; // Abre o DeleteDialog
};

const deleteCategory = async () => {
  deleting.value = true; // Ativa o loading no botão do DeleteDialog
  try {
    await $api.delete(`/categories/${categoryToDeleteId.value}`);
    showFeedback(
      "success",
      `Categoria "${categoryToDeleteName.value.toUpperCase()}" excluída com sucesso!`
    );
    showDeleteConfirm.value = false; // Fecha o DeleteDialog após sucesso
    categoryToDeleteId.value = null; // Limpa o ID
    categoryToDeleteName.value = ""; // Limpa o nome
    await fetchCategories(); // Recarrega a lista
  } catch (error) {
    console.error(
      "Erro ao excluir categoria:",
      error.response?.data || error.message
    );
    if (error.response && error.response.status === 404) {
      showFeedback("error", "Categoria não encontrada.");
    } else {
      showFeedback("error", "Erro ao excluir categoria. Tente novamente.");
    }
  } finally {
    deleting.value = false; // Desativa o loading, independentemente do sucesso/erro
  }
};

const showFeedback = (color, message) => {
  snackbarColor.value = color;
  snackbarMessage.value = message;
  showSnackbar.value = true;
};

onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
.custom-card {
  min-height: 200px;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.v-list-item.hover-bg-grey-lighten-5:hover {
  background-color: rgba(var(--v-theme-on-surface), var(--v-hover-opacity));
}
</style>