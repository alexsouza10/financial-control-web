import { defineStore } from "pinia";
import { useNuxtApp } from "#app";
import { LoginDto, RegisterDto } from "~/types/auth";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
 sub: string;
 email: string;
 role: string;
 exp: number;
}

interface AuthState {
 token: string | null;
 role: string | null;
 isAuthenticated: boolean;
 loading: boolean;
 error: string | null;
}

export const useAuthStore = defineStore("auth", {
 state: (): AuthState => ({
  token: null,
  role: null,
  isAuthenticated: false,
  loading: false,
  error: null,
 }),

 getters: {
  isAdmin: (state): boolean => state.role === 'Admin',
 },
 
 actions: {
  _setAuthState(token: string | null) {
   if (token) {
    try {
     const decoded = jwtDecode<JwtPayload>(token); 
     
     if (decoded.exp * 1000 > Date.now()) {
      this.token = token;
      this.role = decoded.role;
      this.isAuthenticated = true;
      if (typeof window !== "undefined") {
       localStorage.setItem("authToken", token);
      }
     } else {
      this._setAuthState(null);
     }
    } catch (e) {
     this._setAuthState(null);
    }
   } else {
    this.token = null;
    this.role = null;
    this.isAuthenticated = false;
    if (typeof window !== "undefined") {
     localStorage.removeItem("authToken");
    }
   }
  },

  async login(credentials: LoginDto) {
   const { $api } = useNuxtApp();
   this.loading = true;
   this.error = null;
   try {
    const response = await $api.post<{ token: string }>("/Auth/login", credentials);
    this._setAuthState(response.data.token);
    
    await navigateTo("/dashboard");
    return true;
   } catch (err: any) {
    this.error = "E-mail ou senha inválidos, ou conta desativada.";
    this._setAuthState(null);
    console.error("Login failed:", err);
    return false;
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
   this._setAuthState(null);
   navigateTo("/login");
  },
  
  initialize() {
   if (typeof window !== "undefined") {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
     this._setAuthState(storedToken);
    }
   }
  },
 },
});