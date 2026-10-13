import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CircleAlert, LoaderCircle, Trash2 } from "lucide-react";

import {
    useDeleteTransaction,
    useTransaction,
    useUpdateTransaction,
} from "./useTransaction";

import TransactionForm from "./TransactionForm";
import type { TransactionFormValues } from "./TransactionForm";
import type { Transaction } from "../../types/transaction";

function PageMessage({ title, message }: { title: string; message: string }) {
    return (
        <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
            <span className="mb-4 rounded-2xl bg-surface p-4 text-ink-500">
                <CircleAlert size={28} />
            </span>

            <h1 className="text-xl font-semibold text-ink-900">{title}</h1>
            <p className="mt-2 text-sm text-ink-500">{message}</p>

            <Link
                to="/transactions"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
                Back to transactions
            </Link>
        </div>
    );
}

function EditTransactionPage() {
    const { id } = useParams<{ id: string }>();
    const transactionQuery = useTransaction(id ?? "");

    if (!id) {
        return (
            <PageMessage
                title="Transaction not found"
                message="A transaction ID was not provided."
            />
        );
    }

    if (transactionQuery.isPending) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <LoaderCircle
                    size={30}
                    className="animate-spin text-brand-600"
                />
            </div>
        );
    }

    if (transactionQuery.isError || !transactionQuery.data) {
        return (
            <PageMessage
                title="Unable to load transaction"
                message="The transaction may not exist, or you may not have permission to access it."
            />
        );
    }

    return (
        <EditTransactionEditor
            key={transactionQuery.data.id}
            transaction={transactionQuery.data}
        />
    );
}

function EditTransactionEditor({ transaction }: { transaction: Transaction }) {
    const navigate = useNavigate();
    const updateMutation = useUpdateTransaction();
    const deleteMutation = useDeleteTransaction();

    const [formError, setFormError] = useState("");
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    const handleSubmit = async (values: TransactionFormValues) => {
        setFormError("");

        try {
            await updateMutation.mutateAsync({
                transactionId: transaction.id,
                request: {
                    categoryId: values.categoryId,
                    type: values.type,
                    amount: Number(values.amount),
                    description: values.description,
                    transactionDate: values.transactionDate,
                },
            });

            navigate("/transactions");
        } catch {
            setFormError(
                "We couldn't save your changes. Please check your details and try again.",
            );
            throw new Error("Transaction update failed");
        }
    };

    const handleDelete = async () => {
        setFormError("");

        try {
            await deleteMutation.mutateAsync(transaction.id);
            navigate("/transactions", { replace: true });
        } catch {
            setFormError(
                "We couldn't delete this transaction. Please try again.",
            );
        }
    };

    return (
        <>
            <TransactionForm
                key={transaction.id}
                mode="edit"
                transaction={transaction}
                onSubmit={handleSubmit}
                onCancel={() => navigate("/transactions")}
                onDelete={() => {
                    setFormError("");
                    setShowDeleteConfirmation(true);
                }}
                isSaving={updateMutation.isPending}
                isDeleting={deleteMutation.isPending}
                submitError={formError}
            />

            {showDeleteConfirmation && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !deleteMutation.isPending
                        ) {
                            setShowDeleteConfirmation(false);
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-dialog-title"
                        className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neg-50 text-neg-700">
                            <Trash2 size={22} />
                        </div>

                        <h2
                            id="delete-dialog-title"
                            className="mt-5 text-lg font-bold text-ink-900"
                        >
                            Delete this transaction?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-ink-500">
                            This action cannot be undone. The transaction will
                            be removed from your history and your dashboard
                            totals will be refreshed.
                        </p>

                        {formError && (
                            <p
                                role="alert"
                                className="mt-3 text-sm text-neg-700"
                            >
                                {formError}
                            </p>
                        )}

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                disabled={deleteMutation.isPending}
                                onClick={() => setShowDeleteConfirmation(false)}
                                className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-canvas disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={deleteMutation.isPending}
                                onClick={handleDelete}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-neg-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neg-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {deleteMutation.isPending && (
                                    <LoaderCircle
                                        size={16}
                                        className="animate-spin"
                                    />
                                )}
                                {deleteMutation.isPending
                                    ? "Deleting..."
                                    : "Delete transaction"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default EditTransactionPage;
