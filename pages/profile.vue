<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-alert
          v-if="profileStore.successMessage"
          type="success"
          closable
          class="mb-4"
          @click:close="profileStore.clearMessages()"
        >
          {{ profileStore.successMessage }}
        </v-alert>
        <v-alert
          v-if="profileStore.error"
          type="error"
          closable
          class="mb-4"
          @click:close="profileStore.clearMessages()"
        >
          {{ profileStore.error }}
        </v-alert>

        <v-card
          class="mb-6"
          :loading="profileStore.loading && !passwords.currentPassword"
        >
          <v-card-title>Informações do Perfil</v-card-title>
          <v-card-text>
            <v-form ref="profileForm" @submit.prevent="handleUpdateProfile">
              <v-text-field
                label="Email"
                :model-value="profileStore.profile?.email"
                disabled
                readonly
                prepend-inner-icon="mdi-email"
                variant="outlined"
              ></v-text-field>

              <v-text-field
                label="Nome de Usuário"
                v-model="username"
                :rules="usernameRules"
                :disabled="profileStore.loading"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                class="mt-4"
              ></v-text-field>

              <v-btn
                type="submit"
                color="primary"
                block
                :loading="profileStore.loading"
                :disabled="!isUsernameChanged || profileStore.loading"
              >
                Salvar Perfil
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>

        <v-card :loading="profileStore.loading && !!passwords.currentPassword">
          <v-card-title>Alterar Senha</v-card-title>
          <v-card-text>
            <v-form ref="passwordForm" @submit.prevent="handleChangePassword">
              <v-text-field
                label="Senha Atual"
                v-model="passwords.currentPassword"
                type="password"
                :rules="requiredRule"
                :disabled="profileStore.loading"
                prepend-inner-icon="mdi-lock-outline"
                variant="outlined"
              ></v-text-field>

              <v-text-field
                label="Nova Senha"
                v-model="passwords.newPassword"
                type="password"
                :rules="passwordRules"
                :disabled="profileStore.loading"
                prepend-inner-icon="mdi-lock-check-outline"
                variant="outlined"
                class="mt-4"
              ></v-text-field>

              <v-btn
                type="submit"
                color="secondary"
                block
                :loading="profileStore.loading"
                :disabled="profileStore.loading"
              >
                Alterar Senha
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useProfileStore } from "~/stores/useProfileStore";

const profileStore = useProfileStore();
const profileForm = ref<any>(null);
const passwordForm = ref<any>(null);

const requiredRule = [(v: string) => !!v || "Este campo é obrigatório"];
const usernameRules = [
  (v: string) => !!v || "O nome de usuário é obrigatório",
  (v: string) =>
    (v && v.length >= 3) || "O nome deve ter pelo menos 3 caracteres",
];
const passwordRules = [
  (v: string) => !!v || "A nova senha é obrigatória",
  (v: string) =>
    (v && v.length >= 6) || "A senha deve ter pelo menos 6 caracteres",
];

const username = ref("");

onMounted(async () => {
  profileStore.clearMessages();
  await profileStore.fetchProfile();
  if (profileStore.profile) {
    username.value = profileStore.profile.username;
  }
});

onUnmounted(() => {
  profileStore.clearMessages();
});

const isUsernameChanged = computed(() => {
  return (
    profileStore.profile && username.value !== profileStore.profile.username
  );
});

async function handleUpdateProfile() {
  const { valid } = await profileForm.value.validate();
  if (!valid) return;

  await profileStore.updateProfile({ username: username.value });
}

const passwords = ref({
  currentPassword: "",
  newPassword: "",
});

async function handleChangePassword() {
  const { valid } = await passwordForm.value.validate();
  if (!valid) return;

  try {
    await profileStore.changePassword(passwords.value);
    passwordForm.value.reset();
  } catch (error) {
    console.error("Falha ao alterar senha no componente.");
  }
}
</script>
