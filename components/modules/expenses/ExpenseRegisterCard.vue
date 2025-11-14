<template>
  <v-card rounded="md" elevation="4" @keydown.esc.stop="closeDialog">
    <v-card-title
      class="text-h6 d-flex align-center justify-space-between text-white"
      :style="{ background: `rgb(var(--v-theme-primary))` }"
    >
      <div class="d-flex align-center">
        <v-icon class="me-3" size="28" color="white">
          mdi-plus-circle-outline
        </v-icon>
        Registrar Novo Gasto
      </div>
      <v-btn
        icon
        variant="text"
        size="small"
        aria-label="Fechar"
        @click="closeCard"
        color="white"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>

    <v-divider />

    <v-card-text class="pa-4 pa-md-6">
      <v-form
        ref="expenseForm"
        @submit.prevent="submitExpense"
        validate-on="submit"
      >
        <v-alert
          v-if="submissionState === 'error'"
          type="error"
          class="mb-4"
          dense
        >
          {{
            errorMessage ||
            "Ocorreu um erro ao salvar o gasto. Tente novamente."
          }}
        </v-alert>

        <v-alert
          v-if="submissionState === 'success'"
          type="success"
          class="mb-4"
          dense
        >
          {{ successMessage || "Gasto salvo com sucesso!" }}
        </v-alert>

        <v-row dense>
          <v-col cols="12">
            <div class="d-flex align-center justify-end mb-1">
              <v-btn
                size="small"
                variant="text"
                color="primary"
                @click="showCategoryDialog = true"
                class="text-caption"
              >
                <v-icon start size="16">mdi-plus</v-icon>
                Nova Categoria
              </v-btn>
            </div>

            <v-combobox
              v-model="selectedCategory"
              :items="categoryItems"
              item-title="name"
              item-value="id"
              label="Pesquisar ou selecionar uma categoria"
              variant="outlined"
              density="compact"
              :rules="categoryRules"
              required
            >
              <template #item="{ props, item }">
                <v-list-item
                  v-bind="props"
                  :prepend-icon="item.raw.icon"
                  :title="item.raw.name"
                  @contextmenu.prevent="openCategoryMenu($event, item.raw)"
                >
                  <template #append>
                    <div class="d-flex align-center">
                      <v-btn
                        icon
                        size="x-small"
                        variant="text"
                        color="primary"
                        @click.stop="editCategory(item.raw)"
                        class="me-1"
                      >
                        <v-icon size="16">mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn
                        icon
                        size="x-small"
                        variant="text"
                        color="error"
                        @click.stop="deleteCategory(item.raw)"
                      >
                        <v-icon size="16">mdi-delete</v-icon>
                      </v-btn>
                    </div>

                    <v-menu
                      v-model="item.raw.showMenu"
                      :activator="item.raw.menuActivator"
                      location="end"
                      offset-x
                    >
                      <v-list density="compact">
                        <v-list-item
                          @click="editCategory(item.raw)"
                          prepend-icon="mdi-pencil"
                        >
                          <v-list-item-title>Editar</v-list-item-title>
                        </v-list-item>
                        <v-list-item
                          @click="deleteCategory(item.raw)"
                          prepend-icon="mdi-delete"
                          color="error"
                        >
                          <v-list-item-title class="text-error"
                            >Excluir</v-list-item-title
                          >
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </template>
                </v-list-item>
              </template>
            </v-combobox>
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="formattedValue"
              @update:modelValue="formatCurrencyInput"
              label="Valor Total"
              variant="outlined"
              density="compact"
              prefix="R$"
              :rules="totalValueRules"
              required
              inputmode="numeric"
            />
          </v-col>

          <v-col cols="12" md="6">
            <DatePickerField
              v-model="selectedExpenseDate"
              label="Data da Compra"
              density="compact"
              :rules="dateRules"
              required
            />
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="description"
              label="Descrição (Opcional)"
              placeholder="Ex: Almoço com cliente"
              variant="outlined"
              density="compact"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="selectedPaymentMethod"
              :items="paymentMethods"
              label="Método de Pagamento"
              variant="outlined"
              density="compact"
              required
              :rules="paymentMethodRules"
            />
          </v-col>

          <v-expand-transition>
            <v-col v-if="isCreditCardPayment" cols="12" md="6">
              <v-select
                v-model="selectedCard"
                :items="cardOptions"
                label="Cartão de Crédito"
                variant="outlined"
                density="compact"
                :rules="cardRules"
                required
              />
            </v-col>
          </v-expand-transition>

          <v-expand-transition>
            <v-col v-if="isCreditCardPayment" cols="12">
              <v-slider
                v-model="numberOfInstallments"
                label="Número de Parcelas"
                :min="1"
                :max="12"
                :step="1"
                thumb-label
                color="primary"
                class="mt-2"
              >
                <template #append>
                  <v-text-field
                    v-model.number="numberOfInstallments"
                    type="number"
                    style="width: 80px"
                    density="compact"
                    hide-details
                    variant="outlined"
                    min="1"
                  />
                </template>
              </v-slider>
            </v-col>
          </v-expand-transition>

          <v-col
            cols="12"
            v-if="isCreditCardPayment && numberOfInstallments > 1"
          >
            <v-alert
              density="compact"
              variant="tonal"
              color="info"
              icon="mdi-information-outline"
              class="text-caption"
            >
              Serão criadas {{ numberOfInstallments }} despesas de
              <strong>{{ formattedInstallmentValue }}</strong
              >, uma para cada mês a partir de {{ formattedExpenseDate }}
            </v-alert>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" class="text-right mt-4">
            <v-btn
              type="submit"
              :color="submitButtonColor"
              class="submit-btn"
              :loading="isSavingExpense"
              size="large"
              rounded="md"
              variant="flat"
            >
              <v-icon start>{{ submitButtonIcon }}</v-icon>
              {{ submitButtonText }}
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-dialog v-model="showCategoryDialog" max-width="500" persistent>
      <v-card>
        <v-card-title
          class="text-h6 d-flex align-center justify-space-between"
          :style="{ background: `rgb(var(--v-theme-primary))` }"
        >
          <div class="d-flex align-center">
            <v-icon class="me-3" size="24">mdi-tag-plus</v-icon>
            Nova Categoria
          </div>
          <v-btn
            icon
            variant="text"
            size="small"
            aria-label="Fechar"
            @click="closeCategoryDialog"
            color="white"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-form ref="categoryForm" @submit.prevent="createCategory">
            <v-row dense>
              <v-col cols="12">
                <v-text-field
                  v-model="newCategory.name"
                  label="Nome da Categoria"
                  variant="outlined"
                  density="compact"
                  :rules="categoryNameRules"
                  required
                  placeholder="Ex: Alimentação"
                />
              </v-col>

              <v-col cols="12">
                <v-select
                  v-model="newCategory.icon"
                  :items="availableIcons"
                  label="Ícone"
                  variant="outlined"
                  density="compact"
                  :rules="categoryIconRules"
                  required
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template #prepend>
                        <v-icon :icon="item.raw" />
                      </template>
                      <v-list-item-title>{{ item.raw }}</v-list-item-title>
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            variant="outlined"
            @click="showCategoryDialog = false"
            :disabled="isCreatingCategory"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="createCategory"
            :loading="isCreatingCategory"
            :disabled="!newCategory.name || !newCategory.icon"
          >
            Criar Categoria
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal para editar categoria -->
    <v-dialog v-model="showEditCategoryDialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="text-h6 d-flex align-center">
          <v-icon class="me-3" size="24">mdi-pencil</v-icon>
          Editar Categoria
        </v-card-title>

        <v-card-text>
          <v-form ref="editCategoryForm" @submit.prevent="updateCategory">
            <v-row dense>
              <v-col cols="12">
                <v-text-field
                  v-model="editingCategory.name"
                  label="Nome da Categoria"
                  variant="outlined"
                  density="compact"
                  :rules="categoryNameRules"
                  required
                  placeholder="Ex: Alimentação"
                />
              </v-col>

              <v-col cols="12">
                <v-select
                  v-model="editingCategory.icon"
                  :items="availableIcons"
                  label="Ícone"
                  variant="outlined"
                  density="compact"
                  :rules="categoryIconRules"
                  required
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template #prepend>
                        <v-icon :icon="item.raw" />
                      </template>
                      <v-list-item-title>{{ item.raw }}</v-list-item-title>
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            variant="outlined"
            @click="showEditCategoryDialog = false"
            :disabled="isUpdatingCategory"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="updateCategory"
            :loading="isUpdatingCategory"
            :disabled="!editingCategory.name || !editingCategory.icon"
          >
            Atualizar Categoria
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de confirmação para excluir categoria -->
    <v-dialog v-model="showDeleteCategoryDialog" max-width="400" persistent>
      <v-card>
        <v-card-title class="text-h6 d-flex align-center">
          <v-icon class="me-3" size="24" color="error">mdi-delete</v-icon>
          Excluir Categoria
        </v-card-title>

        <v-card-text>
          <p class="mb-2">
            Tem certeza que deseja excluir a categoria
            <strong>"{{ deletingCategory?.name }}"</strong>?
          </p>
          <p class="text-caption text-medium-emphasis">
            Esta ação não pode ser desfeita e pode afetar gastos existentes.
          </p>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            variant="outlined"
            @click="showDeleteCategoryDialog = false"
            :disabled="isDeletingCategory"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            @click="confirmDeleteCategory"
            :loading="isDeletingCategory"
          >
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { parseISO, format, addMonths, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useExpensesStore } from "~/stores/useExpensesStore";
import { useCategoriesStore } from "~/stores/useCategoriesStore";
import type { Category } from "~/types/category";
import DatePickerField from "~/components/ui/DatePickerField.vue";

interface CategoryWithMenu extends Category {
  showMenu: boolean;
  menuActivator: any;
}

const emit = defineEmits<{
  close: [];
}>();

const expensesStore = useExpensesStore();
const categoriesStore = useCategoriesStore();
const isCardVisible = ref(true);
const expenseForm = ref<any>(null);
const categoryForm = ref<any>(null);
const editCategoryForm = ref<any>(null);
const rawTotalValue = ref(0);
const formattedValue = ref("");
const selectedPaymentMethod = ref("Cartão de Crédito");
const numberOfInstallments = ref(1);
const selectedCategory = ref<string | CategoryWithMenu | null>(null);
function getDefaultDate(): Date {
  const today = new Date();
  const storeMonth = expensesStore.currentDate;

  if (isSameMonth(today, storeMonth)) {
    return today;
  } else {
    return storeMonth;
  }
}

const selectedExpenseDate = ref(format(getDefaultDate(), "yyyy-MM-dd"));
const selectedCard = ref("");
const description = ref("");
const isSavingExpense = ref(false);
const submissionState = ref<"idle" | "success" | "error">("idle");
const errorMessage = ref("");
const successMessage = ref("");

const showCategoryDialog = ref(false);
const isCreatingCategory = ref(false);
const newCategory = ref({
  name: "",
  icon: "",
});

const showEditCategoryDialog = ref(false);
const isUpdatingCategory = ref(false);
const editingCategory = ref({
  id: "",
  name: "",
  icon: "",
});

const showDeleteCategoryDialog = ref(false);
const isDeletingCategory = ref(false);
const deletingCategory = ref<Category | null>(null);

const availableIcons = [
  "mdi-food",
  "mdi-car",
  "mdi-home",
  "mdi-shopping",
  "mdi-hospital",
  "mdi-school",
  "mdi-airplane",
  "mdi-bus",
  "mdi-train",
  "mdi-bike",
  "mdi-walk",
  "mdi-gift",
  "mdi-movie",
  "mdi-music",
  "mdi-gamepad-variant",
  "mdi-book",
  "mdi-dumbbell",
  "mdi-palette",
  "mdi-camera",
  "mdi-phone",
  "mdi-laptop",
  "mdi-tv",
  "mdi-wifi",
  "mdi-lightning-bolt",
  "mdi-water",
  "mdi-fire",
  "mdi-leaf",
  "mdi-heart",
  "mdi-star",
  "mdi-diamond",
  "mdi-crown",
];
const paymentMethods = [
  "Cartão de Crédito",
  "Débito",
  "Dinheiro",
  "Pix",
  "Boleto",
];
const cardOptions = ["Nubank", "Hipercard", "Santander", "Outro"];
const categoryItems = computed(() =>
  categoriesStore.categories.map(
    (cat: Category): CategoryWithMenu => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      showMenu: false,
      menuActivator: null,
    })
  )
);
const isCreditCardPayment = computed(
  () => selectedPaymentMethod.value === "Cartão de Crédito"
);
const installmentValue = computed(() =>
  numberOfInstallments.value > 0
    ? rawTotalValue.value / numberOfInstallments.value
    : 0
);
const formattedInstallmentValue = computed(() =>
  formatCurrency(installmentValue.value)
);
const formattedExpenseDate = computed(() =>
  format(parseISO(selectedExpenseDate.value), "MMM/yy", { locale: ptBR })
);
const categoryRules = [(v: any) => !!v || "Escolha uma categoria"];
const paymentMethodRules = [
  (v: any) => !!v || "Escolha um método de pagamento",
];
const dateRules = [(v: any) => !!v || "Data obrigatória"];
const cardRules = [(v: any) => !!v || "Escolha um cartão"];
const totalValueRules = [
  (v: string) => !!v || "Campo obrigatório",
  (v: string) =>
    parseFloat(v?.replace(/\./g, "").replace(",", ".") || "0") > 0 ||
    "O valor deve ser maior que zero",
];
const categoryNameRules = [
  (v: string) => !!v || "Nome da categoria é obrigatório",
  (v: string) => v.length >= 2 || "Nome deve ter pelo menos 2 caracteres",
  (v: string) => v.length <= 50 || "Nome deve ter no máximo 50 caracteres",
];
const categoryIconRules = [(v: string) => !!v || "Ícone é obrigatório"];
watch(selectedPaymentMethod, (newMethod) => {
  if (newMethod !== "Cartão de Crédito") {
    numberOfInstallments.value = 1;
    selectedCard.value = "";
  }
});
const formatCurrencyInput = (value: string) => {
  let digits = (value || "").replace(/\D/g, "").replace(/^0+/, "");
  if (!digits) {
    formattedValue.value = "";
    rawTotalValue.value = 0;
    return;
  }
  rawTotalValue.value = parseInt(digits, 10) / 100;
  formattedValue.value = rawTotalValue.value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value || 0
  );
const resetForm = () => {
  rawTotalValue.value = 0;
  formattedValue.value = "";
  selectedPaymentMethod.value = "Cartão de Crédito";
  numberOfInstallments.value = 1;
  selectedCategory.value = null;
  selectedExpenseDate.value = format(getDefaultDate(), "yyyy-MM-dd"); // MUDANÇA
  selectedCard.value = "";
  description.value = "";
  expenseForm.value?.resetValidation?.();
};
const resetCategoryForm = () => {
  newCategory.value = {
    name: "",
    icon: "",
  };
  categoryForm.value?.resetValidation?.();
};
const resetEditCategoryForm = () => {
  editingCategory.value = {
    id: "",
    name: "",
    icon: "",
  };
  editCategoryForm.value?.resetValidation?.();
};
const closeDialog = () => {
  isCardVisible.value = false;
  resetForm();
};
const closeCard = () => {
  resetForm();
  emit("close");
};
const openCategoryMenu = (event: MouseEvent, category: CategoryWithMenu) => {
  event.preventDefault();
  category.showMenu = true;
  category.menuActivator = event.currentTarget;
};
const editCategory = (category: CategoryWithMenu) => {
  editingCategory.value = {
    id: category.id,
    name: category.name,
    icon: category.icon,
  };
  showEditCategoryDialog.value = true;
  category.showMenu = false;
  if (selectedCategory.value === category.id) {
    setTimeout(() => {
      selectedCategory.value = category.id;
    }, 100);
  }
};
async function updateCategory() {
  const { valid } = await editCategoryForm.value.validate();
  if (!valid) return;
  isUpdatingCategory.value = true;
  try {
    const categoryPayload = {
      name: editingCategory.value.name.toUpperCase(),
      icon: editingCategory.value.icon,
    };
    await categoriesStore.updateCategory(
      editingCategory.value.id,
      categoryPayload
    );
    showEditCategoryDialog.value = false;
    resetEditCategoryForm();
    if (selectedCategory.value === editingCategory.value.id) {
      const updatedCategory = categoriesStore.categories.find(
        (cat) => cat.id === editingCategory.value.id
      );
      if (updatedCategory) {
        selectedCategory.value = updatedCategory.id;
      }
    }
    successMessage.value = "Categoria atualizada com sucesso!";
    submissionState.value = "success";
    setTimeout(() => {
      submissionState.value = "idle";
      successMessage.value = "";
    }, 2000);
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    errorMessage.value = "Erro ao atualizar categoria. Tente novamente.";
    submissionState.value = "error";
    setTimeout(() => {
      submissionState.value = "idle";
      errorMessage.value = "";
    }, 2000);
  } finally {
    isUpdatingCategory.value = false;
  }
}
const deleteCategory = (category: CategoryWithMenu) => {
  deletingCategory.value = category;
  showDeleteCategoryDialog.value = true;
  category.showMenu = false;
  if (selectedCategory.value === category.id) {
    setTimeout(() => {
      selectedCategory.value = category.id;
    }, 100);
  }
};
async function confirmDeleteCategory() {
  if (!deletingCategory.value) return;
  isDeletingCategory.value = true;
  try {
    await categoriesStore.deleteCategory(deletingCategory.value.id);
    const deletedCategoryId = deletingCategory.value?.id;
    showDeleteCategoryDialog.value = false;
    deletingCategory.value = null;
    if (deletedCategoryId && selectedCategory.value === deletedCategoryId) {
      selectedCategory.value = null;
    }
    successMessage.value = "Categoria excluída com sucesso!";
    submissionState.value = "success";
    setTimeout(() => {
      submissionState.value = "idle";
      successMessage.value = "";
    }, 2000);
  } catch (error) {
    console.error("Erro ao excluir categoria:", error);
    errorMessage.value = "Erro ao excluir categoria. Tente novamente.";
    submissionState.value = "error";
    setTimeout(() => {
      submissionState.value = "idle";
      errorMessage.value = "";
    }, 2000);
  } finally {
    isDeletingCategory.value = false;
  }
}
async function createCategory() {
  const { valid } = await categoryForm.value.validate();
  if (!valid) return;
  isCreatingCategory.value = true;
  try {
    const categoryPayload = {
      name: newCategory.value.name.toUpperCase(),
      icon: newCategory.value.icon,
    };
    await categoriesStore.createCategory(categoryPayload);
    showCategoryDialog.value = false;
    resetCategoryForm();
    const newCategoryCreated = categoriesStore.categories.find(
      (cat) => cat.name === categoryPayload.name
    );
    if (newCategoryCreated) {
      selectedCategory.value = newCategoryCreated.id;
    }
    successMessage.value = "Categoria criada com sucesso!";
    submissionState.value = "success";
    setTimeout(() => {
      submissionState.value = "idle";
      successMessage.value = "";
    }, 2000);
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    errorMessage.value = "Erro ao criar categoria. Tente novamente.";
    submissionState.value = "error";
    setTimeout(() => {
      submissionState.value = "idle";
      errorMessage.value = "";
    }, 2000);
  } finally {
    isCreatingCategory.value = false;
  }
}
async function submitExpense() {
  const { valid } = await expenseForm.value.validate();
  if (!valid) return;
  isSavingExpense.value = true;
  submissionState.value = "idle";
  try {
    const total = rawTotalValue.value;
    const installmentsCount = isCreditCardPayment.value
      ? numberOfInstallments.value
      : 1;
    const initialDate = parseISO(selectedExpenseDate.value);
    const expensePromises: Promise<any>[] = [];
    for (let i = 0; i < installmentsCount; i++) {
      const currentDate = addMonths(initialDate, i);
      let categoryId: string;
      if (
        typeof selectedCategory.value === "object" &&
        selectedCategory.value?.id
      ) {
        categoryId = selectedCategory.value.id;
      } else if (typeof selectedCategory.value === "string") {
        categoryId = selectedCategory.value;
      } else {
        throw new Error("Category ID is required");
      }
      const payload = {
        CategoryId: categoryId,
        Value: total / installmentsCount,
        description: description.value || "",
        PaymentMethod: selectedPaymentMethod.value,
        Card: isCreditCardPayment.value ? selectedCard.value : null,
        Installments: installmentsCount,
        Date: `${format(currentDate, "yyyy-MM-dd")}T00:00:00.000Z`,
      };
      expensePromises.push(expensesStore.addExpense(payload));
    }
    await Promise.all(expensePromises);
    successMessage.value = "Gasto salvo com sucesso!";
    submissionState.value = "success";

    setTimeout(() => {
      resetForm();
      submissionState.value = "idle";
      successMessage.value = "";
    }, 1500);
  } catch (error) {
    console.error(error);
    errorMessage.value = "Erro ao salvar o gasto. Tente novamente.";
    submissionState.value = "error";
    setTimeout(() => {
      submissionState.value = "idle";
      errorMessage.value = "";
    }, 2000);
  } finally {
    isSavingExpense.value = false;
  }
}
const submitButtonColor = computed(() =>
  submissionState.value === "success"
    ? "success"
    : submissionState.value === "error"
    ? "error"
    : "primary"
);
const submitButtonIcon = computed(() =>
  submissionState.value === "success"
    ? "mdi-check"
    : submissionState.value === "error"
    ? "mdi-alert-circle-outline"
    : "mdi-content-save"
);
const submitButtonText = computed(() =>
  submissionState.value === "success"
    ? "Salvo!"
    : submissionState.value === "error"
    ? "Erro!"
    : "Salvar Gasto"
);
const closeCategoryDialog = () => {
  showCategoryDialog.value = false;
  resetCategoryForm();
};
onMounted(() => {
  categoriesStore.fetchAllCategories();
});
</script>
<style scoped></style>
