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
import { useRoute } from "#app"; 

const theme = ref("light");
const vuetifyTheme = useTheme();
const authStore = useAuthStore();
const route = useRoute(); 

const isAuthPage = computed(() => {
  return route.path === "/login" || route.path === "/register";
});

</script>