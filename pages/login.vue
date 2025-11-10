<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12 mx-auto" max-width="600">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Tela de Login</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                label="E-mail"
                v-model="email"
                prepend-inner-icon="mdi-account"
                type="email"
                variant="outlined"
                required
              ></v-text-field>

              <v-text-field
                label="Senha"
                v-model="password"
                prepend-inner-icon="mdi-lock"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                variant="outlined"
                required
              ></v-text-field>

              <v-alert v-if="authStore.error" type="error" class="mt-3">
                {{ authStore.error }}
              </v-alert>
            </v-form>
          </v-card-text>
          <v-card-actions
            class="d-flex justify-space-between align-center px-4 pb-4"
          >
            <v-btn color="secondary" text to="/register">Criar conta</v-btn>
            <v-btn
              color="primary"
              @click="handleLogin"
              :loading="authStore.loading"
              :disabled="!email || !password"
            >
              Entrar
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
  layout: "auth",
});

const authStore = useAuthStore();
const email = ref("");
const password = ref("");
const showPassword = ref(false);

const handleLogin = async () => {
  await authStore.login({ email: email.value, password: password.value });
};
</script>
