import {
    ArrowDownRight,
    ArrowUpRight,
    CalendarDays,
    ChartNoAxesCombined,
    PiggyBank,
    ReceiptText,
    Wallet,
} from "lucide-react";

import { useCategorySummary, useMonthlySummary } from "./useDashboard";

interface MonthlySummaryCardProps {
    year: number;
    month: number;
    currency: string;
}

const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
    }).format(amount);

const formatMonth = (year: number, month: number) =>
    new Intl.DateTimeFormat("en", {
        month: "long",
        year: "numeric",
    }).format(new Date(year, month - 1, 1));

const MonthlySummaryCard = ({
    year,
    month,
    currency,
}: MonthlySummaryCardProps) => {
    const monthlyQuery = useMonthlySummary(year);
    const categoryQuery = useCategorySummary(year, month);

    const monthlyData = monthlyQuery.data?.find((item) => item.month === month);

    const income = monthlyData?.totalIncome ?? 0;
    const expenses = monthlyData?.totalExpense ?? 0;
    const netSaved = income - expenses;

    const savingsRate = income > 0 ? (netSaved / income) * 100 : 0;

    const daysInMonth = new Date(year, month, 0).getDate();
    const daysElapsed =
        year === new Date().getFullYear() && month === new Date().getMonth() + 1
            ? new Date().getDate()
            : daysInMonth;

    const averageDailySpend = daysElapsed > 0 ? expenses / daysElapsed : 0;

    const incomeCount = monthlyData?.incomeTransactionCount ?? 0;
    const expenseCount = monthlyData?.expenseTransactionCount ?? 0;
    const transactionCount = incomeCount + expenseCount;

    const categories = categoryQuery.data ?? [];
    const topCategory = categories.reduce<(typeof categories)[number] | null>(
        (largest, category) => {
            if (!largest || category.totalAmount > largest.totalAmount) {
                return category;
            }

            return largest;
        },
        null,
    );

    const isLoading = monthlyQuery.isPending || categoryQuery.isPending;
    const hasError = monthlyQuery.isError || categoryQuery.isError;

    return (
        <aside
            aria-label={`${formatMonth(year, month)} summary`}
            className="min-w-0 rounded-2xl border border-border bg-white p-5 shadow-xs sm:p-6"
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-base font-semibold text-ink-950">
                        {formatMonth(year, month)} Summary
                    </h2>
                    <p className="mt-1 text-xs text-ink-500">
                        Your monthly financial overview
                    </p>
                </div>

                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-canvas text-ink-700">
                    <ChartNoAxesCombined size={18} />
                </span>
            </div>

            {hasError ? (
                <div
                    role="alert"
                    className="mt-6 rounded-xl border border-neg-100 bg-neg-50 p-4 text-sm text-neg-700"
                >
                    Couldn't load the monthly summary.
                    <button
                        type="button"
                        onClick={() => {
                            void monthlyQuery.refetch();
                            void categoryQuery.refetch();
                        }}
                        className="ml-1 font-semibold underline underline-offset-2"
                    >
                        Retry
                    </button>
                </div>
            ) : isLoading ? (
                <div className="mt-6 space-y-4" aria-label="Loading summary">
                    <div className="h-24 animate-pulse rounded-xl bg-canvas" />
                    <div className="h-16 animate-pulse rounded-xl bg-canvas" />
                    <div className="h-16 animate-pulse rounded-xl bg-canvas" />
                    <div className="h-16 animate-pulse rounded-xl bg-canvas" />
                </div>
            ) : (
                <>
                    {/* Net saved */}
                    <div className="mt-6 rounded-xl bg-ink-950 p-4 text-white">
                        <div className="flex items-center gap-2 text-sm text-ink-300">
                            <PiggyBank size={17} />
                            Net saved
                        </div>

                        <p
                            className={`mt-3 wrap-break-word text-2xl font-semibold tracking-tight sm:text-3xl ${
                                netSaved >= 0
                                    ? "text-emerald-300"
                                    : "text-red-300"
                            }`}
                        >
                            {netSaved > 0 ? "+" : ""}
                            {formatCurrency(netSaved, currency)}
                        </p>

                        <p className="mt-2 text-xs text-ink-300">
                            {netSaved >= 0
                                ? "Remaining after expenses"
                                : "Expenses exceed income"}
                        </p>
                    </div>

                    {/* Income vs expenses */}
                    <div className="mt-6">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-ink-800">
                                Income vs. expenses
                            </span>
                        </div>

                        {(() => {
                            const total = income + expenses;
                            const incomeWidth =
                                total > 0 ? (income / total) * 100 : 0;
                            const expenseWidth =
                                total > 0 ? (expenses / total) * 100 : 0;

                            return (
                                <>
                                    <div
                                        className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-canvas"
                                        role="img"
                                        aria-label={`Income ${formatCurrency(income, currency)}, expenses ${formatCurrency(expenses, currency)}`}
                                    >
                                        {income > 0 && (
                                            <div
                                                className="h-full bg-pos-500 transition-all"
                                                style={{
                                                    width: `${incomeWidth}%`,
                                                }}
                                            />
                                        )}

                                        {expenses > 0 && (
                                            <div
                                                className="h-full border-l-2 border-white bg-neg-500 transition-all"
                                                style={{
                                                    width: `${expenseWidth}%`,
                                                }}
                                            />
                                        )}
                                    </div>

                                    <div className="mt-3 flex items-center justify-between gap-3">
                                        <span className="flex min-w-0 items-center gap-1.5 text-sm text-ink-500">
                                            <span className="h-2.5 w-2.5 shrink-0 rounded-[3px] bg-pos-500" />
                                            In
                                            <span className="truncate font-medium text-ink-950">
                                                {formatCurrency(
                                                    income,
                                                    currency,
                                                )}
                                            </span>
                                        </span>

                                        <span className="flex min-w-0 items-center gap-1.5 text-sm text-ink-500">
                                            <span className="h-2.5 w-2.5 shrink-0 rounded-[3px] bg-neg-500" />
                                            Out
                                            <span className="truncate font-medium text-ink-950">
                                                {formatCurrency(
                                                    expenses,
                                                    currency,
                                                )}
                                            </span>
                                        </span>
                                    </div>
                                </>
                            );
                        })()}
                    </div>

                    <div className="my-5 border-t border-border" />

                    {/* Savings rate */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pos-50 text-pos-700">
                                <Wallet size={17} />
                            </span>
                            <div>
                                <p className="text-sm font-medium text-ink-800">
                                    Savings rate
                                </p>
                                <p className="text-xs text-ink-500">
                                    Of total income
                                </p>
                            </div>
                        </div>

                        <span
                            className={`text-base font-semibold tabular-nums ${
                                savingsRate >= 0
                                    ? "text-pos-700"
                                    : "text-neg-600"
                            }`}
                        >
                            {income > 0 ? `${savingsRate.toFixed(1)}%` : "—"}
                        </span>
                    </div>

                    {/* Average daily spend */}
                    <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neg-50 text-neg-600">
                                <CalendarDays size={17} />
                            </span>
                            <div>
                                <p className="text-sm font-medium text-ink-800">
                                    Average daily spend
                                </p>
                                <p className="text-xs text-ink-500">
                                    {daysElapsed}{" "}
                                    {daysElapsed === 1 ? "day" : "days"} counted
                                </p>
                            </div>
                        </div>

                        <span className="text-right text-sm font-semibold tabular-nums text-ink-950">
                            {formatCurrency(averageDailySpend, currency)}
                        </span>
                    </div>

                    {/* Transaction count */}
                    <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-canvas text-ink-700">
                                <ReceiptText size={17} />
                            </span>
                            <div>
                                <p className="text-sm font-medium text-ink-800">
                                    Transactions
                                </p>
                                <p className="text-xs text-ink-500">
                                    {incomeCount} income · {expenseCount}{" "}
                                    expense
                                </p>
                            </div>
                        </div>

                        <span className="text-base font-semibold tabular-nums text-ink-950">
                            {transactionCount}
                        </span>
                    </div>

                    {/* Largest spending category */}
                    <div className="mt-4 rounded-xl border border-border p-3.5">
                        <div className="flex items-center gap-2 text-xs font-medium text-ink-500">
                            {topCategory && topCategory.totalAmount > 0 ? (
                                <ArrowUpRight size={15} />
                            ) : (
                                <ArrowDownRight size={15} />
                            )}
                            Largest spending category
                        </div>

                        {topCategory && topCategory.totalAmount > 0 ? (
                            <div className="mt-2 flex items-center justify-between gap-3">
                                <span className="min-w-0 truncate text-sm font-semibold text-ink-900">
                                    {topCategory.categoryName}
                                </span>
                                <span className="shrink-0 text-sm font-semibold tabular-nums text-ink-950">
                                    {formatCurrency(
                                        topCategory.totalAmount,
                                        currency,
                                    )}
                                </span>
                            </div>
                        ) : (
                            <p className="mt-2 text-sm text-ink-500">
                                No expenses recorded this month.
                            </p>
                        )}
                    </div>
                </>
            )}
        </aside>
    );
};

export default MonthlySummaryCard;
