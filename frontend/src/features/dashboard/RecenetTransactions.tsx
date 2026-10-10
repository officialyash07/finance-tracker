import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useRecentTransactions } from "./useDashboard";
import type { Transaction } from "../../types/transaction";
import TransactionCategoryIcon from "../transactions/TransactionCategoryIcon";

interface RecentTransactionsProps {
    currency: string;
}

const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
    }).format(amount);

const formatDate = (date: string) =>
    new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
    }).format(new Date(`${date}T00:00:00`));

const RecentTransactions = ({ currency }: RecentTransactionsProps) => {
    const navigate = useNavigate();
    const query = useRecentTransactions(6);

    const handleTransactionClick = (transaction: Transaction) => {
        navigate(`/transactions/${transaction.id}/edit`);
    };

    return (
        <section className="min-w-0 overflow-hidden rounded-2xl border border-border bg-white shadow-xs">
            <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-5 sm:px-6">
                <h2 className="text-base font-semibold text-ink-950 sm:text-lg">
                    Recent transactions
                </h2>

                <button
                    type="button"
                    onClick={() => navigate("/transactions")}
                    className="inline-flex shrink-0 items-center cursor-pointer gap-1 rounded-xl px-4 py-3 text-sm font-medium text-ink-900 transition-colors duration-200 hover:bg-[#eef1f4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-700"
                >
                    View all
                    <ChevronRight size={17} />
                </button>
            </header>

            {query.isPending ? (
                <div className="space-y-4 p-5 sm:p-6">
                    {Array.from({ length: 5 }, (_, index) => (
                        <div
                            key={index}
                            className="flex animate-pulse items-center gap-4"
                        >
                            <div className="h-12 w-12 shrink-0 rounded-xl bg-canvas" />
                            <div className="min-w-0 flex-1 space-y-2">
                                <div className="h-4 w-36 rounded bg-canvas" />
                                <div className="h-3 w-28 rounded bg-canvas" />
                            </div>
                            <div className="h-4 w-20 rounded bg-canvas" />
                        </div>
                    ))}
                </div>
            ) : query.isError ? (
                <div className="p-6 text-sm text-neg-600" role="alert">
                    <p>Couldn't load recent transactions.</p>
                    <button
                        type="button"
                        onClick={() => void query.refetch()}
                        className="mt-2 font-medium underline underline-offset-2"
                    >
                        Try again
                    </button>
                </div>
            ) : query.data.length === 0 ? (
                <div className="px-5 py-12 text-center sm:px-6">
                    <p className="text-sm font-medium text-ink-800">
                        No transactions yet
                    </p>
                    <p className="mt-1 text-sm text-ink-500">
                        Add your first transaction to see it here.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate("/transactions/new")}
                        className="mt-4 rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white hover:bg-ink-950"
                    >
                        Add transaction
                    </button>
                </div>
            ) : (
                <div>
                    {query.data.map((transaction) => {
                        const isIncome = transaction.type === "INCOME";

                        return (
                            <button
                                key={transaction.id}
                                type="button"
                                onClick={() =>
                                    handleTransactionClick(transaction)
                                }
                                className="group cursor-pointer flex w-full items-center gap-3 border-b border-border px-5 py-4 text-left transition last:border-b-0 hover:bg-canvas/70 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink-700 sm:gap-4 sm:px-6"
                            >
                                <TransactionCategoryIcon
                                    categoryName={transaction.categoryName}
                                    type={transaction.type}
                                />

                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-semibold text-ink-950 sm:text-base">
                                        {transaction.description?.trim() ||
                                            transaction.categoryName}
                                    </span>

                                    <span className="mt-1 block truncate text-xs text-ink-500 sm:text-sm">
                                        {transaction.categoryName} ·{" "}
                                        {formatDate(
                                            transaction.transactionDate,
                                        )}
                                    </span>
                                </span>

                                <span
                                    className={`shrink-0 text-right text-sm font-semibold tabular-nums sm:text-base ${
                                        isIncome
                                            ? "text-pos-700"
                                            : "text-ink-950"
                                    }`}
                                >
                                    {isIncome ? "+" : "−"}
                                    {formatCurrency(
                                        transaction.amount,
                                        currency,
                                    )}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </section>
    );
};

export default RecentTransactions;
