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
import { useTheme } from "vuetify";
import { useCategoriesStore } from "~/stores/useCategoriesStore";
import { useExpensesStore } from "~/stores/useExpensesStore";

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
}

const props = defineProps<{
  data: CategoryData[];
  title?: string;
}>();

const categoriesStore = useCategoriesStore();
const expensesStore = useExpensesStore();
const theme = useTheme();

const idealDistribution: Record<string, number> = {
  Essenciais: 55,
  Sonhos: 15,
  Educação: 10,
  Lazer: 10,
  "Reserva de Emergência": 10,
};

function getColor(percentUsed: number) {
  if (percentUsed < 80) return theme.current.value.colors.primary;
  if (percentUsed < 100) return "#ff9800";
  return "#f44336";
}

const chartData = computed(() => {
  const salary = expensesStore.salary || 0;
  if (salary <= 0) {
    return {
      labels: ["Sem salário cadastrado"],
      datasets: [
        {
          label: "Despesas por Categoria",
          data: [1],
          backgroundColor: ["#ccc"],
        },
      ],
    };
  }

  const labels: string[] = [];
  const dataValues: number[] = [];
  const colors: string[] = [];

  props.data.forEach((d) => {
    const normalize = (text: string) =>
      text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    const key = normalize(d.category);
    const idealPercent =
      Object.entries(idealDistribution).find(
        ([name]) => normalize(name) === key
      )?.[1] ?? 0;
    const idealAmount = (salary * idealPercent) / 100;
    const percentUsed = idealAmount > 0 ? (d.amount / idealAmount) * 100 : 0;

    labels.push(d.category);
    dataValues.push(d.amount);
    colors.push(getColor(percentUsed));
  });

  return {
    labels,
    datasets: [
      {
        label: "Uso das Categorias em relação ao Salário",
        data: dataValues,
        backgroundColor: colors,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          const label = context.label || "";
          const value = context.parsed.y;
          const total = context.dataset.data.reduce(
            (a: number, b: number) => a + b,
            0
          );

          const salary = 10000;
          const idealDistribution: Record<string, number> = {
            Essenciais: 55,
            Sonhos: 15,
            Educação: 10,
            Lazer: 10,
            "Reserva de Emergência": 10,
          };

          const normalize = (text: string) =>
            text
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase();

          const key = normalize(label);
          const idealPercent =
            Object.entries(idealDistribution).find(
              ([name]) => normalize(name) === key
            )?.[1] ?? 0;

          const idealAmount = (salary * idealPercent) / 100;
          const percentUsed =
            idealAmount > 0 ? ((value / idealAmount) * 100).toFixed(1) : "0.0";

          const status =
            parseFloat(percentUsed) < 100 ? "Dentro da meta" : "Acima da meta";

          return `${label}: R$ ${value
            .toFixed(2)
            .replace(".", ",")} — ${percentUsed}% da meta (${status})`;
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value: number) =>
          "R$ " + value.toLocaleString("pt-BR", { minimumFractionDigits: 0 }),
      },
    },
  },
};
</script>

<style scoped></style>
