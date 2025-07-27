<template>
  <div class="expense-line-chart">
    <h3 class="chart-title">
      {{ props.title }}
    </h3>
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { Line } from "vue-chartjs";
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
} from "chart.js";
import { computed, defineProps } from "vue";


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

interface ExpenseDataPoint {
  date: string;
  amount: number;
}

const props = defineProps<{
  data: ExpenseDataPoint[];
  title?: string;
}>();

// Aqui usamos CSS custom properties do Vuetify para cores
const chartData = computed(() => ({
  labels: props.data.map((d) => d.date),
  datasets: [
    {
      label: props.title || "Expenses Over Time",
      data: props.data.map((d) => d.amount),
      fill: true,
      borderColor: "#1E90FF",
      backgroundColor: "rgba(30, 144, 255, 0.25)",
      tension: 0.4,
      pointBackgroundColor: "#1E90FF",
      pointBorderColor: "#FFFFFF",
      pointHoverBackgroundColor: "#FFFFFF",
      pointHoverBorderColor: "#1E90FF",
      pointRadius: 5,
      pointHoverRadius: 7,
      borderWidth: 3,
    },
  ],
}));
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: "nearest",
    intersect: false,
  },
  plugins: {
    legend: {
      display: true,
      position: "top",
      labels: {
        color: "var(--v-theme-on-surface)", // texto legenda
        font: {
          size: 14,
          weight: "600",
        },
      },
    },
    tooltip: {
      enabled: true,
      backgroundColor: "var(--v-theme-primary)", // tooltip com cor do tema
      titleFont: {
        weight: "bold",
      },
      bodyFont: {
        size: 14,
      },
      callbacks: {
        label: (context) =>
          `R$ ${context.parsed.y.toFixed(2).replace(".", ",")}`,
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: "var(--v-theme-on-surface)", // cor do texto no eixo x
        maxRotation: 45,
        minRotation: 30,
        maxTicksLimit: 8,
      },
      title: {
        display: true,
        text: "Date",
        color: "var(--v-theme-on-surface)",
        font: {
          size: 14,
          weight: "600",
        },
      },
    },
    y: {
      grid: {
        color: "rgba(var(--v-theme-on-surface-rgb), 0.1)", // grade suave
        borderDash: [5, 5],
      },
      ticks: {
        color: "var(--v-theme-on-surface)",
        callback: (value: number) => `R$ ${value.toFixed(2).replace(".", ",")}`,
      },
      title: {
        display: true,
        text: "Amount (R$)",
        color: "var(--v-theme-on-surface)",
        font: {
          size: 14,
          weight: "600",
        },
      },
      beginAtZero: true,
    },
  },
};
</script>

<style scoped>
.expense-line-chart {
  height: 360px;
  width: 100%;
  padding: 8px 16px;
  box-sizing: border-box;
  user-select: none;
  cursor: pointer;
  background: var(--v-theme-surface);
  border-radius: 8px;
  box-shadow: 0 1px 6px rgb(0 0 0 / 0.1);
  display: flex;
  flex-direction: column;
}

.chart-title {
  margin-bottom: 12px;
  color: var(--v-theme-on-surface);
  font-weight: 700;
  font-size: 1.25rem;
  text-align: center;
  user-select: none;
}

.chart-title {
  color: var(--v-theme-on-surface);
}
</style>
