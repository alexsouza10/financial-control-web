<template>
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
</template>

<script setup>
const emit = defineEmits(['logout'])

function logout() {
  emit('logout')
}
</script>