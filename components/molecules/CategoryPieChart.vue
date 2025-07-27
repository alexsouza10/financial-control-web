<template>
  <div class="category-pie-chart-wrapper">
    <div class="chart-container">
      <Pie :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Pie } from "vue-chartjs";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { computed, defineProps } from "vue";

ChartJS.register(Title, Tooltip, Legend, ArcElement);

interface CategoryData {
  category: string;
  amount: number;
}

const props = defineProps<{
  data: CategoryData[];
  title?: string;
}>();

const backgroundColors = [
  "#f44336", "#2196f3", "#4caf50", "#ff9800", "#9c27b0",
  "#00bcd4", "#ffc107", "#e91e63", "#673ab7", "#795548",
];

const chartData = computed(() => ({
  labels: props.data.map(d => d.category),
  datasets: [{
    label: props.title || "Despesas por Categoria",
    data: props.data.map(d => d.amount),
    backgroundColor: backgroundColors,
    hoverOffset: 10,
  }],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'right',  // legenda ao lado direito do gráfico
      align: 'start',
      labels: {
        boxWidth: 12,
        padding: 12,
      },
    },
  },
};
</script>

<style scoped>
.category-pie-chart-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
}

.chart-container {
  width: 500px; /* ajustar conforme necessário para caber legenda */
  height: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
