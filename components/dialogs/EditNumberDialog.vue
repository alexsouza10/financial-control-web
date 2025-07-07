<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
    max-width="400px"
  >
    <v-card outlined class="pa-4 text-center elevation-3 mt-6" :class="cardClasses">
      <v-card-title class="text-h6 font-weight-bold">{{ title }}</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="inputValue"
          :type="inputType"
          :label="label"
          variant="outlined"
          hide-details
          density="comfortable"
          :min="min"
          :max="max"
          :step="step"
          :suffix="suffix"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="cancel">Cancelar</v-btn>
        <v-btn :color="confirmColor" @click="save">Salvar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useTheme } from "vuetify";

const props = defineProps({
  modelValue: Boolean,
  value: { type: Number, required: true },
  title: { type: String, default: "Editar valor" },
  label: { type: String, default: "Novo valor" },
  min: { type: Number, default: 0 },
  max: { type: Number, default: Infinity },
  step: { type: Number, default: 1 },
  suffix: { type: String, default: "" },
  inputType: { type: String, default: "number" },
  confirmColor: { type: String, default: "primary" },
});

const emit = defineEmits(["update:modelValue", "update:value"]);

const inputValue = ref(props.value);

// Quando o diálogo abrir, atualiza o inputValue com o valor atual
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      inputValue.value = props.value;
    }
  }
);

// Se o valor externo mudar e o diálogo estiver fechado, atualize inputValue também
watch(
  () => props.value,
  (val) => {
    if (!props.modelValue) {
      inputValue.value = val;
    }
  }
);

const theme = useTheme();
const cardClasses = computed(() =>
  theme.global.current.value.dark ? "bg-darken-3" : "bg-white"
);

function cancel() {
  emit("update:modelValue", false);
}

function save() {
  const val = parseFloat(inputValue.value);
  if (!isNaN(val) && val >= props.min && val <= props.max) {
    emit("update:value", val);
    emit("update:modelValue", false);
  } else {
    alert("Valor inválido ou fora dos limites permitidos");
  }
}
</script>

<style scoped>
.bg-darken-3 {
  background: linear-gradient(to bottom, #1e1e1e, #121212);
  color: white;
}
.bg-white {
  background: white;
  color: black;
}
</style>
