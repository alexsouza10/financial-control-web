import { defineStore } from "pinia";
import { useNuxtApp } from "#app";

export interface Category {
  id: string;
  name: string;
  icon: string; 
  idealPercentage?: number | null; 
}

export interface CategoryPayload {
  name: string;
  icon: string;
  idealPercentage?: number | null; 
}

interface CategoryPercentageUpdateDto {
  id: string;
  idealPercentage?: number | null;
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
      return (id: string) => state.categories.find((cat) => cat.id === id);
    },

    getCategoryByName: (state) => {
      return (name: string) =>
        state.categories.find(
          (cat) => cat.name.toUpperCase() === name.toUpperCase()
        );
    },

    distributionRules(state): Record<string, number> {
      return state.categories.reduce((acc, cat) => {
        acc[cat.name] = cat.idealPercentage || 0;
        return acc;
      }, {} as Record<string, number>);
    },
  },

  actions: {
    async _performApiCall<T>(apiCall: () => Promise<T>): Promise<T> {
      this.loading = true;
      this.error = null;
      try {
        return await apiCall();
      } catch (err: any) {
        const errorMessage =
          "Ocorreu um erro: " + (err.response?.data?.title || err.message);
        this.error = errorMessage;
        console.error(errorMessage, err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchAllCategories() {
      if (this.categories.length > 0 || this.loading) {
        return;
      }

      const { $api } = useNuxtApp();
      const response = await this._performApiCall(() =>
        $api.get<Category[]>("/categories")
      );

      this.categories = response.data.map((cat) => ({
        ...cat,
        name: cat.name.toUpperCase(),
      }));
    },

    async saveDistributionRules(rules: Record<string, number>) {
      this.loading = true;
      this.error = null;

      const payload: CategoryPercentageUpdateDto[] = Object.entries(rules)
        .map(([name, percentage]) => {
          const category = this.getCategoryByName(name); 
          if (category) {
            return {
              id: category.id,
              idealPercentage: percentage,
            };
          }
          return null;
        })
        .filter((p): p is CategoryPercentageUpdateDto => p !== null); 

      if (payload.length === 0) {
        this.loading = false;
        return;
      }

      const { $api } = useNuxtApp();
      try {
        await $api.post("/categories/batch-update-percentages", payload);

        this.categories.forEach((cat) => {
          const updatedRule = rules[cat.name]; 
          if (updatedRule !== undefined) {
            cat.idealPercentage = updatedRule;
          }
        });
      } catch (err: any) {
        let specificMessage = "Falha ao salvar regras."; 

        if (err.response && err.response.data && err.response.data.errors) {
          const validationErrors = err.response.data.errors;
          const errorKeys = Object.keys(validationErrors);
          
          if (errorKeys.length > 0) {
            const messages = validationErrors[errorKeys[0]];
            if (messages && messages.length > 0) {
              specificMessage = messages[0]; 
            }
          }
        } else if (err.response && err.response.data && err.response.data.title) {
          // Pega o 'title' se não houver 'errors'
          specificMessage = err.response.data.title;
        } else if (err.message) {
          specificMessage = err.message;
        }

        this.error = specificMessage; 
        console.error("Erro em saveDistributionRules:", specificMessage, err.response?.data);
        
        throw new Error(specificMessage); 
      } finally {
        this.loading = false;
      }
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

      const newCategory = {
        ...response.data,
        name: response.data.name.toUpperCase(),
      };
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

      const index = this.categories.findIndex((cat) => cat.id === id);
      if (index !== -1) {
        this.categories[index] = {
          ...this.categories[index],
          ...payloadWithUpperCase,
        };
      }
    },

    async deleteCategory(id: string) {
      const { $api } = useNuxtApp();
      await this._performApiCall(() => $api.delete(`/categories/${id}`));
      this.categories = this.categories.filter((cat) => cat.id !== id);
    },
  },
});