<template>
  <v-container class="fill-height pa-0" fluid>
    <v-row align="center" justify="center" no-gutters>
      <v-col cols="12" sm="10" md="7" lg="5" xl="4">
        <v-card
          class="mx-auto pa-2 pa-sm-8 rounded-xl elevation-10"
          max-width="600"
        >
          <v-card-title class="text-center pb-2">
            <v-icon size="56" color="primary" class="mb-3"
              >mdi-wallet-outline</v-icon
            >
            <h2 class="text-h5 font-weight-bold text-primary">
              Seja bem vindo(a) ao Gestão Fácil
            </h2>
          </v-card-title>

          <v-card-subtitle
            class="text-center text-subtitle-1 mb-6 text-medium-emphasis"
          >
            Seu sistema de gestão e controle de gastos.
          </v-card-subtitle>

          <v-card-text>
            <v-form @submit.prevent="handleLogin" ref="loginForm">
              <v-text-field
                label="E-mail"
                v-model="email"
                prepend-inner-icon="mdi-email-outline"
                type="email"
                variant="solo"
                :rules="[rules.required, rules.email]"
                class="mb-4"
                density="comfortable"
              ></v-text-field>

              <v-text-field
                label="Senha"
                v-model="password"
                prepend-inner-icon="mdi-lock-outline"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                variant="solo"
                :rules="[rules.required]"
                class="mb-2"
                density="comfortable"
              ></v-text-field>

              <v-alert
                v-if="authStore.error"
                type="error"
                class="mt-3 mb-5"
                density="compact"
                closable
              >
                {{ authStore.error }}
              </v-alert>

              <v-btn
                color="primary"
                size="large"
                block
                flat
                type="submit"
                :loading="authStore.loading"
                :disabled="!isFormValid"
                class="text-uppercase font-weight-bold mt-4 elevation-3"
              >
                Entrar
              </v-btn>
              <div class="d-flex justify-center mt-5">
                <v-btn
                  variant="text"
                  size="small"
                  color="secondary"
                  @click="navigateToForgotPassword"
                  class="text-caption font-weight-bold"
                >
                  Esqueceu a senha?
                </v-btn>
              </div>
            </v-form>
          </v-card-text>

          <v-divider class="mt-1"></v-divider>

          <v-card-actions class="d-flex justify-center pa-2">
            <span class="text-medium-emphasis mr-2">Não tem conta?</span>
            <v-btn
              color="secondary"
              variant="text"
              to="/register"
              class="font-weight-medium"
            >
              Criar conta
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuthStore } from "~/stores/useAuthStore";
import type { VForm } from "vuetify/components";

definePageMeta({
  layout: "auth",
});

const authStore = useAuthStore();
const email = ref("");
const password = ref("");
const showPassword = ref(false);
const loginForm = ref<VForm | null>(null);

const rules = {
  required: (value: string) => !!value || "Campo obrigatório.",
  email: (value: string) => {
    const pattern =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return pattern.test(value) || "E-mail inválido.";
  },
};

const isFormValid = computed(() => {
  return !!email.value && !!password.value && !authStore.loading;
});

const handleLogin = async () => {
  if (isFormValid.value) {
    await authStore.login({ email: email.value, password: password.value });
  }
};

const navigateToForgotPassword = () => {
  if (typeof navigateTo === "function") {
    navigateTo("/forgot-password");
  } else {
    window.location.href = "/forgot-password";
  }
};
</script>
