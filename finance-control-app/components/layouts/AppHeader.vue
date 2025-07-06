<template>
  <v-app-bar app color="primary" dark elevate-on-scroll>
    <v-toolbar-title class="d-flex align-center" style="cursor: pointer" @click="goHome">
      <v-icon left>mdi-cash-multiple</v-icon>
      Gestão de Gastos
    </v-toolbar-title>

    <v-spacer />

    <v-btn text :to="{ name: 'index' }" :class="{ 'v-btn--active': isRoute('index') }">Home</v-btn>
    <v-btn text :to="{ name: 'expenses' }" :class="{ 'v-btn--active': isRoute('expenses') }">Despesas</v-btn>

    <v-btn icon aria-label="Notificações"><v-icon>mdi-bell</v-icon></v-btn>

    <v-btn icon aria-label="Alternar tema" @click="toggleTheme">
      <v-icon>
        {{ theme.global.name.value === 'light' ? 'mdi-weather-night' : 'mdi-white-balance-sunny' }}
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
  </v-app-bar>
</template>


<script setup>
import { useRouter, useRoute } from "vue-router";
import { defineEmits } from "vue";
import { useTheme } from 'vuetify' 

const router = useRouter();
const route = useRoute();
const emit = defineEmits(["logout"]);

const theme = useTheme(); 

function goHome() {
  router.push({ name: "index" });
}

function isRoute(name) {
  return route.name === name;
}

function logout() {
  emit("logout");
}

function toggleTheme() {
  const current = theme.global.name.value;
  const newTheme = current === 'light' ? 'dark' : 'light';
  theme.global.name.value = newTheme;
  localStorage.setItem('theme', newTheme);
}
</script>

<style scoped>
.v-btn--active {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>