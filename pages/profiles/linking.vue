<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <h1 class="text-h4 mb-4">Vincular Contas</h1>

        <template v-if="authStore.user">
          
          <template v-if="authStore.user.canLinkAccounts">
            
            <p class="text-body-1 mb-6">
              O administrador ativou este recurso. Você pode compartilhar seu
              dashboard ou vincular-se a outro.
            </p>

            <!-- ==================== SEM VÍNCULO ==================== -->
            <template v-if="!authStore.isLinked">
              <v-card class="mb-6" variant="tonal" color="primary">
                <v-card-title>Seu Código de Convite</v-card-title>
                <v-card-text>
                  <p class="mb-4">
                    Para outra pessoa se juntar ao seu dashboard, envie este
                    código:
                  </p>

                  <div class="d-flex align-center ga-2">
                    <v-chip
                      size="large"
                      label
                      class="text-h5 font-weight-bold"
                      style="letter-spacing: 2px"
                    >
                      {{ authStore.user.inviteCode || "..." }}
                    </v-chip>

                    <v-btn
                      icon="mdi-content-copy"
                      variant="text"
                      @click="copyCode(authStore.user.inviteCode)"
                    />
                  </div>
                </v-card-text>
              </v-card>

              <v-card elevation="2">
                <v-card-title>Juntar-se a outro dashboard</v-card-title>
                <v-card-text>
                  <p class="mb-4">
                    Se você recebeu um código, insira-o abaixo.
                    <strong>Atenção:</strong> seus dados financeiros atuais
                    serão mesclados com os do outro usuário.
                  </p>

                  <v-text-field
                    v-model="codeToLink"
                    label="Código de Convite"
                    variant="outlined"
                    :loading="loading"
                    :error-messages="error"
                  />
                </v-card-text>

                <v-card-actions>
                  <v-spacer />
                  <v-btn
                    color="primary"
                    variant="flat"
                    @click="handleLinkAccount"
                    :loading="loading"
                  >
                    Vincular Agora
                  </v-btn>
                </v-card-actions>
              </v-card>
            </template>

            <!-- ==================== COM VÍNCULO ==================== -->
            <template v-else>
              <v-card elevation="2">
                <v-card-title>Dashboard Compartilhado</v-card-title>
                <v-card-text>
                  <p class="mb-4">
                    Seu dashboard está sendo compartilhado com:
                  </p>

                  <v-list lines="one">
                    <v-list-item
                      v-for="member in authStore.householdMembers"
                      :key="member.id"
                      :title="member.username"
                      :subtitle="member.email"
                    />
                  </v-list>
                </v-card-text>

                <v-card-actions>
                  <v-btn
                    color="error"
                    variant="text"
                    @click="handleUnlink"
                    :loading="loading"
                  >
                    Desvincular minha conta
                  </v-btn>
                </v-card-actions>
              </v-card>
            </template>
          </template>

          <!-- ==================== RECURSO DESATIVADO ==================== -->
          <template v-else>
            <v-alert
              type="warning"
              variant="tonal"
              prominent
              icon="mdi-lock-outline"
            >
              <h3 class="text-h6">Recurso Indisponível</h3>
              <p>
                O recurso de vínculo de contas não está ativado para seu
                usuário. Por favor, entre em contato com o administrador.
              </p>
            </v-alert>
          </template>

        </template>

        <v-skeleton-loader v-else type="card" />

      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
      <template #actions>
        <v-btn variant="text" @click="snackbar.show = false">Fechar</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, onActivated } from "vue";
import { useAuthStore } from "~/stores/useAuthStore";

const authStore = useAuthStore();

const codeToLink = ref("");
const loading = ref(false);
const error = ref("");

const snackbar = reactive({
  show: false,
  text: "",
  color: "success",
});

// Carrega dados do usuário ao entrar
onMounted(() => authStore.fetchUser());
onActivated(() => authStore.fetchUser());

function copyCode(code: string | undefined) {
  if (!code) return;

  navigator.clipboard.writeText(code).then(() => {
    snackbar.text = "Código copiado!";
    snackbar.color = "success";
    snackbar.show = true;
  });
}

async function handleLinkAccount() {
  if (!codeToLink.value) {
    error.value = "Por favor, insira um código.";
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    await authStore.linkAccount(codeToLink.value);

    snackbar.text = "Contas vinculadas com sucesso!";
    snackbar.color = "success";
    snackbar.show = true;
  } catch (err: any) {
    error.value =
      err.response?.data?.message ||
      err.message ||
      "Falha ao vincular conta. Código inválido?";
  } finally {
    loading.value = false;
  }
}

async function handleUnlink() {
  if (
    !confirm(
      "Tem certeza que deseja desvincular sua conta? Seus dados financeiros atuais NÃO serão copiados."
    )
  ) {
    return;
  }

  loading.value = true;

  try {
    await authStore.unlinkAccount();

    snackbar.text = "Conta desvinculada.";
    snackbar.color = "info";
    snackbar.show = true;
  } catch (err: any) {
    snackbar.text =
      err.response?.data?.message || err.message || "Falha ao desvincular.";
    snackbar.color = "error";
    snackbar.show = true;
  } finally {
    loading.value = false;
  }
}
</script>
