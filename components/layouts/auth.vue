<template>
  <v-app :theme="theme">
    <v-main>
      <NuxtRouteAnnouncer />
      <NuxtPage />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useTheme } from "vuetify";

const theme = ref("light");
const vuetifyTheme = useTheme();

onMounted(() => {
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  theme.value =
    savedTheme && ["light", "dark"].includes(savedTheme)
      ? savedTheme
      : systemPrefersDark
      ? "dark"
      : "light";

  vuetifyTheme.global.name.value = theme.value;
});
</script>
