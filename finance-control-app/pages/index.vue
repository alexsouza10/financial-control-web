<template>
  <v-container class="mt-12" style="max-width: 600px">
    <div class="text-center">
      <v-icon size="64" color="primary">mdi-cash-multiple</v-icon>
      <h1 class="text-h3 font-weight-bold mt-4 mb-2">
        Bem-vindo ao Gestão de Gastos
      </h1>
      <p class="subtitle-1 mb-6">
        Controle suas despesas mensais com facilidade e tenha uma visão clara
        das suas finanças.
      </p>

      <v-btn color="primary" large to="/expenses" elevation="2" rounded>
        <v-icon left>mdi-format-list-bulleted</v-icon>
        Ver Despesas
      </v-btn>
    </div>
  </v-container>
</template>

<script setup></script>

<style scoped>
.text-center {
  text-align: center;
}
</style>
