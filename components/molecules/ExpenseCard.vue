<template>
  <v-card outlined class="pa-4 text-center" :class="customClass">
    <v-icon :size="60" :color="color" class="mb-2">{{ icon }}</v-icon>
    <v-card-title
      class="text-h6 text-sm-h5 font-weight-bold"
      :class="{ 'd-flex align-center justify-center': !!editIcon }"
    >
      {{ title }}
      <v-icon
        v-if="editIcon"
        small
        class="ml-2 cursor-pointer"
        :color="color"
        @click="$emit('edit-click')"
        :title="editTitle"
      >
        {{ editIcon }}
      </v-icon>
    </v-card-title>
    <v-card-text
      class="text-h5 text-sm-h4 font-weight-bold"
      :class="textColorClass"
    >
      {{ formattedValue }}
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  value: { type: Number, required: true },
  color: { type: String, required: true },
  editable: { type: Boolean, default: false },
  editIcon: { type: String, default: "" },
  editTitle: { type: String, default: "Editar" },
  customClass: { type: String, default: "" },
});

const formattedValue = computed(() => {
  return props.value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
});

const textColorClass = computed(() => {
  if (props.title.toLowerCase() === "sobra") {
    return props.value >= 0 ? "text-teal darken-2" : "text-red darken-2";
  }
  return `text-${props.color.replace(/\s+/g, "-")}`;
});
</script>
