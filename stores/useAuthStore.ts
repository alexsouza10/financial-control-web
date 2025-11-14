import { defineStore } from "pinia";
import { useNuxtApp } from "#app";
import { LoginDto, RegisterDto } from "~/types/auth";
import { jwtDecode } from "jwt-decode";
import { useExpensesStore } from "./useExpensesStore";

interface HouseholdMember {
  id: number;
  username: string;
  email: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  canLinkAccounts: boolean;
  inviteCode: string;
  householdId: string;
  sharedHouseholdId: string;
  personalHouseholdId: string;
  householdMembers: HouseholdMember[];
}

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  householdId: string;
  exp: number;
}

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    token: null,
    user: null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user && !!state.token,
    isAdmin: (state): boolean => state.user?.role === "Admin",

    isLinked(state): boolean {
      if (!state.user) return false;
      const members = state.user?.householdMembers;
      return Array.isArray(members) && members.length > 1;
    },

    isPersonalDashboard(state): boolean {
      if (!state.user) return true;
      return state.user.householdId === state.user.personalHouseholdId;
    },

    dashboardStatus(state): string {
      if (!state.user) return "Desconhecido";

      if (this.isLinked && !this.isPersonalDashboard) {
        return "Compartilhado";
      }
      return "Pessoal";
    },

    mainDashboardTitle(state): string {
      if (!state.user) return "Dashboard";

      if (this.isLinked && !this.isPersonalDashboard) {
        return "Dashboard Compartilhado";
      }
      return "Dashboard Pessoal";
    },

    canToggleDashboard(state): boolean {
      if (!state.user) return false;

      if (this.isLinked) {
        return true;
      }

      if (!this.isLinked && !this.isPersonalDashboard) {
        return true;
      }
      return false;
    },

    householdMembers(state): HouseholdMember[] {
      return state.user?.householdMembers || [];
    },
  },

  actions: {
    _setToken(token: string | null) {
      if (token) {
        try {
          const decoded = jwtDecode<JwtPayload>(token);
          if (decoded.exp * 1000 > Date.now()) {
            this.token = token;
            if (typeof window !== "undefined") {
              localStorage.setItem("authToken", token);
            }
          } else {
            this._setToken(null);
          }
        } catch (e) {
          this._setToken(null);
        }
      } else {
        this.token = null;
        this.user = null;
        if (typeof window !== "undefined") {
          localStorage.removeItem("authToken");
        }
      }
    },

    async fetchUser() {
      const { $api } = useNuxtApp();
      if (!this.token) return;

      try {
        const response = await $api.get<User>("/profile");
        this.user = response.data;
      } catch (e) {
        console.error("Falha ao buscar perfil:", e);
        this.logout();
      }
    },

    async login(credentials: LoginDto) {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;

      try {
        const response = await $api.post<{ token: string }>(
          "/Auth/login",
          credentials
        );
        this._setToken(response.data.token);
        if (this.token) {
          await this.fetchUser();
          await navigateTo("/dashboard");
          return true;
        }
        return false;
      } catch (err: any) {
        this.error = "E-mail ou senha inválidos, ou conta desativada.";
        this._setToken(null);
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
        this.error =
          err.response?.data?.message || "Falha ao registrar usuário.";
        console.error("Registration failed:", err);
        return false;
      } finally {
        this.loading = false;
      }
    },
    logout() {
      this._setToken(null);
      navigateTo("/login");
    },
    async initialize() {
      if (typeof window !== "undefined") {
        const storedToken = localStorage.getItem("authToken");
        if (storedToken) {
          this._setToken(storedToken);
          if (this.token && !this.user) {
            await this.fetchUser();
          }
        }
      }
    },

    async linkAccount(inviteCode: string) {
      const { $api } = useNuxtApp();
      const response = await $api.post<{ message: string; token: string }>(
        "/linking/link",
        { inviteCode }
      );

      this._setToken(response.data.token);
      await this.fetchUser();

      const expenseStore = useExpensesStore();
      await expenseStore.fetchExpenses(true);
      await expenseStore.fetchSalary(true);
    },

    async unlinkAccount() {
      const { $api } = useNuxtApp();
      const response = await $api.post<{ message: string; token: string }>(
        "/linking/unlink"
      );

      this._setToken(response.data.token);
      await this.fetchUser();

      const expenseStore = useExpensesStore();
      await expenseStore.fetchExpenses(true);
      await expenseStore.fetchSalary(true);
    },

    async toggleDashboardContext() {
      const { $api } = useNuxtApp();
      this.loading = true;
      this.error = null;

      try {
        const response = await $api.post<{ message: string; token: string }>(
          "/linking/toggle-dashboard"
        );

        this._setToken(response.data.token);
        await this.fetchUser();

        const expenseStore = useExpensesStore();
        await expenseStore.fetchExpenses(true);
        await expenseStore.fetchSalary(true);

        return true;
      } catch (err: any) {
        this.error =
          err.response?.data?.message ||
          "Não foi possível alternar o dashboard.";
        console.error("Toggle failed:", err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
