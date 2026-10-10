import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { useCategorySummary } from "./useDashboard";

interface SpendingByCategoryProps {
    year: number;
    month: number;
    currency: string;
}

const CATEGORY_COLORS = [
    "#5965e8",
    "#2aa397",
    "#c94f83",
    "#d09b22",
    "#4298d7",
    "#aeb5c0",
    "#e17b47",
    "#8b69c7",
];

const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
    }).format(amount);

const SpendingByCategory = ({
    year,
    month,
    currency,
}: SpendingByCategoryProps) => {
    const query = useCategorySummary(year, month);

    const categories = (query.data ?? [])
        .filter((category) => category.totalAmount > 0)
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .map((category, index) => ({
            ...category,
            fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
        }));

    const totalSpent = categories.reduce(
        (total, category) => total + category.totalAmount,
        0,
    );

    const visibleCategories = categories.slice(0, 6);

    return (
        <section className="min-w-0 overflow-hidden rounded-2xl border border-border bg-white shadow-xs">
            <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-5 sm:px-6">
                <h2 className="text-base font-semibold text-ink-950 sm:text-lg">
                    Spending by category
                </h2>

                <Link
                    to="/categories"
                    className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-xl px-4 py-3 text-xs font-medium text-ink-900 transition-colors duration-200 hover:bg-[#eef1f4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-700 sm:text-sm"
                >
                    All categories
                    <ChevronRight size={16} />
                </Link>
            </header>

            {query.isPending ? (
                <div
                    className="space-y-4 p-6"
                    aria-label="Loading category spending"
                >
                    <div className="mx-auto h-48 w-48 animate-pulse rounded-full bg-canvas" />

                    {Array.from({ length: 4 }, (_, index) => (
                        <div
                            key={index}
                            className="h-5 animate-pulse rounded bg-canvas"
                        />
                    ))}
                </div>
            ) : query.isError ? (
                <div className="p-6 text-sm text-neg-600" role="alert">
                    <p>Couldn't load category spending.</p>

                    <button
                        type="button"
                        onClick={() => void query.refetch()}
                        className="mt-2 font-medium underline underline-offset-2"
                    >
                        Try again
                    </button>
                </div>
            ) : categories.length === 0 ? (
                <div className="px-5 py-12 text-center sm:px-6">
                    <p className="text-sm font-medium text-ink-800">
                        No spending yet
                    </p>

                    <p className="mt-1 text-sm text-ink-500">
                        Expense categories will appear here when you add
                        transactions.
                    </p>
                </div>
            ) : (
                <div className="p-5 sm:p-6">
                    <div className="relative mx-auto h-52 w-full max-w-70 sm:h-60">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categories}
                                    dataKey="totalAmount"
                                    nameKey="categoryName"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="62%"
                                    outerRadius="92%"
                                    paddingAngle={2}
                                    stroke="none"
                                />

                                <Tooltip
                                    formatter={(value) =>
                                        formatCurrency(Number(value), currency)
                                    }
                                />
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-sm text-ink-500">Spent</span>

                            <span className="mt-1 max-w-[85%] truncate text-xl font-semibold tracking-tight text-ink-950 sm:text-2xl">
                                {formatCurrency(totalSpent, currency)}
                            </span>
                        </div>
                    </div>

                    <div className="mt-5 space-y-3">
                        {visibleCategories.map((category) => {
                            const percentage =
                                totalSpent > 0
                                    ? (category.totalAmount / totalSpent) * 100
                                    : 0;

                            return (
                                <div
                                    key={category.categoryId}
                                    className="flex items-center gap-2 text-sm"
                                >
                                    <span
                                        className="h-3 w-3 shrink-0 rounded-[3px]"
                                        style={{
                                            backgroundColor: category.fill,
                                        }}
                                    />

                                    <span className="min-w-0 flex-1 truncate text-ink-800">
                                        {category.categoryName}
                                    </span>

                                    <span className="shrink-0 text-right font-medium tabular-nums text-ink-950">
                                        {formatCurrency(
                                            category.totalAmount,
                                            currency,
                                        )}
                                    </span>

                                    <span className="w-9 shrink-0 text-right text-ink-500">
                                        {Math.round(percentage)}%
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </section>
    );
};

export default SpendingByCategory;
