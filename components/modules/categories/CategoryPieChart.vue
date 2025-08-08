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
import { useCategoriesStore } from "~/stores/useCategoriesStore";

ChartJS.register(Title, Tooltip, Legend, ArcElement);

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
          hoverOffset: 0,
          tooltip: {
            callbacks: {
              label: () => "Nenhuma despesa no período",
            },
          },
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
        hoverOffset: 10,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "right",
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
          const value = context.parsed;
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
  width: 500px;
  height: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
