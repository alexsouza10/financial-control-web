<template>
  <v-app :theme="theme">
    <AppHeader
      v-if="!['/login', '/register'].includes(route.path)"
      @logout="handleLogout"
      @toggle-theme="toggleTheme"
    />

    <v-main>
      <NuxtRouteAnnouncer />
      <NuxtPage />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useTheme } from "vuetify";
import { useAuthStore } from "~/stores/useAuthStore";
import { useRoute } from "vue-router";
import AppHeader from "./components/layouts/AppHeader.vue";

const route = useRoute();
const theme = ref("light");
const vuetifyTheme = useTheme();
const authStore = useAuthStore();

onMounted(() => {
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  theme.value = savedTheme && ["light", "dark"].includes(savedTheme)
    ? savedTheme
    : (systemPrefersDark ? "dark" : "light");

  vuetifyTheme.global.name.value = theme.value;
});

function toggleTheme() {
  const newTheme = theme.value === "dark" ? "light" : "dark";
  theme.value = newTheme;
  vuetifyTheme.global.name.value = newTheme;
  localStorage.setItem("theme", newTheme);
}

function handleLogout() {
  authStore.logout();
}
</script>
