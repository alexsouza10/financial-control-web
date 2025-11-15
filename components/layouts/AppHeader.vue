<template>
  <v-app-bar
    app
    flat
    height="64"
    color="primary"
    elevate-on-scroll
    class="px-3"
    style="backdrop-filter: blur(14px) saturate(180%)"
  >
    <v-toolbar-title
      class="d-flex align-center cursor-pointer"
      @click="goHome"
      style="letter-spacing: -0.5px"
    >
      <v-avatar color="white" size="32" class="mr-3 elevation-2">
        <v-icon color="primary" size="20">mdi-wallet-outline</v-icon>
      </v-avatar>

      <span
        v-if="isDesktop"
        class="font-weight-bold text-h6"
        style="opacity: 0.95"
      >
        Gestão Fácil
      </span>
    </v-toolbar-title>

    <v-spacer />

    <div v-if="isDesktop" class="d-flex align-center" style="gap: 6px">
      <v-chip
        v-if="authStore.isAuthenticated && authStore.isLinked"
        :color="
          authStore.isPersonalDashboard
            ? 'teal-lighten-4'
            : 'blue-grey-lighten-4'
        "
        size="small"
        class="px-4"
        variant="flat"
        style="border-radius: 10px; font-weight: 600"
      >
        <v-icon
          start
          size="18"
          :icon="
            authStore.isPersonalDashboard ? 'mdi-account' : 'mdi-account-group'
          "
        />
        {{ authStore.dashboardStatus }}
      </v-chip>

      <v-btn
        v-for="item in navItems"
        :key="item.route"
        :to="{ name: item.route }"
        variant="text"
        class="px-3 nav-btn"
        :class="{ 'active-nav': isRoute(item.route) }"
      >
        <v-icon class="mr-1" size="20">{{ item.icon }}</v-icon>
        {{ item.title }}
      </v-btn>

      <v-btn
        v-if="authStore.isAdmin"
        :to="{ name: 'admin-users' }"
        variant="text"
        class="px-3 nav-btn"
        :class="{ 'active-nav': $route.path.startsWith('/admin') }"
      >
        <v-icon class="mr-1" size="20">mdi-shield-account</v-icon>
        Admin
      </v-btn>
    </div>

    <v-tooltip :text="isDark ? 'Modo claro' : 'Modo escuro'">
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          icon
          size="small"
          class="mx-1"
          @click="toggleTheme"
        >
          <v-icon size="24">
            {{ isDark ? "mdi-weather-sunny" : "mdi-weather-night" }}
          </v-icon>
        </v-btn>
      </template>
    </v-tooltip>

    <v-menu v-model="userMenu" location="bottom end" offset="8">
      <template #activator="{ props }">
        <v-btn v-bind="props" icon elevation="0" size="small">
          <v-avatar size="36" color="white" class="elevation-3 user-avatar">
            <span class="text-primary">{{ userInitial }}</span>
          </v-avatar>
        </v-btn>
      </template>
      <v-card elevation="10" class="py-2">
        <v-list density="comfortable">
          <v-list-item
            v-for="item in userMenuItems"
            :key="item.title"
            @click="handleUserMenuItemClick(item.action)"
            :class="{ 'text-error': item.isDanger }"
          >
            <template #prepend>
              <v-icon :icon="item.icon" class="mr-3"></v-icon>
            </template>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>

    <v-btn v-if="isMobile" icon variant="text" @click="drawer = !drawer">
      <v-icon size="28">mdi-menu</v-icon>
    </v-btn>
  </v-app-bar>

  <v-navigation-drawer
    v-model="drawer"
    temporary
    location="right"
    width="280"
    class="pt-4"
  >
    <v-list nav>
      <v-list-item>
        <v-avatar size="40" class="mr-3" color="primary">
          <span class="text-white">{{ userInitial }}</span>
        </v-avatar>

        <v-list-item-title class="font-weight-bold">
          {{ authStore.user?.username }}
        </v-list-item-title>
      </v-list-item>

      <v-divider class="my-3" />

      <v-list-item
        v-for="item in navItems"
        :key="item.route"
        :to="{ name: item.route }"
      >
        <template #prepend>
          <v-icon>{{ item.icon }}</v-icon>
        </template>
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>

      <v-list-item v-if="authStore.isAdmin" :to="{ name: 'admin-users' }">
        <template #prepend>
          <v-icon>mdi-shield-account</v-icon>
        </template>
        <v-list-item-title>Admin</v-list-item-title>
      </v-list-item>

      <v-divider class="mt-3" />

      <v-list-item @click="toggleTheme">
        <template #prepend>
          <v-icon>
            {{ isDark ? "mdi-weather-sunny" : "mdi-weather-night" }}
          </v-icon>
        </template>
        <v-list-item-title>
          Tema: {{ isDark ? "Claro" : "Escuro" }}
        </v-list-item-title>
      </v-list-item>

      <v-list-item
        v-for="item in userMenuItems"
        :key="item.title"
        @click="handleUserMenuItemClick(item.action)"
        :class="{ 'text-error': item.isDanger }"
      >
        <template #prepend>
          <v-icon>{{ item.icon }}</v-icon>
        </template>
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useTheme, useDisplay } from "vuetify";
import { useAuthStore } from "~/stores/useAuthStore";

type RouteName =
  | "index"
  | "dashboard"
  | "profile"
  | "profile-linking"
  | "settings"
  | "login"
  | "notifications"
  | "admin-users";

interface NavItem {
  title: string;
  icon: string;
  route: RouteName;
}
interface UserMenuItem {
  title: string;
  icon: string;
  action:
    | "profile"
    | "settings"
    | "logout"
    | "profile-linking"
    | "toggle-dashboard";
  isDanger: boolean;
}

const emit = defineEmits<{ (e: "logout"): void; (e: "toggle-theme"): void }>();
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const theme = useTheme();
const display = useDisplay();
const drawer = ref(false);
const userMenu = ref(false);

const navItems = computed(() => {
  return [
    {
      title: authStore.mainDashboardTitle,
      icon: "mdi-chart-box",
      route: "dashboard",
    },
  ];
});

const userMenuItems = computed(() => {
  const menu: UserMenuItem[] = [
    {
      title: "Meu Perfil",
      icon: "mdi-account-circle-outline",
      action: "profile",
      isDanger: false,
    },
  ];

  if (authStore.canToggleDashboard) {
    menu.push({
      title: authStore.isPersonalDashboard
        ? "Voltar ao Compartilhado"
        : "Ver Dashboard Pessoal",
      icon: authStore.isPersonalDashboard ? "mdi-account-group" : "mdi-account",
      action: "toggle-dashboard",
      isDanger: false,
    });
  }

  if (authStore.user?.canLinkAccounts) {
    menu.push({
      title: "Vínculos de Contas",
      icon: "mdi-link-variant",
      action: "profile-linking",
      isDanger: false,
    });
  }

  menu.push({
    title: "Sair",
    icon: "mdi-logout",
    action: "logout",
    isDanger: true,
  });

  return menu;
});

const userInitial = computed(() => {
  return authStore.user?.username
    ? authStore.user.username.charAt(0).toUpperCase()
    : "?";
});

const isDark = computed(() => theme.global.current?.value?.dark === true);
const isMobile = computed(() => display.smAndDown.value);
const isDesktop = computed(() => display.mdAndUp.value);

const goHome = () => router.push({ name: "index" });
const isRoute = (name: RouteName) => String(route.name || "") === name;

const handleUserMenuItemClick = async (action: UserMenuItem["action"]) => {
  userMenu.value = false;
  drawer.value = false;

  if (action === "logout") {
    emit("logout");
  } else if (action === "toggle-dashboard") {
    await authStore.toggleDashboardContext();
    router.go(0);
  } else if (action === "profile-linking") {
    router.push("/profiles/linking");
  } else if (action === "profile") {
    router.push("/profile");
  } else {
    router.push(`/${action}`);
  }
};

const toggleTheme = () => emit("toggle-theme");
</script>

<style scoped>
.nav-btn {
  opacity: 0.85;
  transition: 0.25s ease;
  border-radius: 10px;
}

.nav-btn:hover {
  opacity: 1;
  background-color: rgba(255, 255, 255, 0.14);
}

.active-nav {
  background-color: rgba(255, 255, 255, 0.22) !important;
  opacity: 1;
  font-weight: 600;
}

.user-avatar {
  transition: transform 0.15s ease;
}

.user-avatar:hover {
  transform: scale(1.08);
}
</style>
