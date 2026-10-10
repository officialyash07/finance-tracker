export type TransactionType = "INCOME" | "EXPENSE";

export interface Transaction {
    id: string;
    categoryId: string;
    categoryName: string;
    type: TransactionType;
    amount: number;
    description: string;
    transactionDate: string;
    createdAt: string;
    updatedAt: string;
}
