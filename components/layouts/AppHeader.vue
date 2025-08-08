<template>
  <v-app-bar
    app
    flat
    dark
    color="primary"
    class="px-2 px-sm-4"
    height="64"
    elevate-on-scroll
    aria-label="Barra de navegação principal"
  >
    <v-app-bar-nav-icon
      v-if="isMobile"
      @click="toggleMobileMenu"
      aria-label="Abrir menu de navegação"
      class="d-sm-none mr-2"
    >
      <v-icon>mdi-menu</v-icon>
    </v-app-bar-nav-icon>

    <v-toolbar-title
      class="d-flex align-center"
      @click="goHome"
      role="button"
      tabindex="0"
      @keydown.enter="goHome"
      @keydown.space.prevent="goHome"
      style="cursor: pointer"
    >
      <v-hover v-slot="{ isHovering, props }">
        <div v-bind="props" class="d-flex align-center">
          <v-icon
            :color="isHovering ? 'secondary' : 'white'"
            class="mr-1"
            size="x-large"
          >
            mdi-cash-multiple
          </v-icon>
          <span
            class="font-weight-bold text-truncate text-white text-h6 d-none d-sm-block"
          >
            Gestão de Gastos
          </span>
          <span
            class="font-weight-bold text-truncate text-white text-subtitle-1 d-sm-none"
          >
            G. Gastos
          </span>
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
        class="mx-1 text-none"
        color="white"
        :class="{ 'v-btn--active': isRoute(item.route) }"
        :aria-current="isRoute(item.route) ? 'page' : undefined"
        :aria-label="`Ir para ${item.title}`"
        min-width="auto"
        density="comfortable"
      >
        <v-icon :icon="item.icon" size="20" class="mr-1 d-none d-lg-inline" />
        <span class="text-body-2 d-none d-lg-inline">{{ item.title }}</span>
      </v-btn>
    </template>

    <div class="actions-group d-flex align-center">
      <v-menu offset-y min-width="350" :close-on-content-click="false">
        <template #activator="{ props: menuProps }">
          <v-btn
            v-bind="menuProps"
            icon
            variant="text"
            class="header-icon-btn"
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
              >
                {{ unreadNotifications ? "mdi-bell-ring" : "mdi-bell-outline" }}
              </v-icon>
            </v-badge>
            <v-icon
              v-else
              size="24"
              :color="$route.name === 'notifications' ? 'white' : ''"
            >
              mdi-bell-outline
            </v-icon>
          </v-btn>
        </template>

        <v-card elevation="4" class="notification-dropdown">
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
            >
              Marcar todas como lidas
            </v-btn>
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-0">
            <v-list v-if="notifications.length" class="pa-0" density="compact">
              <v-list-item
                v-for="(notification, index) in notifications"
                :key="index"
                :class="{ 'bg-grey-lighten-4': !notification.read }"
                :title="notification.title"
                :subtitle="notification.message"
                :prepend-icon="notification.icon || 'mdi-information'"
                :color="notification.read ? '' : 'primary'"
                @click="handleNotificationClick(notification)"
                class="notification-item"
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
            >
              Ver todas as notificações
            </v-btn>
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
            class="header-icon-btn"
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
            class="header-avatar-btn"
            aria-label="Menu do usuário"
            aria-haspopup="menu"
            :aria-expanded="userMenu ? 'true' : 'false'"
          >
            <v-avatar size="36" color="primary" class="elevation-1">
              <v-icon size="20" color="white">mdi-account-circle</v-icon>
            </v-avatar>
          </v-btn>
        </template>

        <v-card min-width="200" elevation="4">
          <v-list density="compact" role="menu">
            <v-list-item
              v-for="(item, index) in userMenuItems"
              :key="index"
              :prepend-icon="item.icon"
              @click="handleUserMenuItemClick(item.action)"
              class="px-4"
              role="menuitem"
              :aria-label="item.title"
              :class="{ 'text-error': item.isDanger }"
            >
              <v-list-item-title :class="{ 'text-error': item.isDanger }">
                {{ item.title }}
              </v-list-item-title>
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
      <v-btn icon @click="drawer = false" aria-label="Fechar menu">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar>

    <v-divider />

    <v-list nav dense>
      <v-list-item
        v-for="item in navItems"
        :key="item.route"
        :to="{ name: item.route }"
        @click="closeMobileMenu"
        class="px-4 py-3"
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
          class="text-none"
        >
          Sair
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter, useRoute, type RouteLocationNormalizedLoaded } from "vue-router";
import { useTheme, useDisplay } from "vuetify";

type RouteName = "index" | "expenses" | "category" | "analytics" | "profile" | "settings" | "login" | "notifications";

type ThemeMode = "light" | "dark";

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
  (e: "show-notifications"): void;
}
const emit = defineEmits<Emits>();


const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { title: "Início", icon: "mdi-home", route: "index" },
  { title: "Despesas", icon: "mdi-cash-minus", route: "expenses" },
  { title: "Categorias", icon: "mdi-shape", route: "category" },
  { title: "Relatórios", icon: "mdi-chart-bar", route: "analytics" },
];

const THEME_ICONS: Record<ThemeMode, string> = {
  dark: "mdi-weather-sunny",
  light: "mdi-weather-night",
};

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
  {
    title: "Sair",
    icon: "mdi-logout",
    action: "logout",
    isDanger: true,
  },
];

const router = useRouter();
const route: RouteLocationNormalizedLoaded = useRoute();
const theme = useTheme();
const display = useDisplay();

const drawer = ref<boolean>(false);
const userMenu = ref<boolean>(false);

const notifications = ref<Notification[]>([
  { id: 1, title: 'Bem-vindo ao Gestão de Gastos!', message: 'Explore os recursos e comece a controlar suas finanças.', icon: 'mdi-hand-wave-outline', read: false, action: '/welcome' },
  { id: 2, title: 'Nova Funcionalidade', message: 'Relatórios de despesas agora incluem gráficos de pizza!', icon: 'mdi-chart-pie', read: false, action: '/analytics' },
  { id: 3, title: 'Lembrete de Categorização', message: 'Você tem 3 despesas sem categoria. Que tal organizá-las?', icon: 'mdi-tag-text-outline', read: false, action: '/expenses?filter=uncategorized' },
  { id: 4, title: 'Dica de Economia', message: 'Considere criar um orçamento para sua categoria de alimentação este mês.', icon: 'mdi-lightbulb-on-outline', read: true, action: '/budgets' },
  { id: 5, title: 'Aviso Importante', message: 'Sua assinatura expira em 7 dias. Renove agora para continuar usando todos os recursos.', icon: 'mdi-alert-circle-outline', read: false, action: '/billing' },
]);

const navItems = computed<NavItem[]>(() => [...NAV_ITEMS]);
const userMenuItems = computed<UserMenuItem[]>(() => [...USER_MENU_ITEMS]);

const unreadNotifications = computed<number>(() => {
  return notifications.value.filter(n => !n.read).length;
});

const isDark = computed<boolean>(
  () => theme.global.current?.value?.dark === true
);
const currentThemeMode = computed<ThemeMode>(() =>
  isDark.value ? "dark" : "light"
);
const themeIcons = computed<string>(() => THEME_ICONS[currentThemeMode.value]);

const isMobile = computed(() => display.smAndDown.value);
const isDesktop = computed(() => display.mdAndUp.value);
const isXs = computed(() => display.xs.value);

const goHome = (): void => {
  router.push({ name: "index" });
};

const isRoute = (name: RouteName): boolean => {
  const currentRouteName = String(route.name || "");
  return (
    currentRouteName === name ||
    currentRouteName.startsWith(`${name}-`) ||
    currentRouteName.endsWith(`-${name}`)
  );
};

const handleUserMenuItemClick = (action: UserMenuItem['action']): void => {
  userMenu.value = false;

  switch (action) {
    case "profile":
      router.push("/profile");
      break;
    case "settings":
      router.push("/settings");
      break;
    case "logout":
      logoutAndRedirect();
      break;
  }
};

const toggleMobileMenu = (): void => {
  drawer.value = !drawer.value;
};

const closeMobileMenu = (): void => {
  drawer.value = false;
};

const onDrawerTransitionEnd = (): void => {
  if (drawer.value) {
    const firstMenuItem = document.querySelector(
      ".v-navigation-drawer__content .v-list-item:first-child"
    ) as HTMLElement;
    firstMenuItem?.focus();
  }
};

const markAsRead = (id: number): void => {
  const notification = notifications.value.find(n => n.id === id);
  if (notification) {
    notification.read = true;
  }
};

const markAllAsRead = (): void => {
  notifications.value.forEach(notification => {
    notification.read = true;
  });
};

const handleNotificationClick = (notification: Notification): void => {
  markAsRead(notification.id);
  if (notification.action) {
    router.push(notification.action);
    userMenu.value = false;
  }
};

const toggleTheme = (): void => {
  emit('toggle-theme');
};

const logoutAndRedirect = (): void => {
  emit("logout");
  router.push("/login");
};
</script>

<style scoped>
.v-btn--active {
  background-color: rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  position: relative;
  font-weight: 500;
}

.v-btn--active::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 50%;
  height: 2px;
  background-color: currentColor;
  border-radius: 2px;
}

.v-toolbar-title {
  flex-shrink: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 1.25rem;
  font-weight: 500;
  letter-spacing: 0.0125em;
  cursor: pointer;
  transition: color 0.2s ease;
}

.v-btn:focus-visible,
.v-toolbar-title:focus-visible,
.v-list-item:focus-visible,
.header-icon-btn:focus-visible,
.header-avatar-btn:focus-visible {
  outline: 2px solid var(--v-theme-primary-lighten-1);
  outline-offset: 2px;
  border-radius: var(--btn-border-radius, inherit);
}

@media (max-width: 960px) {
  .v-toolbar__content {
    padding-left: 8px;
    padding-right: 8px;
  }

  .v-toolbar-title {
    font-size: 1.1rem;
  }
}

.v-list-item {
  transition: background-color 0.2s ease-in-out;
}

.actions-group {
  display: flex;
  align-items: center;
  gap: 0px;
  margin: 0 4px;
}

.header-icon-btn {
  --btn-size: 40px;
  --btn-border-radius: 50%;
  width: var(--btn-size);
  height: var(--btn-size);
  min-width: var(--btn-size);
  padding: 0;
  margin: 0;
  border-radius: var(--btn-border-radius);
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
}

.header-icon-btn:hover {
  background: transparent;
  transform: none;
}

.header-icon-btn :deep(.v-btn__overlay) {
  background-color: transparent !important;
  transition: none !important;
  border-radius: 50% !important;
}

.header-icon-btn .v-icon {
  color: white !important;
  transform: none;
}

.header-icon-btn:hover .v-icon {
  transform: none;
}

.v-badge__badge {
  font-size: 0.65rem;
  height: 18px;
  min-width: 18px;
  padding: 0 4px;
  top: 5px;
  right: 5px;
  border: 1.5px solid rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  border-radius: 50%;
}

.header-avatar-btn {
  --avatar-btn-size: 40px;
  --btn-border-radius: 50%;
  min-width: var(--avatar-btn-size);
  width: var(--avatar-btn-size);
  height: var(--avatar-btn-size);
  padding: 0;
  margin-left: 8px;
  border-radius: var(--btn-border-radius);
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
}

.header-avatar-btn:hover {
  background: transparent;
  transform: none;
  box-shadow: none;
}

.header-avatar-btn :deep(.v-btn__overlay) {
  background-color: transparent !important;
  transition: none !important;
  border-radius: 50% !important;
}

.header-avatar-btn .v-avatar {
  width: calc(100% - 4px);
  height: calc(100% - 4px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  transform: none;
  box-shadow: none;
  border-color: rgba(255, 255, 255, 0.3);
}

.header-avatar-btn .v-avatar .v-icon {
  transform: none;
  transition: none;
}

.header-avatar-btn .v-avatar:hover {
  transform: none;
  box-shadow: none;
  border-color: rgba(255, 255, 255, 0.3);
}

.notification-dropdown {
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.notification-item {
  transition: background-color 0.2s ease;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.notification-item.bg-grey-lighten-4 {
  background-color: rgba(var(--v-theme-primary), 0.05) !important;
}
</style>
