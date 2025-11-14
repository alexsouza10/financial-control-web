import { defineStore } from 'pinia';
import { useNuxtApp } from '#app';

interface UserProfile {
  id: number;
  username: string;
  email: string;
}

interface UpdateProfilePayload {
  username: string;
}

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

export const useProfileStore = defineStore('profile', {
  state: (): ProfileState => ({
    profile: null,
    loading: false,
    error: null,
    successMessage: null,
  }),

  actions: {
    clearMessages() {
      this.error = null;
      this.successMessage = null;
    },

    async fetchProfile() {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.clearMessages();
      try {
        const response = await $api.get<UserProfile>('/profile');
        this.profile = response.data;
      } catch (err: any) {
        this.error = 'Falha ao carregar o perfil.';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async updateProfile(payload: UpdateProfilePayload) {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.clearMessages();
      try {
        await $api.put('/profile', payload);
        if (this.profile) {
          this.profile.username = payload.username;
        }
        this.successMessage = 'Perfil atualizado com sucesso!';
      } catch (err: any) {
        this.error = 'Falha ao atualizar o perfil.';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async changePassword(payload: ChangePasswordPayload) {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.clearMessages();
      try {
        const response = await $api.post('/profile/change-password', payload);
        this.successMessage = response.data.message || 'Senha alterada com sucesso!';
      } catch (err: any) {
        this.error = err.response?.data?.message || 'Falha ao alterar a senha.';
        console.error(err);
        throw err; 
      } finally {
        this.loading = false;
      }
    },
  },
});