import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
    deleteTransaction,
    getTransactionById,
    updateTransaction,
    createTransaction,
} from "./transactionApi";

import type {
    TransactionUpdateRequest,
    TransactionCreateRequest,
} from "./transactionApi";

export const useTransaction = (transactionId: string) =>
    useQuery({
        queryKey: ["transaction", transactionId],
        queryFn: ({ signal }) => getTransactionById(transactionId, signal),
        enabled: Boolean(transactionId),
        retry: false,
    });

export const useUpdateTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            transactionId,
            request,
        }: {
            transactionId: string;
            request: TransactionUpdateRequest;
        }) => updateTransaction(transactionId, request),

        onSuccess: async (updatedTransaction) => {
            queryClient.setQueryData(
                ["transaction", updatedTransaction.id],
                updatedTransaction,
            );

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["transactions"],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["dashboard"],
                }),
            ]);
        },
    });
};

export const useCreateTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: TransactionCreateRequest) =>
            createTransaction(request),

        onSuccess: async (createdTransaction) => {
            queryClient.setQueryData(
                ["transaction", createdTransaction.id],
                createdTransaction,
            );

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["transactions"],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["dashboard"],
                }),
            ]);
        },
    });
};

export const useDeleteTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (transactionId: string) => deleteTransaction(transactionId),

        onSuccess: async (_, transactionId) => {
            queryClient.removeQueries({
                queryKey: ["transaction", transactionId],
            });

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["transactions"],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["dashboard"],
                }),
            ]);
        },
    });
};
