<template>
  <v-card elevation="3">
    <v-card-title class="justify-center">{{ title }}</v-card-title>
    <v-card-text class="d-flex" style="height: 360px">
      <Bar :data="chartData" :options="chartOptions" />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { computed, defineProps } from "vue";
import { useCategoriesStore } from "~/stores/useCategoriesStore";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

interface CategoryData {
  category: string;
  amount: number;
  categoryId: string;
}

const props = defineProps<{
  data: CategoryData[];
  title?: string;
}>();

const categoriesStore = useCategoriesStore();

const backgroundColors = [
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
  "#8bc34a",
  "#ffeb3b",
  "#03a9f4",
  "#e57373",
  "#ba68c8",
  "#4dd0e1",
  "#ffb74d",
  "#f06292",
  "#9575cd",
  "#a1887f",
  "#aed581",
  "#fff176",
  "#81d4fa",
  "#f8bbd0",
  "#d1c4e9",
];

const chartData = computed(() => {
  const allCategoriesMap = new Map<string, number>();
  categoriesStore.categories.forEach((cat) => {
    allCategoriesMap.set(cat.name, 0);
  });

  props.data.forEach((d) => {
    if (allCategoriesMap.has(d.category)) {
      allCategoriesMap.set(d.category, d.amount);
    }
  });

  const labels = Array.from(allCategoriesMap.keys());
  const dataValues = Array.from(allCategoriesMap.values());
  const hasOnlyZeros = dataValues.every((v) => v === 0);

  if (hasOnlyZeros) {
    return {
      labels: ["Sem despesas"],
      datasets: [
        {
          label: "Despesas por Categoria",
          data: [1],
          backgroundColor: ["#e0e0e0"],
        },
      ],
    };
  }

  return {
    labels: labels,
    datasets: [
      {
        label: props.title || "Despesas por Categoria",
        data: dataValues,
        backgroundColor: backgroundColors,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
      position: "right" as const,
      align: "start" as const,
      labels: {
        boxWidth: 12,
        padding: 12,
      },
    },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          const label = context.label || "";
          const value = context.parsed.y;
          const total = context.dataset.data.reduce(
            (a: number, b: number) => a + b,
            0
          );
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
          return `${label}: R$ ${value
            .toFixed(2)
            .replace(".", ",")} (${percentage}%)`;
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};
</script>

<style scoped></style>
