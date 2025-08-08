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

const theme = useTheme();

const props = defineProps<{
  data: ExpenseDataPoint[];
  title?: string;
}>();

function parseColorToRgba(color: string, alpha: number): string {
  color = color.trim();

  if (color.startsWith("rgb")) {
    const nums = color.match(/\d+/g);
    if (nums && nums.length >= 3) {
      const [r, g, b] = nums.map(Number);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }

  if (color.startsWith("#")) {
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((char) => char + char)
        .join("");
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  return `rgba(0,0,0,${alpha})`;
}

const chartData = computed(() => {
  const isDark = theme.global.current.value.dark;

  const primaryColor = isDark
    ? "#42A5F5"
    : getComputedStyle(document.documentElement)
        .getPropertyValue("--v-theme-primary")
        .trim() || "#1976D2";

  return {
    labels: props.data.map((d) => d.date),
    datasets: [
      {
        label: props.title || "Gastos ao Longo do Tempo",
        data: props.data.map((d) => d.amount),
        fill: true,
        borderColor: primaryColor,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, parseColorToRgba(primaryColor, isDark ? 0.4 : 0.25));
          gradient.addColorStop(1, parseColorToRgba(primaryColor, 0));
          return gradient;
        },
        tension: 0.4,
        pointBackgroundColor: primaryColor,
        pointBorderColor: isDark ? "#1E1E1E" : "#FFFFFF",
        pointHoverBackgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
        pointHoverBorderColor: primaryColor,
        pointRadius: isDark ? 5 : 4,
        pointHoverRadius: isDark ? 7 : 6,
        borderWidth: isDark ? 3 : 2,
      },
    ],
  };
});

interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  interaction: {
    mode: "nearest";
    intersect: boolean;
  };
  plugins: {
    legend: {
      display: boolean;
      position: "top";
      labels: {
        color: string;
        font: {
          size: number;
        };
        padding: number;
      };
    };
    tooltip: {
      backgroundColor: string;
      titleColor: string;
      bodyColor: string;
      borderColor: string;
      borderWidth: number;
      padding: number;
      usePointStyle: boolean;
      callbacks: {
        label: (context: { parsed: { y: number } }) => string;
      };
    };
  };
  scales: {
    x: {
      grid: {
        color: string;
        drawBorder: boolean;
      };
      ticks: {
        color: string;
      };
    };
    y: {
      grid: {
        color: string;
        drawBorder: boolean;
      };
      ticks: {
        color: string;
        callback: (value: string | number) => string;
      };
      beginAtZero: boolean;
    };
  };
  elements: {
    line: {
      borderJoinStyle: "round";
      borderCapStyle: "round";
    };
  };
}

const chartOptions = computed<ChartOptions>(() => {
  const isDark = theme.global.current.value.dark;

  return {
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
          color: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
          font: {
            size: 12,
          },
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: isDark ? "#424242" : "#FFFFFF",
        titleColor: isDark ? "#FFFFFF" : "#000000",
        bodyColor: isDark ? "#E0E0E0" : "#424242",
        borderColor: isDark ? "#616161" : "#E0E0E0",
        borderWidth: 1,
        padding: 12,
        usePointStyle: true,
        callbacks: {
          label: (context) =>
            `R$ ${context.parsed.y.toFixed(2).replace(".", ",")}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
          drawBorder: false,
        },
        ticks: {
          color: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
        },
      },
      y: {
        grid: {
          color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
          drawBorder: false,
        },
        ticks: {
          color: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
          callback: (value) => `R$ ${value}`,
        },
        beginAtZero: true,
      },
    },
    elements: {
      line: {
        borderJoinStyle: "round",
        borderCapStyle: "round",
      },
    },
  };
});
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
</style>
