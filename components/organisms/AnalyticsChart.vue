<template>
  <v-card class="pa-4 h-100" elevation="2">
    <v-card-title class="d-flex justify-space-between align-center">
      <span>Análise de Gastos</span>
      <v-menu>
        <template v-slot:activator="{ props: menuProps }">
          <v-btn
            color="primary"
            variant="text"
            v-bind="menuProps"
          >
            {{ timeRangeText }}
            <v-icon right>mdi-chevron-down</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="(range, i) in timeRanges"
            :key="i"
            @click="selectedRange = range.value"
          >
            <v-list-item-title>{{ range.text }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-card-title>
    <v-card-text>
      <div class="chart-container" style="height: 300px; position: relative">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { Chart, registerables } from 'chart.js';
import { useExpensesStore } from '~/stores/useExpensesStore';

Chart.register(...registerables);

const store = useExpensesStore();
const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

const timeRanges = [
  { text: 'Últimos 7 dias', value: 7 },
  { text: 'Últimos 30 dias', value: 30 },
  { text: 'Últimos 90 dias', value: 90 },
  { text: 'Este mês', value: 'current_month' },
];

const selectedRange = ref<number | string>(30);

const timeRangeText = computed(() => {
  return timeRanges.find(r => r.value === selectedRange.value)?.text || 'Selecionar período';
});

const processChartData = () => {
  const now = new Date();
  let labels: string[] = [];
  let data: number[] = [];
  let daysToShow = 0;

  if (selectedRange.value === 'current_month') {
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    daysToShow = Math.min(now.getDate(), daysInMonth);
    
    for (let i = 1; i <= daysToShow; i++) {
      labels.push(`${i}/${now.getMonth() + 1}`);
    }
    
    data = Array(daysToShow).fill(0);
  } else {
    daysToShow = selectedRange.value as number;
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(`${date.getDate()}/${date.getMonth() + 1}`);
    }
    
    data = Array(daysToShow).fill(0);
  }

  store.expenses.forEach(expense => {
    try {
      const expenseDate = new Date(expense.date);
      const today = new Date();
      
      if (selectedRange.value === 'current_month') {
        if (expenseDate.getMonth() === today.getMonth() && 
            expenseDate.getFullYear() === today.getFullYear()) {
          const dayIndex = expenseDate.getDate() - 1;
          if (dayIndex >= 0 && dayIndex < data.length) {
            data[dayIndex] += expense.value;
          }
        }
      } else {
        const daysAgo = Math.floor((today.getTime() - expenseDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysAgo >= 0 && daysAgo < daysToShow) {
          const dayIndex = daysToShow - 1 - daysAgo;
          if (dayIndex >= 0 && dayIndex < data.length) {
            data[dayIndex] += expense.value;
          }
        }
      }
    } catch (error) {
      console.error('Error processing expense date:', error);
    }
  });

  return { labels, data };
};

const updateChart = () => {
  if (!chartCanvas.value) return;

  const { labels, data } = processChartData();
  
  if (chart) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
    return;
  }

  const ctx = chartCanvas.value.getContext('2d');
  if (!ctx) return;

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Gastos (R$)',
          data,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          borderRadius: 4,
          barPercentage: 0.8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.05)',
          },
          ticks: {
            callback: (value) => `R$ ${value}`,
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.parsed.y;
              return `R$ ${value.toFixed(2)}`;
            },
          },
        },
        legend: {
          display: false,
        },
      },
    },
  });
};

watch(() => [store.expenses, selectedRange.value], () => {
  updateChart();
}, { deep: true });

onMounted(() => {
  updateChart();
  window.addEventListener('resize', updateChart);
});

onBeforeUnmount(() => {
  if (chart) {
    chart.destroy();
    chart = null;
  }
  window.removeEventListener('resize', updateChart);
});
</script>

<style scoped>
.chart-container {
  position: relative;
  margin: auto;
  width: 100%;
}
</style>
