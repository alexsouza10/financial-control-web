<template>
  <v-container 
    class="fill-height pa-0" 
    fluid
  >
    <v-row align="center" justify="center" no-gutters>
      <v-col cols="12" sm="10" md="7" lg="5" xl="4">
        <v-card class="mx-auto pa-2 pa-sm-8 rounded-xl elevation-10" max-width="600">
          
          <v-card-title class="text-center pb-2">
            <v-icon size="56" color="secondary" class="mb-3">mdi-lock-reset</v-icon>
            <h2 class="text-h4 font-weight-bold text-secondary">Esqueceu a Senha?</h2>
          </v-card-title>
          
          <v-card-subtitle class="text-center text-subtitle-1 mb-6 text-medium-emphasis">
            Insira seu e-mail para receber um link de redefinição.
          </v-card-subtitle>

          <v-card-text>
            <v-form @submit.prevent="handleForgotPassword" ref="forgotPasswordForm">
              
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

              <v-alert v-if="message" :type="messageType" class="mt-3 mb-5" density="compact" closable>
                {{ message }}
              </v-alert>

              <v-btn
                color="secondary"
                size="large"
                block
                flat
                type="submit"
                :loading="loading"
                :disabled="!isEmailValid"
                class="text-uppercase font-weight-bold mt-4 elevation-3"
              >
                Enviar Link de Redefinição
              </v-btn>
            </v-form>
          </v-card-text>
          
          <v-divider class="my-4"></v-divider>
          
          <v-card-actions class="d-flex justify-center pa-2">
            <v-btn color="primary" variant="text" to="/login" class="font-weight-medium">
              <v-icon left>mdi-arrow-left</v-icon>
              Voltar para o Login
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

definePageMeta({
  layout: "auth",
  // 🚨 ESSENCIAL para rotas públicas: desativa a verificação de autenticação
  auth: false, 
});

const email = ref("");
const loading = ref(false);
const message = ref<string | null>(null);
const messageType = ref<'success' | 'error'>('success');

const rules = {
  required: (value: string) => !!value || 'Campo obrigatório.',
  email: (value: string) => {
    const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return pattern.test(value) || 'E-mail inválido.';
  },
};

const isEmailValid = computed(() => rules.email(email.value) === true && !!email.value);

const handleForgotPassword = async () => {
  if (!isEmailValid.value) return;

  loading.value = true;
  message.value = null;

  try {
    // Simulação da chamada de API
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    messageType.value = 'success';
    message.value = `Um link de redefinição de senha foi enviado para ${email.value}. Verifique sua caixa de entrada!`;
    email.value = ''; 
  } catch (error) {
    messageType.value = 'error';
    message.value = 'Erro ao tentar enviar o e-mail. Por favor, tente novamente.';
  } finally {
    loading.value = false;
  }
};
</script>