<template>
  <v-card 
    class="h-100 position-relative overflow-visible"
    :class="[customClass, 'elevation-hover', { 'has-edit': editIcon }]"
    :color="isDark ? 'surface-lighten1' : 'white'"
    :elevation="isDark ? 1 : 2"
  >
    <!-- Efeito de brilho sutil -->
    <div v-if="!isDark" class="card-glow" :style="glowStyle"></div>
    
    <!-- Conteúdo do card -->
    <div class="card-content pa-3">
      <!-- Cabeçalho com ícone e título -->
      <div class="d-flex align-center mb-2">
        <v-avatar 
          :color="getAvatarColor"
          size="36" 
          class="elevation-2 mr-2"
          :variant="isDark ? 'tonal' : 'flat'"
        >
          <v-icon :size="20" color="white">{{ icon }}</v-icon>
        </v-avatar>
        
        <span 
          class="text-subtitle-2 font-weight-medium text-uppercase letter-spacing-1"
          :class="cardColors.textPrimary"
        >
          {{ title }}
        </span>
        
        <v-spacer></v-spacer>
        
        <v-btn
          v-if="editIcon"
          icon
          variant="text"
          size="x-small"
          :color="color"
          class="ml-1 edit-btn"
          @click.stop="$emit('edit-click')"
          :title="editTitle"
        >
          <v-icon size="16">{{ editIcon }}</v-icon>
        </v-btn>
      </div>
      
      <!-- Valor -->
      <div 
        class="text-h6 font-weight-bold mt-1 transition-swing"
        :class="[textColorClass, { 'pulse': isUpdating }]"
        :style="{ 'font-family': 'Roboto Mono, monospace' }"
      >
        {{ formattedValue }}
      </div>
      
      <!-- Barra de progresso para saldo -->
      <v-progress-linear
        v-if="showProgress"
        :model-value="progressValue"
        :color="progressColor"
        height="4"
        class="mt-2 mb-0"
        rounded
      ></v-progress-linear>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useTheme } from 'vuetify';

const theme = useTheme();
const isDark = computed(() => theme.global.current.value.dark);

const props = defineProps({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  value: { type: Number, required: true },
  color: { type: String, required: true },
  maxValue: { type: Number, default: null },
  editable: { type: Boolean, default: false },
  editIcon: { type: String, default: "" },
  editTitle: { type: String, default: "Editar" },
  customClass: { type: String, default: "" },
});

const isUpdating = ref(false);
const displayValue = ref(props.value);

// Anima a mudança de valor
watch(() => props.value, (newVal, oldVal) => {
  if (oldVal !== undefined && oldVal !== newVal) {
    isUpdating.value = true;
    
    // Animação de contagem
    const duration = 800;
    const start = oldVal;
    const change = newVal - oldVal;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function para suavizar a animação
      const easeOutQuad = (t: number) => t * (2 - t);
      const currentValue = start + change * easeOutQuad(progress);
      
      displayValue.value = currentValue;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        isUpdating.value = false;
      }
    };
    
    requestAnimationFrame(animate);
  }
}, { immediate: true });

const formattedValue = computed(() => {
  return displayValue.value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
});

const textColorClass = computed(() => {
  const title = props.title.toLowerCase();
  if (title.includes("saldo") || title.includes("sobra")) {
    return "text-warning";
  } else if (title.includes("total")) {
    return "text-error";
  } else if (title.includes("salário") || title.includes("salario")) {
    return "text-success";
  }
  return `text-${props.color}`;
});

// Cores baseadas no tema
const cardColors = computed(() => ({
  salary: 'success',
  total: 'error',
  balance: 'warning',
  textPrimary: isDark.value ? 'text-white' : 'text-grey-darken-4',
  textSecondary: isDark.value ? 'text-grey-lighten-1' : 'text-grey-darken-1',
  background: isDark.value ? 'surface-lighten1' : 'white'
}));

// Estilo do brilho
const glowStyle = computed(() => {
  if (isDark.value) return {};
  return {
    'background': `radial-gradient(circle at 50% 0%, ${lightenColor(props.color, 20)} 0%, transparent 70%)`
  };
});

// Cor do avatar baseado no tipo de card
const getAvatarColor = computed(() => {
  const title = props.title.toLowerCase();
  if (title.includes('salário') || title.includes('salario')) return 'success';
  if (title.includes('total')) return 'error';
  if (title.includes('saldo')) return 'warning';
  return 'primary';
});

// Cor da barra de progresso
const progressColor = computed(() => {
  const title = props.title.toLowerCase();
  if (title.includes('saldo')) return 'warning';
  if (title.includes('total')) return 'error';
  if (title.includes('salário') || title.includes('salario')) return 'success';
  return 'primary';
});

// Mostrar barra de progresso para saldo ou quando maxValue estiver definido
const showProgress = computed(() => {
  const title = props.title.toLowerCase();
  return title.includes('saldo') || title.includes('sobra') || props.maxValue !== null;
});

// Valor da barra de progresso
const progressValue = computed(() => {
  if (props.maxValue !== null) {
    return Math.min((displayValue.value / props.maxValue) * 100, 100);
  }
  
  // Para o saldo, mostra o progresso baseado no salário
  if (props.title.toLowerCase().includes('saldo') || props.title.toLowerCase().includes('sobra')) {
    const percentage = (Math.abs(displayValue.value) / Math.max(1, Math.abs(props.maxValue || 1))) * 100;
    return Math.min(percentage, 100);
  }
  
  return 0;
});

// Funções auxiliares para manipulação de cores
function lightenColor(color: string, percent: number) {
  // Implementação simplificada - em um caso real, use uma biblioteca como tinycolor2
  return color;
}

function darkenColor(color: string, percent: number) {
  // Implementação simplificada - em um caso real, use uma biblioteca como tinycolor2
  return color;
}
</script>

<style scoped>
.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  opacity: 0.1;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.v-card {
  border-radius: 12px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
}

.v-card.elevation-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.v-card.elevation-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1) !important;
}

.v-card.has-edit:hover .edit-btn {
  opacity: 1;
}

.edit-btn {
  opacity: 0.7;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.edit-btn:hover {
  opacity: 1 !important;
  transform: scale(1.1);
}

.pulse {
  animation: pulse 0.8s ease-in-out;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* Melhorias de responsividade */
@media (max-width: 600px) {
  .card-content {
    padding: 12px !important;
  }
  
  .v-card-title {
    font-size: 0.7rem !important;
  }
  
  .v-card-text {
    font-size: 1rem !important;
  }
}
</style>
