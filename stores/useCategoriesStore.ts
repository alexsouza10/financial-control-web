// ~/stores/categories.ts
import { defineStore } from "pinia";
import { useNuxtApp } from "#app";

// --- Interfaces ---
interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CategoryPayload {
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

  getters: {
    getCategoryById: (state) => {
      return (id: string) => state.categories.find(cat => cat.id === id);
    },

    getCategoryByName: (state) => {
      return (name: string) => state.categories.find(cat => cat.name.toUpperCase() === name.toUpperCase());
    },
  },

  actions: {
    async _performApiCall<T>(apiCall: () => Promise<T>): Promise<T> {
      this.loading = true;
      this.error = null;
      try {
        return await apiCall();
      } catch (err: any) {
        const errorMessage = "Ocorreu um erro: " + (err.response?.data?.title || err.message);
        this.error = errorMessage;
        console.error(errorMessage, err);
        throw err; 
      } finally {
        this.loading = false;
      }
    },

    async fetchAllCategories() {
      const { $api } = useNuxtApp();
      const response = await this._performApiCall(() => $api.get<Category[]>("/categories"));
      
      this.categories = response.data.map(cat => ({
        ...cat,
        name: cat.name.toUpperCase(),
      }));
    },

    async createCategory(categoryPayload: CategoryPayload) {
      const { $api } = useNuxtApp();
      const payloadWithUpperCase = {
        ...categoryPayload,
        name: categoryPayload.name.toUpperCase(),
      };

      const response = await this._performApiCall(() => 
        $api.post<Category>("/categories", payloadWithUpperCase)
      );

      const newCategory = { ...response.data, name: response.data.name.toUpperCase() };
      this.categories.push(newCategory);
      return newCategory;
    },
    async updateCategory(id: string, categoryPayload: CategoryPayload) {
      const { $api } = useNuxtApp();
      const payloadWithUpperCase = {
        ...categoryPayload,
        name: categoryPayload.name.toUpperCase(),
      };

      await this._performApiCall(() => 
        $api.put<Category>(`/categories/${id}`, payloadWithUpperCase)
      );
      
      const index = this.categories.findIndex(cat => cat.id === id);
      if (index !== -1) {
        this.categories[index] = { ...this.categories[index], ...payloadWithUpperCase };
      }
    },

    async deleteCategory(id: string) {
      const { $api } = useNuxtApp();
      await this._performApiCall(() => $api.delete(`/categories/${id}`));
      this.categories = this.categories.filter(cat => cat.id !== id);
    },
  },
});