import { useState } from "react";
import {
    Plus,
    Wallet,
    TrendingDown,
    TrendingUp,
    ArrowDownRight,
    ArrowUpRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAppSelector } from "../../store/hooks";
import { formatCurrency } from "../../utils/currency";
import { useDashboardSummary, useMonthlySummary } from "./useDashboard";
import MonthSelector from "./MonthSelector";
import MonthlyIncomeExpenseChart from "./MonthlyIncomeExpenseChart";
import MonthlySummaryCard from "./MonthlySummaryCard";
import RecentTransactions from "./RecenetTransactions";
import SpendingByCategory from "./SpendingByCategory";

const formatMonth = (year: number, month: number, short = true) =>
    new Intl.DateTimeFormat("en", {
        month: short ? "short" : "long",
    }).format(new Date(year, month - 1, 1));

const getPercentageChange = (
    current: number,
    previous: number | undefined,
): number | null => {
    if (previous === undefined || previous < 0) {
        return null;
    }

    if (previous === 0) {
        return current === 0 ? 0 : null;
    }

    return ((current - previous) / previous) * 100;
};

interface MonthlyMetricCardProps {
    type: "income" | "expense";
    month: string;
    amount: number;
    previousAmount: number | undefined;
    currency: string;
    loading: boolean;
    transactionCount: number;
}

const MonthlyMetricCard = ({
    type,
    month,
    amount,
    previousAmount,
    currency,
    loading,
    transactionCount,
}: MonthlyMetricCardProps) => {
    const isIncome = type === "income";

    const percentageChange = getPercentageChange(amount, previousAmount);

    const increased = percentageChange !== null && percentageChange > 0;

    const decreased = percentageChange !== null && percentageChange < 0;

    // An income increase is positive; an expense increase is negative.
    const isFavorable = isIncome ? increased : decreased;

    const badgeColor =
        percentageChange === null
            ? "bg-canvas text-ink-500"
            : isFavorable
              ? "bg-pos-50 text-pos-700"
              : percentageChange === 0
                ? "bg-canvas text-ink-500"
                : "bg-neg-50 text-neg-600";

    return (
        <article className="min-w-0 rounded-2xl border border-border bg-white p-5 shadow-xs transition-shadow hover:shadow-sm sm:p-6 lg:p-7">
            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                            isIncome
                                ? "bg-pos-50 text-pos-700"
                                : "bg-neg-50 text-neg-600"
                        }`}
                    >
                        {isIncome ? (
                            <TrendingDown size={19} />
                        ) : (
                            <TrendingUp size={19} />
                        )}
                    </span>

                    <span className="truncate text-sm font-medium text-ink-700 sm:text-base">
                        {isIncome ? "Income" : "Expenses"} · {month}
                    </span>
                </div>

                <span className="shrink-0 text-xs text-ink-500 sm:text-sm">
                    {loading ? "—" : `${transactionCount} txns`}
                </span>
            </div>

            <div className="mt-7 sm:mt-8">
                {loading ? (
                    <div className="h-9 w-40 animate-pulse rounded-lg bg-canvas sm:h-10" />
                ) : (
                    <p className="wrap-break-word text-3xl font-semibold tracking-tight text-ink-950 sm:text-4xl">
                        <span
                            className={
                                isIncome
                                    ? "mr-1 text-pos-700"
                                    : "mr-1 text-neg-600"
                            }
                        >
                            {isIncome ? "+" : "−"}
                        </span>
                        {formatCurrency(amount, currency)}
                    </p>
                )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                {loading ? (
                    <span className="text-ink-500">Loading comparison…</span>
                ) : percentageChange === null ? (
                    <span className="rounded-full bg-canvas px-2.5 py-1 text-xs font-medium text-ink-500">
                        No previous-month baseline
                    </span>
                ) : (
                    <>
                        <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${badgeColor}`}
                        >
                            {increased ? (
                                <ArrowUpRight size={14} />
                            ) : decreased ? (
                                <ArrowDownRight size={14} />
                            ) : null}
                            {Math.abs(percentageChange).toFixed(1)}%
                        </span>

                        <span className="text-ink-500">vs last month</span>
                    </>
                )}
            </div>
        </article>
    );
};

const DashboardPage = () => {
    const user = useAppSelector((state) => state.auth.user);
    const navigate = useNavigate();

    const [selectedDate, setSelectedDate] = useState(() => {
        const now = new Date();

        return {
            year: now.getFullYear(),
            month: now.getMonth() + 1,
        };
    });

    const summaryQuery = useDashboardSummary();
    const monthlyQuery = useMonthlySummary(selectedDate.year);

    const monthlyData = monthlyQuery.data ?? [];

    const selectedMonth = monthlyData.find(
        (item) => item.month === selectedDate.month,
    );

    const previousMonth =
        selectedDate.month > 1
            ? monthlyData.find((item) => item.month === selectedDate.month - 1)
            : undefined;

    const currency = user?.preferredCurrency || "INR";
    const greetingName = user?.firstName?.trim() || "there";

    const hour = new Date().getHours();

    const greeting =
        hour < 12
            ? "Good morning"
            : hour < 18
              ? "Good afternoon"
              : "Good evening";

    const monthLabel = new Intl.DateTimeFormat("en", {
        month: "long",
        year: "numeric",
    }).format(new Date(selectedDate.year, selectedDate.month - 1, 1));

    const shortMonthLabel = formatMonth(selectedDate.year, selectedDate.month);

    const handleMonthChange = (year: number, month: number) => {
        setSelectedDate({ year, month });
    };

    const isLoading = summaryQuery.isPending || monthlyQuery.isPending;

    const hasError = summaryQuery.isError || monthlyQuery.isError;

    return (
        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
            <header className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl">
                        {greeting}, {greetingName}
                    </h1>

                    <p className="mt-2 text-sm text-ink-500 sm:text-base">
                        Here's where your money stands for {monthLabel}.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <MonthSelector
                        year={selectedDate.year}
                        month={selectedDate.month}
                        onChange={handleMonthChange}
                    />

                    <button
                        type="button"
                        onClick={() => navigate("/transactions/new")}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-ink-900 px-4 text-sm font-medium text-white shadow-xs transition hover:bg-ink-950"
                    >
                        <Plus size={17} />
                        Add transaction
                    </button>
                </div>
            </header>

            {hasError ? (
                <div
                    role="alert"
                    className="rounded-xl border border-neg-100 bg-neg-50 p-5 text-sm text-neg-700"
                >
                    We couldn't load your dashboard. Please refresh and try
                    again.
                    <button
                        type="button"
                        onClick={() => {
                            void summaryQuery.refetch();
                            void monthlyQuery.refetch();
                        }}
                        className="ml-2 font-semibold underline underline-offset-2"
                    >
                        Retry
                    </button>
                </div>
            ) : (
                <section
                    aria-label="Financial summary"
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
                >
                    {/* All-time balance */}
                    <article className="rounded-2xl bg-ink-950 p-6 text-white shadow-xs sm:col-span-2 xl:col-span-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-ink-300">
                                <Wallet size={18} />
                                Total balance
                            </div>

                            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-ink-900">
                                {currency}
                            </span>
                        </div>

                        <div className="mt-7 wrap-break-word text-3xl font-semibold tracking-tight sm:text-4xl">
                            {isLoading
                                ? "Loading..."
                                : formatCurrency(
                                      summaryQuery.data?.balance ?? 0,
                                      currency,
                                  )}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                            <span className="text-ink-300">
                                In{" "}
                                <span className="font-medium text-emerald-300">
                                    {isLoading
                                        ? "—"
                                        : formatCurrency(
                                              summaryQuery.data?.totalIncome ??
                                                  0,
                                              currency,
                                          )}
                                </span>
                            </span>

                            <span className="text-ink-300">
                                Out{" "}
                                <span className="font-medium text-red-300">
                                    {isLoading
                                        ? "—"
                                        : formatCurrency(
                                              summaryQuery.data?.totalExpense ??
                                                  0,
                                              currency,
                                          )}
                                </span>
                            </span>

                            <span className="text-ink-300">All time</span>
                        </div>
                    </article>

                    {/* Selected-month income */}
                    <MonthlyMetricCard
                        type="income"
                        month={shortMonthLabel}
                        amount={selectedMonth?.totalIncome ?? 0}
                        previousAmount={previousMonth?.totalIncome}
                        currency={currency}
                        loading={isLoading}
                        transactionCount={
                            selectedMonth?.incomeTransactionCount ?? 0
                        }
                    />

                    {/* Selected-month expenses */}
                    <MonthlyMetricCard
                        type="expense"
                        month={shortMonthLabel}
                        amount={selectedMonth?.totalExpense ?? 0}
                        previousAmount={previousMonth?.totalExpense}
                        currency={currency}
                        loading={isLoading}
                        transactionCount={
                            selectedMonth?.expenseTransactionCount ?? 0
                        }
                    />
                </section>
            )}

            <div className="mt-6 grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                <MonthlyIncomeExpenseChart
                    year={selectedDate.year}
                    currency={currency}
                    selectedMonth={selectedDate.month}
                    onMonthSelect={(month) =>
                        setSelectedDate((current) => ({
                            ...current,
                            month,
                        }))
                    }
                />

                <MonthlySummaryCard
                    year={selectedDate.year}
                    month={selectedDate.month}
                    currency={currency}
                />
            </div>

            <div className="mt-6 grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
                <RecentTransactions currency={currency} />

                <SpendingByCategory
                    year={selectedDate.year}
                    month={selectedDate.month}
                    currency={currency}
                />
            </div>
        </main>
    );
};

export default DashboardPage;
