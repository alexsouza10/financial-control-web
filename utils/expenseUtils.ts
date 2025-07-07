export interface Expense {
  category: string;
  amount: number;
  date: string;
}

export function groupByCategory(
  expenses: Expense[]
): { category: string; amount: number }[] {
  const grouped = expenses.reduce<Record<string, number>>((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});
  return Object.entries(grouped).map(([category, amount]) => ({
    category,
    amount,
  }));
}

export function filterExpensesByDateAndCategory(
  expenses: Expense[],
  startDate: string | null,
  endDate: string | null,
  category: string | null
): Expense[] {
  return expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const isDateInRange =
      (!start || expenseDate >= start) && (!end || expenseDate <= end);

    const isCategoryMatch = !category || expense.category === category;

    return isDateInRange && isCategoryMatch;
  });
}

export function groupExpensesByDate(
  expenses: Expense[]
): { date: string; amount: number }[] {
  const grouped: Record<string, number> = {};

  expenses.forEach((expense) => {
    const dateKey = expense.date;
    grouped[dateKey] = (grouped[dateKey] || 0) + expense.amount;
  });

  return Object.entries(grouped)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getUniqueCategories(expenses: Expense[]): string[] {
  const categories = new Set<string>();
  expenses.forEach((expense) => categories.add(expense.category));
  return Array.from(categories).sort();
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}
