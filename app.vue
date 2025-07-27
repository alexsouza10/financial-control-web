<template>
  <v-app :theme="theme" style="min-height: 100vh; display: flex; flex-direction: column;">
    <AppHeader @logout="handleLogout" @toggle-theme="toggleTheme" />

    <v-main style="flex: 1 0 auto;"> <v-container fluid class="pa-4">
        <NuxtRouteAnnouncer />
        <NuxtPage />
      </v-container>
    </v-main>

  </v-app>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useTheme } from 'vuetify';
import AppHeader from "./components/layouts/AppHeader.vue";
import AppFooter from "./components/layouts/AppFooter.vue";

const theme = ref('dark');
const vuetifyTheme = useTheme();

// Carregar tema salvo ou usar o preferido do sistema
onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme) {
    setTheme(savedTheme);
  } else {
    setTheme(systemPrefersDark ? 'dark' : 'light');
  }
  
  // Atualizar tema quando a preferência do sistema mudar (apenas se não houver tema salvo)
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleSystemThemeChange = (e) => {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  };
  
  darkModeMediaQuery.addEventListener('change', handleSystemThemeChange);
  
  return () => {
    darkModeMediaQuery.removeEventListener('change', handleSystemThemeChange);
  };
});

// Função para definir o tema
function setTheme(newTheme) {
  theme.value = newTheme;
  vuetifyTheme.global.name.value = newTheme;
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  // Disparar evento personalizado para notificar outros componentes
  document.dispatchEvent(new CustomEvent('theme-changed', { detail: newTheme }));
}

// Alternar entre temas claro e escuro
function toggleTheme() {
  setTheme(theme.value === 'dark' ? 'light' : 'dark');
}

// Função de logout
function handleLogout() {
  console.log("Executando logout...");
  // Implementar lógica real de logout aqui
  navigateTo('/login');
}
</script>

<style>
:root {
  --v-theme-background: #ffffff;
  --v-theme-surface: #ffffff;
  --v-theme-on-surface: #000000;
  --v-theme-on-surface-variant: #000000;
}

[data-theme="dark"] {
  --v-theme-background: #121212;
  --v-theme-surface: #1E1E1E;
  --v-theme-on-surface: #FFFFFF;
  --v-theme-on-surface-variant: #C7C7C7;
}

html {
  scroll-behavior: smooth;
  background-color: var(--v-theme-background);
  color: var(--v-theme-on-surface);
  transition: background-color 0.3s, color 0.3s;
}

body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  background-color: var(--v-theme-background);
  color: var(--v-theme-on-surface);
  transition: background-color 0.3s, color 0.3s;
}

/* Garantir que os componentes do Vuetify herdem as cores do tema */
.v-application {
  background-color: var(--v-theme-background) !important;
  color: var(--v-theme-on-surface) !important;
}

/* Melhorar a acessibilidade do foco */
:focus-visible {
  outline: 2px solid var(--v-primary-base, #1976D2);
  outline-offset: 2px;
}

/* Suporte a modo de alto contraste */
@media (prefers-contrast: more) {
  :root {
    --v-theme-on-surface: #000000;
    --v-theme-on-surface-variant: #000000;
  }
  
  [data-theme="dark"] {
    --v-theme-on-surface: #FFFFFF;
    --v-theme-on-surface-variant: #FFFFFF;
  }
  
  * {
    text-shadow: none !important;
  }
}
</style>
