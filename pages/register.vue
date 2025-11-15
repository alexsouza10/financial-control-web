<template>
  <v-container class="fill-height pa-0" fluid>
    <v-row align="center" justify="center" no-gutters>
      <v-col cols="12" sm="10" md="7" lg="5" xl="4">
        <v-card
          class="mx-auto pa-4 pa-sm-8 rounded-xl elevation-10"
          max-width="600"
        >
          <v-card-title class="text-center pb-2 text-wrap">
            <v-icon size="40" class="mb-1 mb-sm-3" color="primary">
              mdi-account-plus-outline
            </v-icon>

            <h2
              class="text-h6 text-sm-h4 font-weight-bold text-primary mt-2 mb-3"
            >
              Criar <br class="d-sm-none" />
              Conta
            </h2>
          </v-card-title>

          <v-card-subtitle
            class="text-center text-body-2 text-sm-body-1 mb-6 text-medium-emphasis text-wrap"
          >
            Comece agora a controlar seus gastos com o<br class="d-sm-none" />
            Financial Control.
          </v-card-subtitle>

          <v-card-text class="mt-2">
            <v-form @submit.prevent="handleRegister" ref="registerForm">
              <v-text-field
                label="Nome de Usuário"
                v-model="username"
                prepend-inner-icon="mdi-account-circle-outline"
                type="text"
                variant="solo"
                :rules="[rules.required, rules.usernameMin]"
                class="mb-4"
                density="comfortable"
              />

              <v-text-field
                label="E-mail"
                v-model="email"
                prepend-inner-icon="mdi-email-outline"
                type="email"
                variant="solo"
                :rules="[rules.required, rules.email]"
                class="mb-4"
                density="comfortable"
              />

              <v-text-field
                label="Senha"
                v-model="password"
                prepend-inner-icon="mdi-lock-outline"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                variant="solo"
                :rules="[rules.required, rules.passwordMin]"
                class="mb-4"
                density="comfortable"
              />

              <v-text-field
                label="Confirmar Senha"
                v-model="passwordConfirm"
                prepend-inner-icon="mdi-lock-check"
                :type="showPasswordConfirm ? 'text' : 'password'"
                :append-inner-icon="
                  showPasswordConfirm ? 'mdi-eye-off' : 'mdi-eye'
                "
                @click:append-inner="showPasswordConfirm = !showPasswordConfirm"
                variant="solo"
                :rules="[rules.required, rules.passwordsMatch]"
                class="mb-4"
                density="comfortable"
              />

              <v-alert
                v-if="authStore.error"
                type="error"
                class="mt-3 mb-5"
                density="compact"
                closable
              >
                {{ authStore.error }}
              </v-alert>
            </v-form>
          </v-card-text>

          <v-divider class="my-4"></v-divider>

          <v-card-actions
            class="d-flex justify-space-between align-center px-4 px-sm-6 pb-6"
          >
            <v-btn
              color="secondary"
              variant="text"
              to="/login"
              class="font-weight-medium text-caption text-sm-body-2"
            >
              Já tenho uma conta
            </v-btn>

            <v-btn
              color="primary"
              size="large"
              flat
              @click="handleRegister"
              :loading="authStore.loading"
              :disabled="!isFormValid"
              class="text-uppercase font-weight-bold elevation-3"
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
import { ref, computed } from "vue";
import { useAuthStore } from "~/stores/useAuthStore";
import type { VForm } from "vuetify/components";

definePageMeta({
  layout: "auth",
});

const authStore = useAuthStore();
const username = ref("");
const email = ref("");
const password = ref("");
const passwordConfirm = ref("");
const showPassword = ref(false);
const showPasswordConfirm = ref(false);
const registerForm = ref<VForm | null>(null);

const rules = {
  required: (value: string) => !!value || "Campo obrigatório.",
  usernameMin: (value: string) =>
    value.length >= 3 || "Nome deve ter pelo menos 3 caracteres.",
  passwordMin: (value: string) =>
    value.length >= 6 || "Senha deve ter pelo menos 6 caracteres.",
  email: (value: string) => {
    const pattern =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return pattern.test(value) || "E-mail inválido.";
  },
  passwordsMatch: (value: string) =>
    value === password.value || "As senhas não coincidem.",
};

const isFormValid = computed(() => {
  return (
    !!username.value &&
    !!email.value &&
    !!password.value &&
    !!passwordConfirm.value &&
    password.value === passwordConfirm.value &&
    !authStore.loading
  );
});

const handleRegister = async () => {
  if (!isFormValid.value) return;

  authStore.error = null;

  await authStore.register({
    username: username.value,
    email: email.value,
    password: password.value,
  });
};
</script>
