import { useState } from "react";
import { useNavigate } from "react-router-dom";

import TransactionForm from "./TransactionForm";
import type { TransactionFormValues } from "./TransactionForm";
import { useCreateTransaction } from "./useTransaction";

export default function NewTransactionPage() {
    const navigate = useNavigate();
    const createMutation = useCreateTransaction();
    const [formError, setFormError] = useState("");

    const handleSubmit = async (values: TransactionFormValues) => {
        setFormError("");

        try {
            await createMutation.mutateAsync({
                categoryId: values.categoryId,
                type: values.type,
                amount: Number(values.amount),
                description: values.description,
                transactionDate: values.transactionDate,
            });

            navigate("/transactions");
        } catch {
            setFormError(
                "We couldn't create this transaction. Please check your details and try again.",
            );
            throw new Error("Transaction creation failed");
        }
    };

    return (
        <TransactionForm
            mode="create"
            onSubmit={handleSubmit}
            onCancel={() => navigate("/transactions")}
            isSaving={createMutation.isPending}
            submitError={formError}
        />
    );
}
