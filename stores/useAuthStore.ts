import { defineStore } from "pinia";
import { useNuxtApp } from "#app";
import { LoginDto, RegisterDto } from "~/types/auth";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  }),
  
  actions: {
    async login(credentials: LoginDto) {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;

      const MOCK_EMAIL = "teste@teste.com";
      const MOCK_PASSWORD = "12345678";

      try {
        const response = await $api.post<{ token: string }>("/Auth/login", credentials);
        this.token = response.data.token;
        this.isAuthenticated = true;
        
        if (typeof window !== "undefined") {
          localStorage.setItem("authToken", this.token as string);
        }
        
        await navigateTo("/dashboard"); 
        
        return true;
      } catch (err: any) {
        // Se a chamada de API falhar (erro de rede ou status diferente de 2xx),
        // tentamos o login mocado.
        if (credentials.email === MOCK_EMAIL && credentials.password === MOCK_PASSWORD) {
          this.token = "mock_token_123";
          this.isAuthenticated = true;
          this.error = null;

          if (typeof window !== "undefined") {
            localStorage.setItem("authToken", this.token as string);
          }
          await navigateTo("/dashboard");
          return true;
        } else {
          this.error = "E-mail ou senha inválidos. (API offline, verifique as credenciais de teste)";
          console.error("Login failed:", err);
          return false;
        }
      } finally {
        this.loading = false;
      }
    },

    async register(registerData: RegisterDto) {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;
      try {
        await $api.post("/Auth/register", registerData);
        await navigateTo("/login"); 
        return true;
      } catch (err: any) {
        this.error = err.response?.data?.message || "Falha ao registrar usuário.";
        console.error("Registration failed:", err);
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    logout() {
      this.token = null;
      this.isAuthenticated = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
      }
      navigateTo("/login");
    },
    
    initialize() {
      if (typeof window !== "undefined") {
        const storedToken = localStorage.getItem("authToken");
        if (storedToken) {
          this.token = storedToken;
          this.isAuthenticated = true;
        }
      }
    },
  },
});
