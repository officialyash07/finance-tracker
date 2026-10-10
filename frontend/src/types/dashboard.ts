export interface DashboardSummary {
    totalIncome: number;
    totalExpense: number;
    balance: number;
}

export interface MonthlySummary {
    month: number;
    totalIncome: number;
    totalExpense: number;
    balance: number;
    incomeTransactionCount: number;
    expenseTransactionCount: number;
}

export interface CategorySummary {
    categoryId: string;
    categoryName: string;
    totalAmount: number;
}
