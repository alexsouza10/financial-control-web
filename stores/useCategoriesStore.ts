// ~/stores/categories.ts
import { defineStore } from "pinia";
import { useNuxtApp } from "#app";

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CategoriesState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

export const useCategoriesStore = defineStore("categories", {
  state: (): CategoriesState => ({
    categories: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchAllCategories() {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        const response = await $api.get<Category[]>("/categories");
        // Converte os nomes para maiúsculas ao buscar
        this.categories = response.data.map(cat => ({
          ...cat,
          name: cat.name.toUpperCase()
        }));
      } catch (err: any) {
        this.error =
          "Failed to fetch categories: " + (err.response?.data || err.message);
        console.error(this.error, err);
      } finally {
        this.loading = false;
      }
    },

    async createCategory(categoryPayload: { name: string; icon: string }) {
      console.log('Store: Creating category with payload:', categoryPayload);
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        // Converte o nome para maiúsculas antes de enviar para o backend
        const payloadWithUpperCase = {
          ...categoryPayload,
          name: categoryPayload.name.toUpperCase()
        };
        
        console.log('Store: Sending to API:', payloadWithUpperCase);
        const response = await $api.post<Category>("/categories", payloadWithUpperCase);
        console.log('Store: API response:', response.data);
        
        // Adiciona a nova categoria com nome em maiúsculas
        const newCategory = {
          ...response.data,
          name: response.data.name.toUpperCase()
        };
        
        this.categories.push(newCategory);
        console.log('Store: Category added to state:', newCategory);
        console.log('Store: Total categories now:', this.categories.length);
        return newCategory;
      } catch (err: any) {
        console.error('Store: Error creating category:', err);
        this.error =
          "Failed to create category: " + (err.response?.data || err.message);
        console.error(this.error, err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateCategory(id: string, categoryPayload: { name: string; icon: string }) {
      console.log('Store: Updating category with ID:', id, 'payload:', categoryPayload);
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        // Converte o nome para maiúsculas antes de enviar para o backend
        const payloadWithUpperCase = {
          ...categoryPayload,
          name: categoryPayload.name.toUpperCase()
        };
        
        console.log('Store: Sending update to API:', payloadWithUpperCase);
        await $api.put<Category>(`/categories/${id}`, payloadWithUpperCase);
        console.log('Store: API update successful');
        
        // Atualiza a categoria no estado local
        const index = this.categories.findIndex(cat => cat.id === id);
        if (index !== -1) {
          this.categories[index] = {
            ...this.categories[index],
            name: payloadWithUpperCase.name,
            icon: payloadWithUpperCase.icon
          };
          console.log('Store: Category updated in state:', this.categories[index]);
        } else {
          console.warn('Store: Category not found in state for ID:', id);
        }
        
      } catch (err: any) {
        console.error('Store: Error updating category:', err);
        this.error =
          "Failed to update category: " + (err.response?.data || err.message);
        console.error(this.error, err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteCategory(id: string) {
      console.log('Store: Deleting category with ID:', id);
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        console.log('Store: Sending delete request to API');
        await $api.delete(`/categories/${id}`);
        console.log('Store: API delete successful');
        
        // Remove a categoria do estado local
        const beforeCount = this.categories.length;
        this.categories = this.categories.filter(cat => cat.id !== id);
        const afterCount = this.categories.length;
        
        console.log('Store: Categories before:', beforeCount, 'after:', afterCount);
        
      } catch (err: any) {
        console.error('Store: Error deleting category:', err);
        this.error =
          "Failed to delete category: " + (err.response?.data || err.message);
        console.error(this.error, err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
  getters: {
    // Opcional: se você precisar de categorias formatadas em outros lugares
    formattedCategories: (state) => {
      return state.categories.map(cat => ({
        id: cat.id,
        name: cat.name.toUpperCase(),
      }));
    }
  }
});