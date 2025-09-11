<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Criar Conta</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="handleRegister">
              <v-text-field
                label="Nome de Usuário"
                v-model="username"
                prepend-inner-icon="mdi-account"
                type="text"
                variant="outlined"
                required
              ></v-text-field>
              <v-text-field
                label="E-mail"
                v-model="email"
                prepend-inner-icon="mdi-email"
                type="email"
                variant="outlined"
                required
              ></v-text-field>
              <v-text-field
                label="Senha"
                v-model="password"
                prepend-inner-icon="mdi-lock"
                type="password"
                variant="outlined"
                required
              ></v-text-field>
              <v-alert v-if="authStore.error" type="error" class="mt-3">
                {{ authStore.error }}
              </v-alert>
            </v-form>
          </v-card-text>
          <v-card-actions class="d-flex justify-space-between align-center">
            <v-btn color="secondary" text to="/login">Já tenho uma conta</v-btn>
            <v-btn
              color="primary"
              @click="handleRegister"
              :loading="authStore.loading"
              :disabled="!username || !email || !password"
            >
              Registrar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "~/stores/useAuthStore";

definePageMeta({
  layout: "default",
});

const authStore = useAuthStore();
const username = ref("");
const email = ref("");
const password = ref("");

const handleRegister = async () => {
  await authStore.register({
    username: username.value,
    email: email.value,
    password: password.value,
  });
};
</script>
