<template>
 <v-card
  :class="[customClass]"
  rounded="md"
  elevation="2"
  hover
  transition="scale-transition"
 >
  <v-sheet
   v-if="glowStyle"
   :style="glowStyle"
   class="position-absolute top-0 left-0 right-0 h-100 opacity-10 pointer-events-none"
  />

  <v-card-text class="pa-3">
   <div class="d-flex align-center mb-2">
    <v-avatar :color="getAvatarColor" size="36" elevation="2" class="mr-2">
     <v-icon :size="20" color="white">{{ icon }}</v-icon>
    </v-avatar>

    <span
     class="text-subtitle-2 font-weight-medium text-uppercase"
     :class="cardColors.textPrimary"
    >
     {{ title }}
    </span>

    <v-spacer />

    <v-btn
     v-if="editIcon"
     icon
     variant="text"
     size="x-small"
     :color="color"
     class="opacity-70"
     @click.stop="$emit('edit-click')"
     :title="editTitle"
    >
     <v-icon size="16">{{ editIcon }}</v-icon>
    </v-btn>
   </div>

   <div
    class="text-h6 font-weight-bold mt-1 font-mono"
    :class="[textColorClass]"
   >
    {{ formattedValue }}
   </div>

   <v-progress-linear
    v-if="showProgress"
    :model-value="progressValue"
    :color="progressColor"
    height="4"
    class="mt-2 mb-0"
    rounded
   />
  </v-card-text>
 </v-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useTheme } from "vuetify";

const theme = useTheme();

const props = defineProps({
 icon: { type: String, required: true },
 title: { type: String, required: true },
 value: { type: Number, required: true },
 color: { type: String, required: true },
 maxValue: { type: Number, default: null },
 editIcon: { type: String, default: "" },
 editTitle: { type: String, default: "Editar" },
 customClass: { type: String, default: "" },
});

const isUpdating = ref(false);
const displayValue = ref(props.value);

watch(
 () => props.value,
 (newVal, oldVal) => {
  if (oldVal !== undefined && oldVal !== newVal) {
   isUpdating.value = true;
   const duration = 800;
   const start = oldVal;
   const change = newVal - oldVal;
   const startTime = performance.now();

   const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOutQuad = (t: number) => t * (2 - t);
    displayValue.value = start + change * easeOutQuad(progress);

    if (progress < 1) {
     requestAnimationFrame(animate);
    } else {
     isUpdating.value = false;
    }
   };

   requestAnimationFrame(animate);
  }
 },
 { immediate: true }
);

const formattedValue = computed(() =>
 displayValue.value.toLocaleString("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
 })
);

const textColorClass = computed(() => {
 const title = props.title.toLowerCase();
 if (title.includes("saldo") || title.includes("sobra")) return "text-warning";
 if (title.includes("total")) return "text-error";
 if (title.includes("salário") || title.includes("salario"))
  return "text-success";
 return `text-${props.color}`;
});

const glowStyle = computed(() => {
 return {
  background: `radial-gradient(circle at center, ${props.color}, transparent 70%)`,
 };
});

const cardColors = computed(() => ({
 textPrimary: theme.global.current.value.dark
  ? "text-white"
  : `text-${props.color}`,
}));

const getAvatarColor = computed(() => {
 const t = props.title.toLowerCase();
 if (t.includes("salário") || t.includes("salario")) return "success";
 if (t.includes("débito")) return "error";
 if (t.includes("saldo")) return "warning";
 return "primary";
});

const progressColor = computed(() => {
 const t = props.title.toLowerCase();
 if (t.includes("saldo")) return "warning";
 if (t.includes("total") || t.includes("débito") || t.includes("debito"))
  return "error";
 if (t.includes("salário") || t.includes("salario")) return "success";
 return "primary";
});

const showProgress = computed(
 () =>
  props.title.toLowerCase().includes("saldo") ||
  props.title.toLowerCase().includes("sobra") ||
  props.maxValue !== null
);

const progressValue = computed(() => {
 if (props.maxValue !== null) {
  return Math.min((displayValue.value / props.maxValue) * 100, 100);
 }
 return 0;
});
</script>