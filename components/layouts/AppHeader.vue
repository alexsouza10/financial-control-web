<template>
  <v-app-bar
    app
    flat
    dark
    color="primary"
    height="64"
    elevate-on-scroll
    aria-label="Barra de navegação principal"
  >
    <v-app-bar-nav-icon
      v-if="isMobile"
      @click="toggleMobileMenu"
      aria-label="Abrir menu de navegação"
    >
      <v-icon>mdi-menu</v-icon>
    </v-app-bar-nav-icon>

    <v-toolbar-title
      class="d-flex align-center color-black text-decoration-none"
      @click="goHome"
      role="button"
      tabindex="0"
      @keydown.enter="goHome"
      @keydown.space.prevent="goHome"
    >
      <v-hover v-slot="{ isHovering, props }">
        <div v-bind="props" class="d-flex align-center">
          <v-icon
            :color="!isHovering ? 'black' : 'white'"
            class="mr-1"
            size="x-large"
            >mdi-cash-multiple</v-icon
          >
          <span
            class="font-weight-bold text-truncate text-black text-h6 d-none d-sm-block"
            >Gestão de Gastos</span
          >
          <span
            class="font-weight-bold text-truncate text-black text-subtitle-1 d-sm-none"
            >G. Gastos</span
          >
        </div>
      </v-hover>
    </v-toolbar-title>
    <v-spacer />

    <template v-if="isDesktop">
      <v-btn
        v-for="item in navItems"
        :key="item.route"
        :to="{ name: item.route }"
        variant="text"
        color="black"
        :class="{ 'v-btn--active': isRoute(item.route) }"
        :aria-current="isRoute(item.route) ? 'page' : undefined"
        min-width="auto"
        density="comfortable"
      >
        <v-icon :icon="item.icon" size="20" class="mr-1 d-none d-lg-inline" />
        <span class="text-body-2 d-none d-lg-inline">{{ item.title }}</span>
      </v-btn>
    </template>

    <div class="d-flex align-center">
      <v-menu offset-y min-width="350" :close-on-content-click="false">
        <template #activator="{ props: menuProps }">
          <v-btn
            v-bind="menuProps"
            icon
            variant="text"
            :aria-label="`${unreadNotifications || 'Nenhuma'} notificação${
              unreadNotifications !== 1 ? 's' : ''
            }`"
            size="small"
          >
            <v-badge
              v-if="unreadNotifications"
              :content="unreadNotifications"
              color="error"
              offset-x="4"
              offset-y="4"
              bordered
              :dot="isXs"
            >
              <v-icon
                size="24"
                :color="$route.name === 'notifications' ? 'white' : ''"
                >{{
                  unreadNotifications ? "mdi-bell-ring" : "mdi-bell-outline"
                }}</v-icon
              >
            </v-badge>
            <v-icon
              v-else
              size="24"
              :color="$route.name === 'notifications' ? 'white' : ''"
              >mdi-bell-outline</v-icon
            >
          </v-btn>
        </template>

        <v-card elevation="4" style="max-height: 80vh; overflow-y: auto">
          <v-card-title
            class="d-flex align-center justify-space-between px-4 py-3"
          >
            <span class="text-h6">Notificações</span>
            <v-btn
              v-if="unreadNotifications"
              variant="text"
              size="small"
              color="primary"
              @click="markAllAsRead"
              >Marcar todas como lidas</v-btn
            >
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-0">
            <v-list v-if="notifications.length" class="pa-0" density="compact">
              <v-list-item
                v-for="(notification, index) in notifications"
                :key="index"
                :title="notification.title"
                :subtitle="notification.message"
                :prepend-icon="notification.icon || 'mdi-information'"
                :color="notification.read ? '' : 'primary'"
                @click="handleNotificationClick(notification)"
              >
                <template v-slot:append>
                  <v-tooltip text="Marcar como lida" location="left">
                    <template v-slot:activator="{ props: tooltipProps }">
                      <v-btn
                        v-bind="tooltipProps"
                        icon
                        variant="text"
                        size="x-small"
                        @click.stop="markAsRead(notification.id)"
                      >
                        <v-icon size="18">mdi-check</v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>
                </template>
              </v-list-item>
            </v-list>
            <v-alert
              v-else
              type="info"
              variant="tonal"
              class="ma-4"
              text="Nenhuma notificação nova"
            />
          </v-card-text>
          <v-divider />
          <v-card-actions class="px-4 py-2">
            <v-btn
              variant="text"
              color="primary"
              block
              @click="$router.push('/notifications')"
              >Ver todas as notificações</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-menu>

      <v-tooltip
        :text="
          isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'
        "
        location="bottom"
      >
        <template #activator="{ props: tooltipProps }">
          <v-btn
            v-bind="tooltipProps"
            icon
            variant="text"
            :aria-label="
              isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'
            "
            @click="toggleTheme"
            size="small"
          >
            <v-icon size="24">{{
              isDark ? "mdi-weather-sunny" : "mdi-weather-night"
            }}</v-icon>
          </v-btn>
        </template>
      </v-tooltip>

      <v-menu
        v-model="userMenu"
        location="bottom end"
        min-width="200"
        offset="10"
      >
        <template #activator="{ props: menuProps }">
          <v-btn
            v-bind="menuProps"
            variant="text"
            aria-label="Menu do usuário"
            aria-haspopup="menu"
            :aria-expanded="userMenu ? 'true' : 'false'"
          >
            <v-avatar size="36" color="primary"
              ><v-icon size="20" color="black"
                >mdi-account-circle</v-icon
              ></v-avatar
            >
          </v-btn>
        </template>

        <v-card min-width="200" elevation="4">
          <v-list density="compact" role="menu">
            <v-list-item
              v-for="(item, index) in userMenuItems"
              :key="index"
              :prepend-icon="item.icon"
              @click="handleUserMenuItemClick(item.action)"
              role="menuitem"
              :aria-label="item.title"
              :class="{ 'text-error': item.isDanger }"
            >
              <v-list-item-title :class="{ 'text-error': item.isDanger }">{{
                item.title
              }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </div>
  </v-app-bar>

  <v-navigation-drawer
    v-model="drawer"
    app
    temporary
    location="right"
    width="280"
    aria-label="Menu lateral móvel"
    @transitionend="onDrawerTransitionEnd"
  >
    <v-toolbar flat color="primary" dark>
      <v-toolbar-title class="text-h6">Menu</v-toolbar-title>
      <v-spacer />
      <v-btn icon @click="drawer = false" aria-label="Fechar menu"
        ><v-icon>mdi-close</v-icon></v-btn
      >
    </v-toolbar>

    <v-divider />

    <v-list nav dense>
      <v-list-item
        v-for="item in navItems"
        :key="item.route"
        :to="{ name: item.route }"
        @click="closeMobileMenu"
        :class="{ 'v-list-item--active': isRoute(item.route) }"
        :aria-current="isRoute(item.route) ? 'page' : undefined"
      >
        <template #prepend>
          <v-icon :icon="item.icon" class="me-3" />
        </template>
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>

    <template #append>
      <div class="pa-4">
        <v-btn
          block
          color="primary"
          variant="outlined"
          @click="logoutAndRedirect"
          prepend-icon="mdi-logout"
          >Sair</v-btn
        >
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useTheme, useDisplay } from "vuetify";

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

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { title: "Início", icon: "mdi-home", route: "index" },
  { title: "Dashboard", icon: "mdi-cash-minus", route: "dashboard" },
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
    document
      .querySelector(".v-navigation-drawer__content .v-list-item:first-child")
      ?.focus();
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
