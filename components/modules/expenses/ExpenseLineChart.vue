<template>
  <v-card elevation="3">
    <v-card-title class="justify-center">{{ title }}</v-card-title>
    <v-card-text class="d-flex" style="height: 360px">
      <Line :data="chartData" :options="chartOptions" />
    </v-card-text>
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
const props = defineProps<{ data: ExpenseDataPoint[]; title?: string }>();

const theme = useTheme();
const isDark = computed(() => theme.global.name.value === "dark");

const parseColorToRgba = (color: string, alpha: number) => {
  if (color.startsWith("rgb")) {
    const [r, g, b] = color.match(/\d+/g)!.map(Number);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  if (color.startsWith("#")) {
    let hex = color.slice(1);
    if (hex.length === 3)
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return `rgba(0,0,0,${alpha})`;
};

const blueGradientColor = "#42A5F5";

const primaryColor = computed(() => {
  if (process.client) {
    return (
      getComputedStyle(document.documentElement)
        .getPropertyValue("--v-theme-primary")
        .trim() || "#1976D2"
    );
  }
  return "#1976D2";
});

const chartData = computed(() => {
  const color = isDark.value ? blueGradientColor : primaryColor.value;

  return {
    labels: props.data.map((d) => d.date),
    datasets: [
      {
        label: props.title || "Gastos ao Longo do Tempo",
        data: props.data.map((d) => d.amount),
        fill: true,
        borderColor: color,
        backgroundColor: (ctx: any) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(
            0,
            parseColorToRgba(color, isDark.value ? 0.6 : 0.25)
          );
          gradient.addColorStop(1, parseColorToRgba(color, 0));
          return gradient;
        },
        tension: 0.4,
        pointBackgroundColor: isDark.value ? "#FFFFFF" : color,
        pointBorderColor: color,
        pointHoverBackgroundColor: isDark.value ? color : "#FFFFFF",
        pointHoverBorderColor: color,
        pointRadius: isDark.value ? 6 : 4,
        pointHoverRadius: isDark.value ? 8 : 6,
        borderWidth: isDark.value ? 3 : 2,
      },
    ],
  };
});

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "nearest", intersect: false },
  plugins: {
    legend: {
      display: true,
      position: "top",
      labels: {
        color: isDark.value ? "#FFFFFF" : "#000000",
        font: { size: 12 },
        padding: 20,
      },
    },
    tooltip: {
      backgroundColor: isDark.value ? "#424242" : "#FFFFFF",
      titleColor: isDark.value ? "#FFFFFF" : "#000000",
      bodyColor: isDark.value ? "#E0E0E0" : "#424242",
      borderColor: isDark.value ? "#616161" : "#E0E0E0",
      borderWidth: 1,
      padding: 10,
      usePointStyle: true,
      callbacks: {
        label: (ctx: { parsed: { y: number } }) =>
          `R$ ${ctx.parsed.y.toFixed(2).replace(".", ",")}`,
      },
    },
  },
  scales: {
    x: {
      grid: {
        color: isDark.value ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
        drawBorder: false,
      },
      ticks: { color: isDark.value ? "#FFFFFF" : "#000000" },
    },
    y: {
      grid: {
        color: isDark.value ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
        drawBorder: false,
      },
      ticks: {
        color: isDark.value ? "#FFFFFF" : "#000000",
        callback: (v) => `R$ ${v}`,
      },
      beginAtZero: true,
    },
  },
  elements: { line: { borderJoinStyle: "round", borderCapStyle: "round" } },
}));
</script>
