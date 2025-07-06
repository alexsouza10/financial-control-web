<template>
  <v-app>
    <AppHeader @logout="handleLogout" />

    <v-main>
      <v-container fluid class="pa-4">
        <NuxtRouteAnnouncer />
        <NuxtPage />
      </v-container>
    </v-main>

    <AppFooter />
  </v-app>
</template>

<script setup>
import AppHeader from "./components/layouts/AppHeader.vue";
import AppFooter from "./components/layouts/AppFooter.vue";

function handleLogout() {
  console.log("Executando logout real...");
  alert("Logout executado! (Lógica real de logout aqui)");
}
</script>

<style>
html {
  scroll-behavior: smooth;
}
</style>
