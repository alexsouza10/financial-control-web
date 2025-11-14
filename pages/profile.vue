<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8" xl="6">
        <v-alert
          v-if="profileStore.successMessage"
          type="success"
          variant="tonal"
          closable
          class="mb-6"
          @click:close="profileStore.clearMessages()"
        >
          {{ profileStore.successMessage }}
        </v-alert>

        <v-alert
          v-if="profileStore.error"
          type="error"
          variant="tonal"
          closable
          class="mb-6"
          @click:close="profileStore.clearMessages()"
        >
          {{ profileStore.error }}
        </v-alert>

        <v-card elevation="10" class="rounded-xl">
          <v-card-title
            class="text-h5 font-weight-bold pa-5 d-flex align-center"
          >
            <v-icon size="32" color="primary" class="mr-2"
              >mdi-account-cog</v-icon
            >
            Configurações da Conta
          </v-card-title>

          <v-tabs v-model="tab" bg-color="transparent" color="primary" centered>
            <v-tab value="account">
              <v-icon start>mdi-account-edit</v-icon>
              Perfil
            </v-tab>
            <v-tab value="password">
              <v-icon start>mdi-lock-reset</v-icon>
              Alterar Senha
            </v-tab>
          </v-tabs>

          <v-divider></v-divider>

          <v-card-text>
            <v-window v-model="tab">
              <v-window-item value="account">
                <section class="pa-2 pa-md-4">
                  <h3 class="text-h6 font-weight-bold mb-4 d-flex align-center">
                    <v-icon size="26" color="primary" class="mr-2"
                      >mdi-account-circle</v-icon
                    >
                    Informações do Perfil
                  </h3>

                  <v-form
                    ref="profileForm"
                    @submit.prevent="handleUpdateProfile"
                  >
                    <v-text-field
                      label="Email (Não Editável)"
                      :model-value="profileStore.profile?.email"
                      disabled
                      readonly
                      prepend-inner-icon="mdi-email-outline"
                      variant="solo"
                      density="comfortable"
                      class="mb-4"
                    />

                    <v-text-field
                      label="Nome de Usuário"
                      v-model="username"
                      :rules="usernameRules"
                      :disabled="profileStore.loading"
                      prepend-inner-icon="mdi-account-edit-outline"
                      variant="solo"
                      density="comfortable"
                    />

                    <v-btn
                      type="submit"
                      color="primary"
                      block
                      class="mt-6 text-uppercase font-weight-bold elevation-3"
                      size="large"
                      :loading="profileStore.loading"
                      :disabled="!isUsernameChanged || profileStore.loading"
                    >
                      <v-icon start>mdi-content-save</v-icon>
                      Salvar Perfil
                    </v-btn>
                  </v-form>
                </section>
              </v-window-item>

              <v-window-item value="password">
                <section class="pa-2 pa-md-4">
                  <h3 class="text-h6 font-weight-bold mb-4 d-flex align-center">
                    <v-icon size="26" color="secondary" class="mr-2"
                      >mdi-lock-reset</v-icon
                    >
                    Alterar Senha
                  </h3>

                  <v-form
                    ref="passwordForm"
                    @submit.prevent="handleChangePassword"
                  >
                    <v-text-field
                      label="Senha Atual"
                      v-model="passwords.currentPassword"
                      :type="showPassword.current ? 'text' : 'password'"
                      :append-inner-icon="
                        showPassword.current ? 'mdi-eye-off' : 'mdi-eye'
                      "
                      @click:append-inner="
                        showPassword.current = !showPassword.current
                      "
                      :rules="requiredRule"
                      prepend-inner-icon="mdi-lock-outline"
                      variant="solo"
                      density="comfortable"
                      class="mb-4"
                    />

                    <v-text-field
                      label="Nova Senha"
                      v-model="passwords.newPassword"
                      :type="showPassword.new ? 'text' : 'password'"
                      :append-inner-icon="
                        showPassword.new ? 'mdi-eye-off' : 'mdi-eye'
                      "
                      @click:append-inner="showPassword.new = !showPassword.new"
                      :rules="passwordRules"
                      prepend-inner-icon="mdi-lock-check-outline"
                      variant="solo"
                      density="comfortable"
                    />

                    <v-btn
                      type="submit"
                      color="secondary"
                      block
                      class="mt-6 text-uppercase font-weight-bold elevation-3"
                      size="large"
                      :loading="profileStore.loading"
                      :disabled="
                        !passwords.currentPassword || !passwords.newPassword
                      "
                    >
                      <v-icon start>mdi-key-change</v-icon>
                      Alterar Senha
                    </v-btn>
                  </v-form>
                </section>
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>

        <v-dialog v-model="confirmLogoutDialog" max-width="420">
          <v-card class="pa-4 rounded-xl">
            <v-card-title class="text-h6 font-weight-bold">
              Confirmar Alteração de Senha
            </v-card-title>

            <v-card-text>
              Após alterar sua senha, você será desconectado automaticamente.
              <br /><br />
              Deseja continuar?
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn variant="text" @click="confirmLogoutDialog = false"
                >Cancelar</v-btn
              >
              <v-btn color="red" variant="flat" @click="confirmPasswordChange"
                >Confirmar</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useProfileStore } from "~/stores/useProfileStore";

const router = useRouter();
const profileStore = useProfileStore();

const profileForm = ref<any>(null);
const passwordForm = ref<any>(null);

const tab = ref("account");

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
const showPassword = ref({ current: false, new: false });

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

const confirmLogoutDialog = ref(false);
let tempPasswordPayload: any = null;

async function handleChangePassword() {
  const { valid } = await passwordForm.value.validate();
  if (!valid) return;

  tempPasswordPayload = { ...passwords.value };
  confirmLogoutDialog.value = true;
}

async function confirmPasswordChange() {
  confirmLogoutDialog.value = false;

  try {
    await profileStore.changePassword(tempPasswordPayload);
    passwordForm.value.reset();
    localStorage.clear();
    sessionStorage.clear();
    profileStore.$reset();
    window.location.href = "/login";
  } catch (err) {
    console.error("Erro ao alterar a senha:", err);
  }
}

</script>
