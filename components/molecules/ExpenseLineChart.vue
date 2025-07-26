<template>
  <div class="expense-line-chart">
    <Line
      :data="chartData"
      :options="{ responsive: true, maintainAspectRatio: false }"
    />
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
} from "chart.js";
import { computed, defineProps } from "vue";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
);

interface ExpenseDataPoint {
  date: string;
  amount: number;
}

const props = defineProps<{
  data: ExpenseDataPoint[];
  title?: string;
}>();

const chartData = computed(() => {
  return {
    labels: props.data.map((d) => d.date),
    datasets: [
      {
        label: props.title || "Expenses Over Time",
        data: props.data.map((d) => d.amount),
        fill: true,
        borderColor: "#2196f3",
        backgroundColor: "rgba(33, 150, 243, 0.2)",
        tension: 0.5,
        pointBackgroundColor: "#2196f3",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#2196f3",
      },
    ],
  };
});
</script>

<style scoped>
.expense-line-chart {
  height: 320px;
  width: 100%;
  margin: -10px 0;
  transform: scale(1);
  transform-origin: top center;
}
</style>
