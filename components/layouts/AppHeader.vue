<template>
  <v-app-bar app flat color="primary" height="64" elevate-on-scroll>
    <v-app-bar-nav-icon
      v-if="isMobile"
      @click="toggleMobileMenu"
      aria-label="Abrir menu"
    >
      <v-icon>mdi-menu</v-icon>
    </v-app-bar-nav-icon>

    <!-- Logo / Título -->
    <v-toolbar-title
      class="d-flex align-center cursor-pointer"
      @click="goHome"
      role="button"
      tabindex="0"
      @keydown.enter="goHome"
      @keydown.space.prevent="goHome"
    >
      <!-- <v-icon class="me-2" size="28">mdi-finance</v-icon> -->
      <!-- <span class="font-weight-bold text-truncate">Gestão de Gastos</span> -->
    </v-toolbar-title>

    <v-spacer />

    <!-- Links desktop -->
    <template v-if="isDesktop">
      <v-btn
        v-for="item in navItems"
        :key="item.route"
        :to="{ name: item.route }"
        variant="text"
        :class="{ 'v-btn--active': isRoute(item.route) }"
        min-width="auto"
      >
        <v-icon left>{{ item.icon }}</v-icon>
        <span>{{ item.title }}</span>
      </v-btn>

      <v-btn
        v-if="authStore.isAdmin"
        :to="{ name: 'admin-users' }"
        variant="text"
        :class="{ 'v-btn--active': $route.path.startsWith('/admin') }"
        min-width="auto"
      >
        <v-icon left>mdi-shield-account</v-icon>
        <span>Admin</span>
      </v-btn>
    </template>

    <!-- Notificações -->
    <v-menu offset-y min-width="350" :close-on-content-click="false">
      <template #activator="{ props: menuProps }">
        <v-btn
          v-bind="menuProps"
          icon
          :aria-label="`${unreadNotifications || 'Nenhuma'} notificação(s)`"
        >
          <v-badge
            v-if="unreadNotifications"
            :content="unreadNotifications"
            color="error"
            bordered
            :dot="isXs"
          >
            <v-icon>{{
              unreadNotifications ? "mdi-bell-ring" : "mdi-bell-outline"
            }}</v-icon>
          </v-badge>
          <v-icon v-else>mdi-bell-outline</v-icon>
        </v-btn>
      </template>

      <!-- Conteúdo do menu de notificações -->
      <v-card elevation="4" max-height="80vh" style="overflow-y: auto">
        <v-card-title class="d-flex justify-space-between align-center">
          <span class="text-h6">Notificações</span>
          <v-btn
            v-if="unreadNotifications"
            variant="text"
            size="small"
            color="primary"
            @click="markAllAsRead"
          >
            Marcar todas como lidas
          </v-btn>
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-0">
          <v-list v-if="notifications.length" density="compact">
            <v-list-item
              v-for="n in notifications"
              :key="n.id"
              :color="!n.read ? 'primary lighten-5' : ''"
              @click="handleNotificationClick(n)"
            >
              <v-list-item-icon>
                <v-icon>{{ n.icon || "mdi-information" }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ n.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ n.message }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn icon size="x-small" @click.stop="markAsRead(n.id)">
                  <v-icon size="18">mdi-check</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
            <v-list-item
              v-if="authStore.isAdmin"
              :to="{ name: 'admin-users' }"
              @click="closeMobileMenu"
            >
              <v-list-item-icon
                ><v-icon>mdi-shield-account</v-icon></v-list-item-icon
              >
              <v-list-item-title>Admin</v-list-item-title>
            </v-list-item>
          </v-list>
          <v-alert v-else type="info" variant="tonal" class="ma-4">
            Nenhuma notificação nova
          </v-alert>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-btn
            variant="text"
            color="primary"
            block
            @click="$router.push('/notifications')"
          >
            Ver todas as notificações
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>

    <!-- Toggle tema -->
    <v-tooltip :text="isDark ? 'Tema claro' : 'Tema escuro'">
      <template #activator="{ props: tooltipProps }">
        <v-btn v-bind="tooltipProps" icon @click="toggleTheme">
          <v-icon size="24">{{
            isDark ? "mdi-weather-sunny" : "mdi-weather-night"
          }}</v-icon>
        </v-btn>
      </template>
    </v-tooltip>

    <!-- Menu do usuário -->
    <v-menu v-model="userMenu" location="bottom end" min-width="200">
      <template #activator="{ props: menuProps }">
        <v-btn v-bind="menuProps" variant="text" aria-label="Menu do usuário">
          <v-avatar size="36" color="primary">
            <v-icon size="20">mdi-account-circle</v-icon>
          </v-avatar>
        </v-btn>
      </template>
      <v-card min-width="200" elevation="4">
        <v-list density="compact" role="menu">
          <v-list-item
            v-for="item in userMenuItems"
            :key="item.title"
            @click="handleUserMenuItemClick(item.action)"
            :class="{ 'text-error': item.isDanger }"
            role="menuitem"
          >
            <v-list-item-icon
              ><v-icon>{{ item.icon }}</v-icon></v-list-item-icon
            >
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>

    <!-- Drawer móvel -->
    <v-navigation-drawer v-model="drawer" app temporary right width="280">
      <v-toolbar flat color="primary" dark>
        <v-toolbar-title>Menu</v-toolbar-title>
        <v-spacer />
        <v-btn icon @click="drawer = false"><v-icon>mdi-close</v-icon></v-btn>
      </v-toolbar>
      <v-divider />
      <v-list nav dense>
        <v-list-item
          v-for="item in navItems"
          :key="item.route"
          :to="{ name: item.route }"
          @click="closeMobileMenu"
        >
          <v-list-item-icon
            ><v-icon>{{ item.icon }}</v-icon></v-list-item-icon
          >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
        <v-list-item
          v-if="authStore.isAdmin"
          to="/admin/users"
          @click="closeMobileMenu"
        >
          <v-list-item-icon
            ><v-icon>mdi-shield-account</v-icon></v-list-item-icon
          >
          <v-list-item-title>Admin</v-list-item-title>
        </v-list-item>
      </v-list>
      <div class="pa-4">
        <v-btn
          block
          color="primary"
          variant="outlined"
          @click="logoutAndRedirect"
          prepend-icon="mdi-logout"
        >
          Sair
        </v-btn>
      </div>
    </v-navigation-drawer>
  </v-app-bar>
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
  | "settings"
  | "login"
  | "notifications";

interface NavItem {
  title: string;
  icon: string;
  route: RouteName;
}
interface UserMenuItem {
  title: string;
  icon: string;
  action: "profile" | "settings" | "logout";
  isDanger: boolean;
}
interface Notification {
  id: number;
  title: string;
  message: string;
  icon?: string;
  read: boolean;
  action?: string;
}
interface Emits {
  (e: "logout"): void;
  (e: "toggle-theme"): void;
}
const emit = defineEmits<Emits>();
const authStore = useAuthStore();

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  // { title: "Início", icon: "mdi-home", route: "index" },
  { title: "Dashboard", icon: "mdi-chart-box", route: "dashboard" },
];

const USER_MENU_ITEMS: ReadonlyArray<UserMenuItem> = [
  {
    title: "Meu Perfil",
    icon: "mdi-account",
    action: "profile",
    isDanger: false,
  },
  {
    title: "Configurações",
    icon: "mdi-cog",
    action: "settings",
    isDanger: false,
  },
  { title: "Sair", icon: "mdi-logout", action: "logout", isDanger: true },
];

const router = useRouter();
const route = useRoute();
const theme = useTheme();
const display = useDisplay();

const drawer = ref(false);
const userMenu = ref(false);

const notifications = ref<Notification[]>([
  {
    id: 1,
    title: "Bem-vindo ao Gestão de Gastos!",
    message: "Explore os recursos e comece a controlar suas finanças.",
    icon: "mdi-hand-wave-outline",
    read: false,
    action: "/welcome",
  },
  {
    id: 3,
    title: "Lembrete de Categorização",
    message: "Você tem 3 despesas sem categoria.",
    icon: "mdi-tag-text-outline",
    read: false,
    action: "/expenses?filter=uncategorized",
  },
  {
    id: 4,
    title: "Dica de Economia",
    message: "Considere criar um orçamento.",
    icon: "mdi-lightbulb-on-outline",
    read: true,
    action: "/budgets",
  },
]);

const navItems = computed(() => [...NAV_ITEMS]);
const userMenuItems = computed(() => [...USER_MENU_ITEMS]);
const unreadNotifications = computed(
  () => notifications.value.filter((n) => !n.read).length
);

const isDark = computed(() => theme.global.current?.value?.dark === true);
const isMobile = computed(() => display.smAndDown.value);
const isDesktop = computed(() => display.mdAndUp.value);
const isXs = computed(() => display.xs.value);

const goHome = () => router.push({ name: "index" });
const isRoute = (name: RouteName) => String(route.name || "") === name;

const handleUserMenuItemClick = (action: UserMenuItem["action"]) => {
  userMenu.value = false;
  if (action === "logout") logoutAndRedirect();
  else router.push(`/${action}`);
};

const toggleMobileMenu = () => (drawer.value = !drawer.value);
const closeMobileMenu = () => (drawer.value = false);
const onDrawerTransitionEnd = () => {
  if (drawer.value)
    (
      document.querySelector(
        ".v-navigation-drawer__content .v-list-item:first-child"
      ) as HTMLElement
    )?.focus();
};
const markAsRead = (id: number) => {
  const n = notifications.value.find((n) => n.id === id);
  if (n) n.read = true;
};
const markAllAsRead = () => notifications.value.forEach((n) => (n.read = true));
const handleNotificationClick = (notification: Notification) => {
  markAsRead(notification.id);
  if (notification.action) router.push(notification.action);
};
const toggleTheme = () => emit("toggle-theme");
const logoutAndRedirect = () => {
  emit("logout");
  router.push("/login");
};
</script>
