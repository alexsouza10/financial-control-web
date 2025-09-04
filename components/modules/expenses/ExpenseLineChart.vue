<template>
  <v-card elevation="2" class="pa-2">
    <Line v-if="data && data.length" :data="chartData" :options="chartOptions" style="height: 350px" />
  </v-card>
</template>

<script setup lang="ts">
import { Line } from "vue-chartjs";
import { useTheme } from "vuetify";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
  type ChartOptions,
} from "chart.js";
import { computed } from "vue";

// Registra os plugins necessários do Chart.js
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler
);

// Define as propriedades que o componente aceita
interface ExpenseDataPoint {
  date: string;
  amount: number;
}
const props = defineProps<{ 
  data: ExpenseDataPoint[]; 
  title?: string;
}>();

// Acessa o tema atual do Vuetify
const theme = useTheme();

// Define as cores do gráfico baseadas no tema
const chartColors = computed(() => {
  const isDark = theme.current.value.dark;
  const surfaceColor = theme.current.value.colors.surface;

  return {
    isDark,
    // ✅ ALTERAÇÃO: Define a cor da linha como branca ou preta (cinza escuro)
    lineColor: isDark ? '#FFFFFF' : '#212121', 
    pointBgColor: surfaceColor, // Cor de fundo do ponto será a mesma do fundo do card
    pointHoverBgColor: isDark ? '#FFFFFF' : '#212121',
    gridColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
    ticksColor: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
    tooltipBg: isDark ? '#424242' : '#FFFFFF',
    tooltipText: isDark ? '#FFFFFF' : '#424242',
  };
});

// Configuração dos dados do gráfico
const chartData = computed(() => {
  return {
    labels: props.data.map((d) => d.date),
    datasets: [
      {
        label: "Gastos",
        data: props.data.map((d) => d.amount),
        fill: true,
        borderColor: chartColors.value.lineColor,
        // ✅ ALTERAÇÃO: Cria o gradiente branco ou preto
        backgroundColor: (ctx: any) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.height);
          if (chartColors.value.isDark) {
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)'); // Branco com 20% de opacidade
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');  // Branco transparente
          } else {
            gradient.addColorStop(0, 'rgba(33, 33, 33, 0.2)'); // Preto com 20% de opacidade
            gradient.addColorStop(1, 'rgba(33, 33, 33, 0)');   // Preto transparente
          }
          return gradient;
        },
        tension: 0.4,
        pointBackgroundColor: chartColors.value.pointBgColor,
        pointBorderColor: chartColors.value.lineColor,
        pointHoverBackgroundColor: chartColors.value.pointHoverBgColor,
        pointHoverBorderColor: chartColors.value.lineColor,
        pointRadius: 4,
        pointHoverRadius: 7,
        borderWidth: 2.5,
      },
    ],
  };
});

// Configuração das opções visuais do gráfico (continua o mesmo)
const chartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      display: false,
    },
    title: {
        display: true,
        text: props.title,
        color: chartColors.value.ticksColor,
        font: { size: 16 }
    },
    tooltip: {
      backgroundColor: chartColors.value.tooltipBg,
      titleColor: chartColors.value.tooltipText,
      bodyColor: chartColors.value.tooltipText,
      borderColor: chartColors.value.gridColor,
      borderWidth: 1,
      padding: 12,
      usePointStyle: true,
      callbacks: {
        label: (ctx) => `R$ ${ctx.parsed.y.toFixed(2).replace(".", ",")}`,
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: { 
        color: chartColors.value.ticksColor,
        font: { size: 11 }
      },
    },
    y: {
      grid: {
        color: chartColors.value.gridColor,
      },
      ticks: {
        color: chartColors.value.ticksColor,
        callback: (value) => `R$ ${Number(value).toLocaleString('pt-BR')}`,
        font: { size: 11 }
      },
      beginAtZero: true,
    },
  },
}));
</script>