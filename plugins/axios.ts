import axios from "axios";
import { defineNuxtPlugin, useRuntimeConfig } from "#app";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const api = axios.create({
    baseURL: config.public.apiBase, 
    headers: { "Content-Type": "application/json" },
  });

   api.interceptors.request.use(
    (config) => {
      const authStore = useAuthStore();
      if (authStore.token) {
        config.headers.Authorization = `Bearer ${authStore.token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return { provide: { api } };
});
