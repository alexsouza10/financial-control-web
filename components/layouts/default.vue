<!-- <template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title>Meu App</v-toolbar-title>
      <v-spacer />
      <ThemeToggle />
    </v-app-bar>
    <v-main>
      <slot />
    </v-main>
  </v-app>
</template> -->
<template>
  <v-app :theme="theme">
    <AppHeader
      v-if="!isAuthPage"
      @logout="handleLogout"
      @toggle-theme="toggleTheme"
    />

    <v-main>
      <NuxtPage />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useTheme } from "vuetify";
import { useAuthStore } from "~/stores/useAuthStore";
import AppHeader from "~/components/layouts/AppHeader.vue";
import { useRoute } from "#app"; // 💡 Importação para obter a rota

const theme = ref("light");
const vuetifyTheme = useTheme();
const authStore = useAuthStore();
const route = useRoute(); // 💡 Inicialize a rota

// Verifica se a rota atual é a de login ou registro
const isAuthPage = computed(() => {
  return route.path === "/login" || route.path === "/register";
});

// ... (Resto do seu código para tema e logout)
// ...
</script>