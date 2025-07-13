<template>
  <v-app-bar app color="primary" dark elevate-on-scroll>
    <v-toolbar-title
      class="d-flex align-center"
      style="cursor: pointer"
      @click="goHome"
    >
      <v-icon left>mdi-cash-multiple</v-icon>
      Gestão de Gastos
    </v-toolbar-title>

    <v-spacer />

    <template v-if="$vuetify.display.mdAndUp">
      <v-btn
        text
        :to="{ name: 'index' }"
        :class="{ 'v-btn--active': isRoute('index') }"
      >
        Home
      </v-btn>

      <v-btn
        text
        :to="{ name: 'expenses' }"
        :class="{ 'v-btn--active': isRoute('expenses') }"
      >
        Despesas
      </v-btn>

      <v-btn
        text
        :to="{ name: 'category' }" :class="{ 'v-btn--active': isRoute('category') }"
      >
        Categorias
      </v-btn>

      <v-btn
        text
        :to="{ name: 'analytics' }"
        :class="{ 'v-btn--active': isRoute('analytics') }"
      >
        Dashboard
      </v-btn>
    </template>

    <v-btn icon aria-label="Notificações">
      <v-icon>mdi-bell</v-icon>
    </v-btn>

    <v-btn icon aria-label="Alternar tema" @click="toggleTheme">
      <v-icon>
        {{
          theme.global.name.value === "light"
            ? "mdi-weather-night"
            : "mdi-white-balance-sunny"
        }}
      </v-icon>
    </v-btn>

    <v-menu offset-y>
      <template #activator="{ props }">
        <v-btn icon v-bind="props" aria-label="Perfil">
          <v-icon>mdi-account-circle</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item @click="logout">
          <v-list-item-title>Sair</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-app-bar-nav-icon
      v-if="$vuetify.display.smAndDown"
      @click="toggleDrawer"
      aria-label="Abrir menu de navegação"
    ></v-app-bar-nav-icon>
  </v-app-bar>

  <v-navigation-drawer v-model="drawer" temporary app>
    <v-list dense nav>
      <v-list-item
        v-for="item in navItems"
        :key="item.title"
        :to="{ name: item.route }"
        link
      >
        <template #prepend>
          <v-icon>{{ item.icon }}</v-icon>
        </template>
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useTheme } from "vuetify";

const router = useRouter();
const route = useRoute();
const theme = useTheme();

const emit = defineEmits(["logout"]);

const drawer = ref(false);

const navItems = [
  { title: "Home", icon: "mdi-home", route: "index" },
  { title: "Despesas", icon: "mdi-cash-minus", route: "expenses" },
  { title: "Categorias", icon: "mdi-shape", route: "category" }, // <<<<< JÁ ESTÁ CORRETO AQUI
  { title: "Dashboard", icon: "mdi-view-dashboard", route: "analytics" },
];

const goHome = () => {
  router.push({ name: "index" });
};

const isRoute = (name) => route.name === name;

const logout = () => {
  emit("logout");
};

const toggleTheme = () => {
  const current = theme.global.name.value;
  const newTheme = current === "light" ? "dark" : "light";
  theme.global.name.value = newTheme;
  localStorage.setItem("theme", newTheme);
};

const toggleDrawer = () => {
  drawer.value = !drawer.value;
};

onMounted(() => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    theme.global.name.value = savedTheme;
  }
});
</script>

<style scoped>
.v-btn--active {
  background-color: rgba(255, 255, 255, 0.2);
}

.v-toolbar-title {
  flex-shrink: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 960px) {
  .v-toolbar__content {
    padding-left: 8px;
    padding-right: 8px;
  }
}
</style>