import { useAuthStore } from "~/stores/useAuthStore";

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();
  
  const publicRoutes = ['/login', '/register']; 
  
  authStore.initialize(); 

  if (!authStore.isAuthenticated && !publicRoutes.includes(to.path)) {
    return navigateTo('/login');
  }
});