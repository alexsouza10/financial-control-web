<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Gerenciamento de Usuários</h1>

        <v-card>
          <v-card-title>
            Todos os Usuários <v-spacer></v-spacer>

            <v-btn
              icon
              @click="adminStore.fetchAllUsers"
              :loading="adminStore.loading"
            >
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </v-card-title>

          <v-alert
            v-if="adminStore.error"
            type="error"
            closable
            @click:close="adminStore.error = null"
          >
            {{ adminStore.error }}
          </v-alert>

          <v-table>
            <thead>
              <tr>
                <th class="text-left">ID</th>

                <th class="text-left">Usuário</th>

                <th class="text-left">Email</th>

                <th class="text-center">Status</th>

                <th class="text-center">Permite Vínculo</th>

                <th class="text-center">Ações</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="adminStore.loading">
                <td colspan="6" class="text-center">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                  ></v-progress-circular>
                </td>
              </tr>

              <tr v-for="user in adminStore.users" :key="user.id">
                <td>{{ user.id }}</td>

                <td>{{ user.username }}</td>

                <td>{{ user.email }}</td>

                <td class="text-center">
                  <v-chip
                    :color="user.isActive ? 'success' : 'grey'"
                    :text="user.isActive ? 'Ativo' : 'Inativo'"
                    size="small"
                  />
                </td>

                <td class="text-center">
                  <v-tooltip
                    :text="
                      user.canLinkAccounts
                        ? 'Desativar Recurso'
                        : 'Ativar Recurso'
                    "
                  >
                    <template v-slot:activator="{ props }">
                      <v-switch
                        v-bind="props"
                        :model-value="user.canLinkAccounts"
                        color="primary"
                        hide-details
                        density="compact"
                        @change="
                          toggleUserLinking(user.id, !user.canLinkAccounts)
                        "
                      />
                    </template>
                  </v-tooltip>
                </td>

                <td class="text-center">
                  <v-tooltip text="Ativar/Desativar Usuário">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        :icon="
                          user.isActive
                            ? 'mdi-toggle-switch'
                            : 'mdi-toggle-switch-off-outline'
                        "
                        variant="text"
                        :color="user.isActive ? 'primary' : 'grey'"
                        @click="toggleUserStatus(user.id, !user.isActive)"
                      ></v-btn>
                    </template>
                  </v-tooltip>

                  <v-tooltip text="Deletar Usuário">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        icon="mdi-delete"
                        variant="text"
                        color="red"
                        @click="handleDeleteUser(user.id, user.username)"
                      ></v-btn>
                    </template>
                  </v-tooltip>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useAuthStore } from "~/stores/useAuthStore";
import { useAdminStore } from "~/stores/useAdminStore";

const authStore = useAuthStore();
const adminStore = useAdminStore();

onMounted(() => {
  adminStore.fetchAllUsers();
});

function toggleUserStatus(userId: number, newStatus: boolean) {
  if (
    confirm(
      `Tem certeza que deseja ${
        newStatus ? "ativar" : "desativar"
      } este usuário?`
    )
  ) {
    adminStore.setUserActiveStatus(userId, newStatus);
  }
}

async function toggleUserLinking(userId: number, newStatus: boolean) {
  if (
    confirm(
      `Tem certeza que deseja ${
        newStatus ? "ATIVAR" : "DESATIVAR"
      } o recurso de vínculo para este usuário?`
    )
  ) {
    await adminStore.setUserLinkingStatus(userId, newStatus);
    if (authStore.user?.id === userId) {
      await authStore.fetchUser();
    }
  }
}

function handleDeleteUser(userId: number, username: string) {
  if (
    confirm(
      `TEM CERTEZA que deseja DELETAR o usuário ${username}? Isso não pode ser desfeito.`
    )
  ) {
    adminStore.deleteUser(userId);
  }
}
</script>
