<template>
  <v-app>
    <AppHeader @logout="handleLogout" />

    <v-main>
      <v-container fluid class="pa-4">
        <NuxtPage />
      </v-container>
    </v-main>

    <AppFooter />
  </v-app>
</template>

<script setup>
import AppHeader from './AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function handleLogout() {
  console.log('Logout executado!')
  alert('Logout executado! (coloque lógica real aqui)')
}
</script>
