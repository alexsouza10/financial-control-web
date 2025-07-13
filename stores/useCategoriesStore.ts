// ~/stores/categories.ts
import { defineStore } from "pinia";
import { useNuxtApp } from "#app";

interface Category {
  id: string; // Assumindo que sua categoria tem um ID
  name: string;
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
        const response = await $api.get<Category[]>("/Categories");
        this.categories = response.data;
      } catch (err: any) {
        this.error =
          "Failed to fetch categories: " + (err.response?.data || err.message);
        console.error(this.error, err);
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