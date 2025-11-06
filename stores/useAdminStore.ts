import { defineStore } from 'pinia';
import { useNuxtApp } from '#app';

interface UserProfile {
 id: number;
 username: string;
 email: string;
 role: string;   
 isActive: boolean;
}

interface AdminState {
 users: UserProfile[];
 loading: boolean;
 error: string | null;
}

export const useAdminStore = defineStore('admin', {
 state: (): AdminState => ({
  users: [],
  loading: false,
  error: null,
 }),

 actions: {
  async fetchAllUsers() {
   const { $api } = useNuxtApp();
   this.loading = true;
   this.error = null;
   try {
    const response = await $api.get<UserProfile[]>('/admin/users');
    this.users = response.data;
   } catch (err: any) {
    this.error = 'Falha ao carregar usuários.';
    console.error(err);
   } finally {
    this.loading = false;
   }
  },

  async setUserActiveStatus(userId: number, isActive: boolean) {
   const { $api } = useNuxtApp();
   const action = isActive ? 'activate' : 'deactivate';
   try {
    await $api.post(`/admin/users/${userId}/${action}`);
    const user = this.users.find(u => u.id === userId);
    if (user) { 
     user.isActive = isActive;
    }
   } catch (err: any) {
    this.error = `Falha ao ${action}r usuário.`;
    console.error(err);
   }
  },

  async deleteUser(userId: number) {
   const { $api } = useNuxtApp();
   try {
    await $api.delete(`/admin/users/${userId}`);
    this.users = this.users.filter(u => u.id !== userId);
   } catch (err: any) {
    this.error = 'Falha ao deletar usuário.';
    console.error(err);
   }
  }
 }
});