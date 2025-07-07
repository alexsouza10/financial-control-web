export interface Expense {
  category: string;
  amount: number;
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
