// plugins/axios.ts
import axios from "axios";
import { defineNuxtPlugin, useRuntimeConfig } from "#app";
// NÃO precisamos importar o useAuthStore aqui

export default defineNuxtPlugin(() => {
 const config = useRuntimeConfig();
 const api = axios.create({
  baseURL: config.public.apiBase,
  headers: { "Content-Type": "application/json" },
 });

 api.interceptors.request.use(
  (config) => {
   // CORREÇÃO: Ler o token diretamente do localStorage.
   // Isso é mais robusto do que depender do estado do Pinia,
   // que pode não ter sido inicializado ainda.
   if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken");
    if (token) {
     config.headers.Authorization = `Bearer ${token}`;
    }
   }
   return config;
  },
  (error) => {
   return Promise.reject(error);
  }
 );

 // Adicionar um interceptor de resposta para lidar com 401 globalmente
 api.interceptors.response.use(
  (response) => response, // Sucesso, apenas repasse
  (error) => {
   if (error.response && error.response.status === 401) {
    console.error("API Error: 401 Unauthorized. Token pode estar expirado.");
    // Importar a store aqui dentro para evitar dependência circular
    const authStore = useAuthStore();
    authStore.logout(); // Força o logout e redireciona para /login
   }
   return Promise.reject(error);
  }
 );

 return { provide: { api } };
});