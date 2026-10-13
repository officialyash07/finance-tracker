import apiClient from "../../api/client";
import type { Transaction, TransactionType } from "../../types/transaction";

export interface TransactionUpdateRequest {
    categoryId: string;
    type: TransactionType;
    amount: number;
    description: string;
    transactionDate: string;
}

export interface TransactionCreateRequest {
    categoryId: string;
    type: TransactionType;
    amount: number;
    description: string;
    transactionDate: string;
}

export interface TransactionPageResponse {
    content: Transaction[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

export interface TransactionFilters {
    type?: TransactionType;
    categoryId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    size?: number;
    sort?: string;
}

export const getTransactions = async (
    filters: TransactionFilters = {},
    signal?: AbortSignal,
): Promise<TransactionPageResponse> => {
    const { page = 0, size = 10, ...filterParams } = filters;

    const response = await apiClient.get<TransactionPageResponse>(
        "/transactions",
        {
            params: {
                ...filterParams,
                page,
                size,
            },
            signal,
        },
    );

    return response.data;
};

export const getAllMatchingTransactions = async (
    filters: Omit<TransactionFilters, "page" | "size"> = {},
    signal?: AbortSignal,
): Promise<Transaction[]> => {
    const pageSize = 100;

    const firstPage = await getTransactions({
        ...filters,
        page: 0,
        size: pageSize,
    }, signal);

    const transactions = [...firstPage.content];

    for (let page = 1; page < firstPage.totalPages; page += 1) {
        const result = await getTransactions({
            ...filters,
            page,
            size: pageSize,
        }, signal);

        transactions.push(...result.content);
    }

    return transactions;
};

export const getTransactionById = async (
    transactionId: string,
    signal?: AbortSignal,
): Promise<Transaction> => {
    const response = await apiClient.get<Transaction>(
        `/transactions/${transactionId}`,
        { signal },
    );

    return response.data;
};

export const createTransaction = async (
    request: TransactionCreateRequest,
): Promise<Transaction> => {
    const response = await apiClient.post<Transaction>(
        "/transactions",
        request,
    );

    return response.data;
};

export const updateTransaction = async (
    transactionId: string,
    request: TransactionUpdateRequest,
): Promise<Transaction> => {
    const response = await apiClient.put<Transaction>(
        `/transactions/${transactionId}`,
        request,
    );

    return response.data;
};

export const deleteTransaction = async (
    transactionId: string,
): Promise<void> => {
    await apiClient.delete(`/transactions/${transactionId}`);
};
