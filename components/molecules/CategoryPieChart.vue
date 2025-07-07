<template>
  <div class="category-pie-chart">
    <Pie
      :data="chartData"
      :options="{ responsive: true, maintainAspectRatio: false }"
    />
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

const chartData = computed(() => {
  return {
    labels: props.data.map((d) => d.category),
    datasets: [
      {
        label: props.title || "Expenses by Category",
        data: props.data.map((d) => d.amount),
        backgroundColor: [
          "#f44336",
          "#2196f3",
          "#4caf50",
          "#ff9800",
          "#9c27b0",
          "#00bcd4",
          "#ffc107",
          "#e91e63",
          "#673ab7",
          "#795548",
        ],
        hoverOffset: 4,
      },
    ],
  };
});
</script>
<style scoped>
.category-pie-chart {
  max-height: 400px;
  width: 100%;
}
</style>
