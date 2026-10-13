import { useMemo, useState, type FormEvent } from "react";
import {
    ArrowDownLeft,
    ArrowLeft,
    ArrowUpRight,
    CalendarDays,
    ChevronDown,
    CircleAlert,
    LoaderCircle,
    ReceiptText,
    Save,
    Trash2,
} from "lucide-react";

import { useCategories } from "../categories/useCategories";
import TransactionCategoryIcon from "./TransactionCategoryIcon";

import type { Transaction, TransactionType } from "../../types/transaction";
import type { Category, CategoryType } from "../../types/category";

export interface TransactionFormValues {
    type: TransactionType;
    amount: string;
    categoryId: string;
    transactionDate: string;
    description: string;
}

interface TransactionFormProps {
    mode: "create" | "edit";
    initialValues?: TransactionFormValues;
    transaction?: Transaction;
    onSubmit: (values: TransactionFormValues) => Promise<void>;
    onCancel: () => void;
    onDelete?: () => void;
    isSaving: boolean;
    isDeleting?: boolean;
    submitError?: string;
}

const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(amount);

const formatDate = (date: string): string => {
    if (!date) return "Select a date";

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const getToday = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

function PreviewDetail({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-4 text-sm">
            <span className="shrink-0 text-ink-500">{label}</span>
            <span className="min-w-0 wrap-break-word text-right font-medium text-ink-800">
                {value}
            </span>
        </div>
    );
}

export default function TransactionForm({
    mode,
    initialValues,
    transaction,
    onSubmit,
    onCancel,
    onDelete,
    isSaving,
    isDeleting = false,
    submitError = "",
}: TransactionFormProps) {
    const [type, setType] = useState<TransactionType>(
        initialValues?.type ?? transaction?.type ?? "EXPENSE",
    );
    const [amount, setAmount] = useState(
        initialValues?.amount ??
            (transaction ? String(transaction.amount) : ""),
    );
    const [categoryId, setCategoryId] = useState(
        initialValues?.categoryId ?? transaction?.categoryId ?? "",
    );
    const [transactionDate, setTransactionDate] = useState(
        initialValues?.transactionDate ??
            transaction?.transactionDate ??
            getToday(),
    );
    const [description, setDescription] = useState(
        initialValues?.description ?? transaction?.description ?? "",
    );
    const [validationError, setValidationError] = useState("");

    const categoriesQuery = useCategories(type as CategoryType);
    const categories = useMemo(
        () => categoriesQuery.data ?? [],
        [categoriesQuery.data],
    );

    const selectedCategory = useMemo(
        () =>
            categories.find((category: Category) => category.id === categoryId),
        [categories, categoryId],
    );

    const numericAmount = Number(amount);
    const isAmountValid =
        amount.trim() !== "" &&
        Number.isFinite(numericAmount) &&
        numericAmount >= 0.01;

    const isFormValid =
        isAmountValid && Boolean(categoryId) && Boolean(transactionDate);

    const isIncome = type === "INCOME";
    const isBusy = isSaving || isDeleting;
    const errorMessage = validationError || submitError;

    const handleTypeChange = (nextType: TransactionType) => {
        if (nextType === type) return;

        setType(nextType);
        setCategoryId("");
        setValidationError("");
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setValidationError("");

        if (!isAmountValid) {
            setValidationError("Enter an amount greater than zero.");
            return;
        }

        if (!categoryId) {
            setValidationError("Please select a category.");
            return;
        }

        if (!transactionDate) {
            setValidationError("Please select a transaction date.");
            return;
        }

        if (description.length > 500) {
            setValidationError("Description must be 500 characters or fewer.");
            return;
        }

        await onSubmit({
            type,
            amount: String(numericAmount),
            categoryId,
            transactionDate,
            description: description.trim(),
        });
    };

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-6 pb-28 sm:px-6 sm:py-8 md:pb-8 lg:px-8">
            <button
                type="button"
                onClick={onCancel}
                className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-ink-500 transition hover:text-brand-700"
            >
                <ArrowLeft size={16} />
                Back to transactions
            </button>

            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
                    {mode === "create" ? "New Transaction" : "Edit Transaction"}
                </h1>
                <p className="mt-2 text-sm text-ink-500 sm:text-base">
                    {mode === "create"
                        ? "Record your income or expenses."
                        : "Update your transaction details below."}
                </p>

                {mode === "edit" && transaction && (
                    <p className="mt-3 text-sm text-ink-500">
                        Created {formatDate(transaction.createdAt.slice(0, 10))}
                        <span className="mx-2 text-ink-300">·</span>
                        ID #{transaction.id.slice(0, 8)}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.85fr)] lg:gap-8">
                <form onSubmit={handleSubmit} noValidate className="min-w-0">
                    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-7">
                        <div className="mb-7">
                            <label className="mb-3 block text-sm font-semibold text-ink-800">
                                Transaction type
                            </label>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleTypeChange("EXPENSE")}
                                    aria-pressed={type === "EXPENSE"}
                                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                                        type === "EXPENSE"
                                            ? "border-neg-600 bg-neg-50 text-neg-700 ring-1 ring-neg-600"
                                            : "border-border bg-canvas text-ink-600 hover:border-neg-300"
                                    }`}
                                >
                                    <ArrowUpRight size={18} />
                                    Expense
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleTypeChange("INCOME")}
                                    aria-pressed={type === "INCOME"}
                                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                                        isIncome
                                            ? "border-pos-600 bg-pos-50 text-pos-700 ring-1 ring-pos-600"
                                            : "border-border bg-canvas text-ink-600 hover:border-pos-300"
                                    }`}
                                >
                                    <ArrowDownLeft size={18} />
                                    Income
                                </button>
                            </div>
                        </div>

                        <div className="mb-7">
                            <label
                                htmlFor="transaction-amount"
                                className="mb-2 block text-sm font-semibold text-ink-800"
                            >
                                Amount
                            </label>

                            <div className="flex items-center rounded-xl border border-border bg-canvas transition focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-100">
                                <span className="pl-4 text-lg font-medium text-ink-400">
                                    ₹
                                </span>
                                <input
                                    id="transaction-amount"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    inputMode="decimal"
                                    required
                                    value={amount}
                                    onChange={(event) =>
                                        setAmount(event.target.value)
                                    }
                                    placeholder="0.00"
                                    className="w-full min-w-0 bg-transparent px-3 py-4 text-xl font-semibold text-ink-900 outline-none placeholder:text-ink-300"
                                />
                            </div>
                            <p className="mt-2 text-xs text-ink-500">
                                Enter the amount in Indian Rupees (INR).
                            </p>
                        </div>

                        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="min-w-0">
                                <label
                                    htmlFor="transaction-category"
                                    className="mb-2 block text-sm font-semibold text-ink-800"
                                >
                                    Category
                                </label>

                                <div className="relative">
                                    <select
                                        id="transaction-category"
                                        value={categoryId}
                                        required
                                        onChange={(event) =>
                                            setCategoryId(event.target.value)
                                        }
                                        disabled={
                                            categoriesQuery.isPending ||
                                            categoriesQuery.isError
                                        }
                                        className="w-full appearance-none rounded-xl border border-border bg-canvas px-4 py-3.5 pr-11 text-sm text-ink-800 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100 disabled:cursor-wait disabled:opacity-60"
                                    >
                                        <option value="">
                                            {categoriesQuery.isPending
                                                ? "Loading categories..."
                                                : "Select a category"}
                                        </option>
                                        {categories.map((category) => (
                                            <option
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        size={17}
                                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-400"
                                    />
                                </div>

                                {categoriesQuery.isError && (
                                    <p
                                        role="alert"
                                        className="mt-2 text-xs text-neg-700"
                                    >
                                        Categories could not be loaded. Please
                                        try again.
                                    </p>
                                )}
                            </div>

                            <div className="min-w-0">
                                <label
                                    htmlFor="transaction-date"
                                    className="mb-2 block text-sm font-semibold text-ink-800"
                                >
                                    Transaction date
                                </label>
                                <div className="relative">
                                    <input
                                        id="transaction-date"
                                        type="date"
                                        required
                                        value={transactionDate}
                                        onChange={(event) =>
                                            setTransactionDate(
                                                event.target.value,
                                            )
                                        }
                                        className="w-full rounded-xl border border-border bg-canvas px-4 py-3.5 text-sm text-ink-800 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                                    />
                                    <CalendarDays
                                        size={17}
                                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-400"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between gap-3">
                                <label
                                    htmlFor="transaction-description"
                                    className="text-sm font-semibold text-ink-800"
                                >
                                    Description
                                </label>
                                <span
                                    className={`text-xs ${
                                        description.length >= 500
                                            ? "text-neg-700"
                                            : "text-ink-400"
                                    }`}
                                >
                                    {description.length}/500
                                </span>
                            </div>

                            <textarea
                                id="transaction-description"
                                rows={4}
                                maxLength={500}
                                value={description}
                                onChange={(event) =>
                                    setDescription(event.target.value)
                                }
                                placeholder="Add a note about this transaction..."
                                className="w-full resize-y rounded-xl border border-border bg-canvas px-4 py-3.5 text-sm leading-6 text-ink-800 outline-none transition placeholder:text-ink-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                            />
                        </div>

                        {errorMessage && (
                            <div
                                role="alert"
                                className="mt-5 flex items-start gap-3 rounded-xl border border-neg-200 bg-neg-50 p-3.5 text-sm text-neg-700"
                            >
                                <CircleAlert
                                    size={18}
                                    className="mt-0.5 shrink-0"
                                />
                                <p>{errorMessage}</p>
                            </div>
                        )}

                        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                            {mode === "edit" && onDelete ? (
                                <button
                                    type="button"
                                    onClick={onDelete}
                                    disabled={isBusy}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-neg-200 px-4 py-3 text-sm font-semibold text-neg-700 transition hover:bg-neg-50 disabled:cursor-not-allowed disabled:opacity-50 sm:justify-start"
                                >
                                    <Trash2 size={17} />
                                    Delete transaction
                                </button>
                            ) : (
                                <span />
                            )}

                            <div className="flex flex-col-reverse gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    disabled={isBusy}
                                    className="rounded-xl border border-border px-5 py-3 text-sm font-semibold text-ink-700 transition hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={
                                        isBusy ||
                                        !isFormValid ||
                                        categoriesQuery.isPending ||
                                        categoriesQuery.isError
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <LoaderCircle
                                            size={17}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <Save size={17} />
                                    )}
                                    {isSaving
                                        ? "Saving..."
                                        : mode === "create"
                                          ? "Create transaction"
                                          : "Save changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>

                <aside className="min-w-0 lg:sticky lg:top-8">
                    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                        <div className="border-b border-border px-5 py-4 sm:px-6">
                            <h2 className="text-base font-semibold text-ink-900">
                                Transaction preview
                            </h2>
                            <p className="mt-1 text-sm text-ink-500">
                                Your changes appear here as you edit.
                            </p>
                        </div>

                        <div className="p-5 sm:p-6">
                            <div
                                className={`rounded-2xl p-5 ${
                                    isIncome ? "bg-pos-50" : "bg-neg-50"
                                }`}
                            >
                                <p
                                    className={`text-sm font-medium ${
                                        isIncome
                                            ? "text-pos-700"
                                            : "text-neg-700"
                                    }`}
                                >
                                    {isIncome
                                        ? "Income amount"
                                        : "Expense amount"}
                                </p>
                                <p
                                    className={`mt-2 wrap-break-word text-3xl font-bold tracking-tight ${
                                        isIncome
                                            ? "text-pos-700"
                                            : "text-neg-700"
                                    }`}
                                >
                                    {isIncome ? "+" : "−"}
                                    {formatCurrency(
                                        Number.isFinite(numericAmount) &&
                                            amount !== ""
                                            ? Math.max(numericAmount, 0)
                                            : 0,
                                    )}
                                </p>
                                <div className="mt-4 flex items-center gap-2 text-xs text-ink-500">
                                    <CalendarDays size={14} />
                                    {formatDate(transactionDate)}
                                </div>
                            </div>

                            <div className="mt-6">
                                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
                                    Transaction details
                                </p>
                                <div className="flex items-center gap-3">
                                    {selectedCategory ? (
                                        <TransactionCategoryIcon
                                            categoryName={selectedCategory.name}
                                            type={type}
                                        />
                                    ) : (
                                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                                            <ReceiptText size={24} />
                                        </span>
                                    )}
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold text-ink-900">
                                            {description.trim() ||
                                                "Untitled transaction"}
                                        </p>
                                        <p className="mt-1 text-sm text-ink-500">
                                            {selectedCategory?.name ??
                                                "No category selected"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 space-y-4 border-t border-border pt-5">
                                <PreviewDetail
                                    label="Type"
                                    value={isIncome ? "Income" : "Expense"}
                                />
                                <PreviewDetail
                                    label="Category"
                                    value={
                                        selectedCategory?.name ?? "Not selected"
                                    }
                                />
                                <PreviewDetail
                                    label="Transaction date"
                                    value={formatDate(transactionDate)}
                                />
                                {mode === "edit" && transaction && (
                                    <PreviewDetail
                                        label="Created"
                                        value={formatDate(
                                            transaction.createdAt.slice(0, 10),
                                        )}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
