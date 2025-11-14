<template>
  <!-- O template não precisa mudar, apenas renderiza o que o script mandar -->
  <Bar :data="chartData" :options="chartOptions" />
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

// Props atualizadas
const props = defineProps<{
  data: CategoryData[];
  salary: number; 
  // MODIFICADO: idealDistribution agora é opcional
  idealDistribution?: Record<string, number>;
}>();

const theme = useTheme();
const defaultBarColor = computed(() => theme.current.value.colors.primary);

// Lógica de cor (só será usada se as regras estiverem ativadas)
function getRuleColor(percentUsed: number) {
  if (percentUsed < 80) return defaultBarColor.value;
  if (percentUsed < 100) return "#ff9800"; // Laranja
  return "#f44336"; // Vermelho
}

// NOVO: Paleta de cores para quando as regras estão desativadas
const CHART_COLORS = [
  '#42A5F5', // Blue 500
  '#66BB6A', // Green 500
  '#FFA726', // Orange 500
  '#EF5350', // Red 500
  '#AB47BC', // Purple 500
  '#26A69A', // Teal 500
  '#FF7043', // Deep Orange 500
  '#8D6E63', // Brown 500
  '#78909C', // Blue Grey 500
];

// MODIFICADO: chartData agora verifica se as regras estão ativas
const chartData = computed(() => {
  // Verifica se as regras estão ativadas
  const rulesEnabled = !!props.idealDistribution && props.salary > 0;

  const labels: string[] = [];
  const dataValues: number[] = [];
  const colors: string[] = [];

  props.data.forEach((d, index) => { // Adicionado 'index'
    labels.push(d.category);
    dataValues.push(d.amount);

    if (rulesEnabled) {
      // Se regras ativadas, calcula a cor
      const normalize = (text: string) =>
        text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

      // O nome da categoria (d.category) já vem em MAIÚSCULO do 'barChartData'
      const key = normalize(d.category); 
      
      const idealPercent =
        Object.entries(props.idealDistribution!).find( // ! é seguro por causa da flag rulesEnabled
          // Compara chaves normalizadas (ex: 'ESSENCIAIS' com 'essenciais')
          ([name]) => normalize(name) === key
        )?.[1] ?? 0;

      const idealAmount = (props.salary * idealPercent) / 100;
      const percentUsed = idealAmount > 0 ? (d.amount / idealAmount) * 100 : 0;
      
      colors.push(getRuleColor(percentUsed));
    } else {
      // MODIFICADO: Se regras desativadas, usa a paleta de cores
      colors.push(CHART_COLORS[index % CHART_COLORS.length]);
    }
  });

  return {
    labels,
    datasets: [
      {
        label: "Gastos por Categoria", // Label simplificado
        data: dataValues,
        backgroundColor: colors,
      },
    ],
  };
});

// MODIFICADO: chartOptions agora verifica se as regras estão ativas
const chartOptions = computed(() => {
  const rulesEnabled = !!props.idealDistribution && props.salary > 0;

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || ""; // Ex: "ESSENCIAIS"
            const value = context.parsed.y;
            const formattedValue = `R$ ${value.toFixed(2).replace(".", ",")}`;

            if (!rulesEnabled) {
              // Regras DESATIVADAS: Mostra tooltip simples
              return `${label}: ${formattedValue}`;
            }

            // Regras ATIVADAS: Mostra tooltip detalhado
            const normalize = (text: string) =>
              text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

            const key = normalize(label); // ex: "essenciais"
            
            const idealPercent =
              Object.entries(props.idealDistribution!).find( // ! é seguro
                ([name]) => normalize(name) === key
              )?.[1] ?? 0;

            const idealAmount = (props.salary * idealPercent) / 100;
            const percentUsed =
              idealAmount > 0 ? ((value / idealAmount) * 100).toFixed(1) : "0.0";

            const status =
              parseFloat(percentUsed) < 100 ? "Dentro da meta" : "Acima da meta";

            return `${label}: ${formattedValue} — ${percentUsed}% da meta (${status})`;
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
});
</script>