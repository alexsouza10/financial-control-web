export const formatMonthYear = (monthYear: string) => {
  const [year, month] = monthYear.split("-");
  const date = new Date(+year, +month - 1);
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
};

export const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
