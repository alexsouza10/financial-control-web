<template>
  <v-footer app class="justify-center py-3" color="primary" dark>
    <span>&copy; {{ currentYear }} Gestão de Gastos</span>
  </v-footer>
</template>

<script setup>
import { ref } from 'vue'

const currentYear = ref(new Date().getFullYear())
</script>

<style scoped>
</style>