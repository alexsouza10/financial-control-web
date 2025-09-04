<template>
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
</template>