import { useState } from "react";
import type { ReactElement } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { useMonthlySummary } from "./useDashboard";

interface MonthlyIncomeExpenseChartProps {
    year: number;
    currency: string;
    selectedMonth: number;
    onMonthSelect: (month: number) => void;
}

type ChartRange = 6 | 12;

interface ChartDataItem {
    month: string;
    monthNumber: number;
    income: number;
    expenses: number;
    selected: boolean;
}

interface MonthlyTooltipPayload {
    payload?: ChartDataItem;
}

interface MonthlyChartTooltipProps {
    active?: boolean;
    payload?: readonly MonthlyTooltipPayload[];
    currency: string;
    year: number;
}

const formatCurrency = (amount: number, currency: string, compact = false) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        notation: compact ? "compact" : "standard",
        minimumFractionDigits: compact ? 0 : 2,
        maximumFractionDigits: compact ? 1 : 2,
    }).format(amount);

const fullCurrencyFormatter = (currency: string) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const monthFormatter = new Intl.DateTimeFormat("en", {
    month: "short",
});

const MonthlyChartTooltip = ({
    active,
    payload,
    currency,
    year,
}: MonthlyChartTooltipProps): ReactElement | null => {
    if (!active || !payload?.length) {
        return null;
    }

    const item = payload[0]?.payload;

    if (!item) {
        return null;
    }

    const net = item.income - item.expenses;
    const formatter = fullCurrencyFormatter(currency);

    return (
        <div className="w-max min-w-50 max-w-[calc(100vw-40px)] rounded-xl border border-slate-200 bg-white p-3 shadow-lg sm:min-w-55 sm:p-3.5">
            <h3 className="mb-2.5 text-base font-semibold tracking-tight text-slate-900 sm:text-[17px]">
                {item.month} {year}
            </h3>

            <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 sm:text-sm">
                        <span className="h-2 w-2 shrink-0 rounded-xs bg-emerald-600" />
                        Income
                    </div>

                    <span className="text-sm font-semibold tabular-nums text-slate-900 sm:text-[15px]">
                        {formatter.format(item.income)}
                    </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 sm:text-sm">
                        <span className="h-2 w-2 shrink-0 rounded-xs bg-red-500" />
                        Expenses
                    </div>

                    <span className="text-sm font-semibold tabular-nums text-slate-900 sm:text-[15px]">
                        {formatter.format(item.expenses)}
                    </span>
                </div>
            </div>

            <div className="my-2 border-t border-slate-200" />

            <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-slate-600 sm:text-sm">Net</span>

                <span
                    className={`text-sm font-semibold tabular-nums sm:text-[15px] ${
                        net >= 0 ? "text-emerald-700" : "text-red-600"
                    }`}
                >
                    {net > 0 ? "+" : ""}
                    {formatter.format(net)}
                </span>
            </div>
        </div>
    );
};

const MonthlyIncomeExpenseChart = ({
    year,
    currency,
    selectedMonth,
    onMonthSelect,
}: MonthlyIncomeExpenseChartProps) => {
    const [range, setRange] = useState<ChartRange>(6);

    const monthlyQuery = useMonthlySummary(year);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const chartData: ChartDataItem[] = (monthlyQuery.data ?? [])
        .filter(
            (item) =>
                year < currentYear ||
                (year === currentYear && item.month <= currentMonth),
        )
        .slice(-range)
        .map((item) => ({
            month: monthFormatter.format(new Date(year, item.month - 1, 1)),
            monthNumber: item.month,
            income: item.totalIncome,
            expenses: item.totalExpense,
            selected: item.month === selectedMonth,
        }));

    const handleBarClick = (_data: unknown, index: number) => {
        const item = chartData[index];

        if (item) {
            onMonthSelect(item.monthNumber);
        }
    };

    return (
        <section className="rounded-2xl border border-border bg-white p-5 shadow-xs sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-base font-semibold text-ink-950">
                        Income vs. expenses
                    </h2>
                    <p className="mt-1 text-sm text-ink-500">
                        Click a month to view its summary
                    </p>
                </div>

                <div
                    className="inline-flex w-fit rounded-lg bg-canvas p-1"
                    aria-label="Chart time range"
                >
                    {([6, 12] as const).map((value) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setRange(value)}
                            aria-pressed={range === value}
                            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                                range === value
                                    ? "bg-white text-ink-950 shadow-xs"
                                    : "text-ink-500 hover:text-ink-900"
                            }`}
                        >
                            {value} months
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-6 h-72 w-full">
                {monthlyQuery.isPending ? (
                    <div className="flex h-full items-center justify-center text-sm text-ink-500">
                        Loading chart...
                    </div>
                ) : monthlyQuery.isError ? (
                    <div
                        role="alert"
                        className="flex h-full flex-col items-center justify-center gap-3 text-sm text-neg-600"
                    >
                        <p>Couldn't load monthly data.</p>

                        <button
                            type="button"
                            onClick={() => void monthlyQuery.refetch()}
                            className="font-medium underline underline-offset-2"
                        >
                            Retry
                        </button>
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-ink-500">
                        No monthly data available.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{
                                top: 8,
                                right: 4,
                                left: 4,
                                bottom: 0,
                            }}
                            barGap={4}
                        >
                            <CartesianGrid
                                stroke="var(--color-border)"
                                strokeDasharray="3 3"
                                vertical={false}
                            />

                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tick={{
                                    fontSize: 12,
                                    fill: "var(--color-ink-500)",
                                }}
                            />

                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                width={58}
                                tick={{
                                    fontSize: 11,
                                    fill: "var(--color-ink-500)",
                                }}
                                tickFormatter={(value: number) =>
                                    formatCurrency(value, currency, true)
                                }
                            />

                            <Tooltip
                                content={(props) => (
                                    <MonthlyChartTooltip
                                        active={props.active}
                                        payload={props.payload}
                                        currency={currency}
                                        year={year}
                                    />
                                )}
                                cursor={{
                                    fill: "#e2e8f0",
                                    opacity: 0.5,
                                }}
                            />

                            <Legend
                                position="top"
                                layout="horizontal"
                                wrapperStyle={{
                                    fontSize: 12,
                                    paddingBottom: 16,
                                }}
                                formatter={(value) =>
                                    value === "income" ? "Income" : "Expenses"
                                }
                            />

                            <Bar
                                dataKey="income"
                                name="Income"
                                fill="var(--color-pos-500)"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={28}
                                cursor="pointer"
                                onClick={handleBarClick}
                                shape={(props) => {
                                    const { x, y, width, height, payload } =
                                        props as {
                                            x?: number;
                                            y?: number;
                                            width?: number;
                                            height?: number;
                                            payload?: ChartDataItem;
                                        };

                                    if (
                                        x === undefined ||
                                        y === undefined ||
                                        width === undefined ||
                                        height === undefined
                                    ) {
                                        return <g />;
                                    }

                                    return (
                                        <rect
                                            x={x}
                                            y={y}
                                            width={width}
                                            height={height}
                                            rx={4}
                                            ry={4}
                                            fill="var(--color-pos-500)"
                                            opacity={
                                                payload?.selected ? 1 : 0.65
                                            }
                                        />
                                    );
                                }}
                            />

                            <Bar
                                dataKey="expenses"
                                name="Expenses"
                                fill="var(--color-neg-500)"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={28}
                                cursor="pointer"
                                onClick={handleBarClick}
                                shape={(props) => {
                                    const { x, y, width, height, payload } =
                                        props as {
                                            x?: number;
                                            y?: number;
                                            width?: number;
                                            height?: number;
                                            payload?: ChartDataItem;
                                        };

                                    if (
                                        x === undefined ||
                                        y === undefined ||
                                        width === undefined ||
                                        height === undefined
                                    ) {
                                        return <g />;
                                    }

                                    return (
                                        <rect
                                            x={x}
                                            y={y}
                                            width={width}
                                            height={height}
                                            rx={4}
                                            ry={4}
                                            fill="var(--color-neg-500)"
                                            opacity={
                                                payload?.selected ? 1 : 0.65
                                            }
                                        />
                                    );
                                }}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </section>
    );
};

export default MonthlyIncomeExpenseChart;
