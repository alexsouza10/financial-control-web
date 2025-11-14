import { defineStore } from "pinia";
import { useNuxtApp } from "#app";

// Interface alinhada com o UserProfileDto do backend
interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  canLinkAccounts: boolean;
}

interface AdminState {
  users: AdminUser[];
  loading: boolean;
  error: string | null;
}

export const useAdminStore = defineStore("admin", {
  state: (): AdminState => ({
    users: [],
    loading: false,
    error: null,
  }),

  actions: {
    // AÇÃO 1: BUSCAR TODOS OS USUÁRIOS
    async fetchAllUsers() {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        const response = await $api.get<AdminUser[]>("/admin/users");
        this.users = response.data;
      } catch (err: any) {
        this.error = err.response?.data?.message || "Falha ao buscar usuários.";
      } finally {
        this.loading = false;
      }
    },

    async setUserActiveStatus(userId: number, isActive: boolean) {
      const { $api } = useNuxtApp();
      this.error = null;

      try {
        if (isActive) {
          await $api.post(`/admin/users/${userId}/activate`);
        } else {
          await $api.post(`/admin/users/${userId}/deactivate`);
        }

        const user = this.users.find((u) => u.id === userId);
        if (user) user.isActive = isActive;
      } catch (err: any) {
        this.error =
          err.response?.data?.message || "Falha ao atualizar status.";
      }
    },
    // AÇÃO 3: ATIVAR/DESATIVAR VÍNCULO
    async setUserLinkingStatus(userId: number, canLink: boolean) {
      const { $api } = useNuxtApp();
      this.error = null;
      try {
        // Chama o novo endpoint do AdminController
        await $api.put(`/admin/users/${userId}/linking`, { canLink });

        // Atualiza o estado local
        const user = this.users.find((u) => u.id === userId);
        if (user) {
          user.canLinkAccounts = canLink;
        }
      } catch (err: any) {
        this.error =
          err.response?.data?.message || "Falha ao atualizar permissão.";
      }
    },

    // AÇÃO 4: DELETAR USUÁRIO
    async deleteUser(userId: number) {
      const { $api } = useNuxtApp();
      this.error = null;
      try {
        // Chama o novo endpoint do AdminController
        await $api.delete(`/admin/users/${userId}`);

        // Remove do estado local
        this.users = this.users.filter((u) => u.id !== userId);
      } catch (err: any) {
        this.error = err.response?.data?.message || "Falha ao deletar usuário.";
      }
    },
  },
});
