export const formatMonthYear = (monthYear: string) => {
  if (!monthYear) return '';
  const [year, month] = monthYear.split("-");
  if (!year || !month) return '';
  const date = new Date(+year, +month - 1);
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
};

export const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export function formatCurrency(value: number): string {
  return value?.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }) ?? "R$ 0,00";
}
