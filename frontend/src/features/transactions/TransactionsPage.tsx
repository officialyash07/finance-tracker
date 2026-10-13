import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ArrowDown,
    ArrowDownLeft,
    ArrowDownToLine,
    ArrowUp,
    ArrowUpRight,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    CircleAlert,
    LoaderCircle,
    Pencil,
    Plus,
    Search,
    SlidersHorizontal,
    Trash2,
    X,
} from "lucide-react";

import { useCategories } from "../categories/useCategories";
import TransactionCategoryIcon from "./TransactionCategoryIcon";
import { useDeleteTransaction } from "./useTransaction";

import type { Transaction, TransactionType } from "../../types/transaction";
import type { Category } from "../../types/category";
import {
    getAllMatchingTransactions,
    type TransactionFilters,
} from "./transactionApi";

type DatePreset =
    | "this-month"
    | "last-month"
    | "last-90-days"
    | "year-to-date"
    | "all-time"
    | "custom";

type SortOption =
    | "date-desc"
    | "date-asc"
    | "amount-desc"
    | "amount-asc"
    | "created-desc";

const PAGE_SIZE = 10;

const currency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);

const formatDate = (value: string) =>
    new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

const getLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const getDateRange = (
    preset: DatePreset,
): { fromDate?: string; toDate?: string } => {
    const today = new Date();
    const end = getLocalDate(today);

    if (preset === "all-time" || preset === "custom") {
        return {};
    }

    if (preset === "this-month") {
        return {
            fromDate: getLocalDate(
                new Date(today.getFullYear(), today.getMonth(), 1),
            ),
            toDate: end,
        };
    }

    if (preset === "last-month") {
        return {
            fromDate: getLocalDate(
                new Date(today.getFullYear(), today.getMonth() - 1, 1),
            ),
            toDate: getLocalDate(
                new Date(today.getFullYear(), today.getMonth(), 0),
            ),
        };
    }

    if (preset === "last-90-days") {
        const start = new Date(today);
        start.setDate(start.getDate() - 89);
        return { fromDate: getLocalDate(start), toDate: end };
    }

    return {
        fromDate: `${today.getFullYear()}-01-01`,
        toDate: end,
    };
};

const escapeCsv = (value: unknown): string => {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
};

function downloadCsv(transactions: Transaction[]) {
    const headers = [
        "Description",
        "Category",
        "Type",
        "Transaction Date",
        "Amount",
        "Currency",
    ];

    const rows = transactions.map((transaction) => [
        transaction.description,
        transaction.categoryName,
        transaction.type,
        transaction.transactionDate,
        transaction.amount,
        "INR",
    ]);

    const csv = [headers, ...rows]
        .map((row) => row.map(escapeCsv).join(","))
        .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
        type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `transactions-${getLocalDate(new Date())}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}

function TypeBadge({ type }: { type: TransactionType }) {
    const isIncome = type === "INCOME";

    return (
        <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${
                isIncome
                    ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                    : "border-red-100 bg-red-50 text-red-700"
            }`}
        >
            {isIncome ? (
                <ArrowDownLeft size={13} />
            ) : (
                <ArrowUpRight size={13} />
            )}
            {isIncome ? "Income" : "Expense"}
        </span>
    );
}

function SortSelect({
    value,
    onChange,
}: {
    value: SortOption;
    onChange: (value: SortOption) => void;
}) {
    return (
        <label className="flex min-w-0 items-center gap-2 text-sm text-ink-600">
            <span className="shrink-0">Sort by</span>
            <span className="relative min-w-0 flex-1 sm:flex-none">
                <select
                    value={value}
                    onChange={(event) =>
                        onChange(event.target.value as SortOption)
                    }
                    className="w-full appearance-none rounded-lg border border-border bg-surface py-2 pl-3 pr-9 text-sm font-medium text-ink-800 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 sm:w-44"
                >
                    <option value="date-desc">Newest first</option>
                    <option value="date-asc">Oldest first</option>
                    <option value="amount-desc">Amount: high to low</option>
                    <option value="amount-asc">Amount: low to high</option>
                    <option value="created-desc">Recently created</option>
                </select>
                <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"
                />
            </span>
        </label>
    );
}

function TransactionsPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const deleteMutation = useDeleteTransaction();

    const [search, setSearch] = useState("");
    const [type, setType] = useState<"ALL" | TransactionType>("ALL");
    const [categoryId, setCategoryId] = useState("");
    const [datePreset, setDatePreset] = useState<DatePreset>("all-time");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [sort, setSort] = useState<SortOption>("date-desc");
    const [page, setPage] = useState(0);

    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
    const [actionError, setActionError] = useState("");

    const categoriesQuery = useCategories();

    const activeDateRange = useMemo(() => {
        if (datePreset === "custom") {
            return {
                fromDate: fromDate || undefined,
                toDate: toDate || undefined,
            };
        }

        return getDateRange(datePreset);
    }, [datePreset, fromDate, toDate]);

    const filters = useMemo<TransactionFilters>(
        () => ({
            ...(type === "ALL" ? {} : { type }),
            ...(categoryId ? { categoryId } : {}),
            ...activeDateRange,
        }),
        [type, categoryId, activeDateRange],
    );

    const transactionsQuery = useQuery({
        queryKey: ["transactions", "all-matching", filters],
        queryFn: () => getAllMatchingTransactions(filters),
        staleTime: 30_000,
        retry: false,
    });

    const filteredTransactions = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        const matching = (transactionsQuery.data ?? []).filter(
            (transaction) => {
                if (!normalizedSearch) return true;

                return (
                    (transaction.description ?? "")
                        .toLowerCase()
                        .includes(normalizedSearch) ||
                    transaction.categoryName
                        .toLowerCase()
                        .includes(normalizedSearch)
                );
            },
        );

        return [...matching].sort((a, b) => {
            if (sort === "amount-desc") return b.amount - a.amount;
            if (sort === "amount-asc") return a.amount - b.amount;
            if (sort === "date-asc") {
                return a.transactionDate.localeCompare(b.transactionDate);
            }
            if (sort === "created-desc") {
                return b.createdAt.localeCompare(a.createdAt);
            }

            return (
                b.transactionDate.localeCompare(a.transactionDate) ||
                b.createdAt.localeCompare(a.createdAt)
            );
        });
    }, [transactionsQuery.data, search, sort]);

    const totalIncome = filteredTransactions.reduce(
        (sum, transaction) =>
            transaction.type === "INCOME" ? sum + transaction.amount : sum,
        0,
    );

    const totalExpenses = filteredTransactions.reduce(
        (sum, transaction) =>
            transaction.type === "EXPENSE" ? sum + transaction.amount : sum,
        0,
    );

    const netTotal = totalIncome - totalExpenses;

    const totalPages = Math.ceil(filteredTransactions.length / PAGE_SIZE);
    const currentPage = Math.min(page, Math.max(totalPages - 1, 0));

    const visibleTransactions = filteredTransactions.slice(
        currentPage * PAGE_SIZE,
        (currentPage + 1) * PAGE_SIZE,
    );

    const hasActiveFilters =
        search.trim() !== "" ||
        type !== "ALL" ||
        categoryId !== "" ||
        datePreset !== "all-time";

    const resetFilters = () => {
        setSearch("");
        setType("ALL");
        setCategoryId("");
        setDatePreset("all-time");
        setFromDate("");
        setToDate("");
        setSort("date-desc");
        setPage(0);
    };

    const changeType = (nextType: "ALL" | TransactionType) => {
        setType(nextType);
        setCategoryId("");
        setPage(0);
    };

    const changeDatePreset = (nextPreset: DatePreset) => {
        setDatePreset(nextPreset);
        setFromDate("");
        setToDate("");
        setPage(0);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        setActionError("");

        try {
            await deleteMutation.mutateAsync(deleteTarget.id);
            setDeleteTarget(null);
            await queryClient.invalidateQueries({ queryKey: ["transactions"] });
            await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        } catch {
            setActionError(
                "Unable to delete this transaction. Please try again.",
            );
        }
    };

    const categoryOptions = useMemo(() => {
        const categories = categoriesQuery.data ?? [];
        if (type === "ALL") return categories;
        return categories.filter((category) => category.type === type);
    }, [categoriesQuery.data, type]);

    const exportTransactions = () => {
        downloadCsv(filteredTransactions);
    };

    const firstResult =
        filteredTransactions.length === 0 ? 0 : currentPage * PAGE_SIZE + 1;
    const lastResult = Math.min(
        (currentPage + 1) * PAGE_SIZE,
        filteredTransactions.length,
    );

    return (
        <div className="min-h-full bg-canvas">
            <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                {/* Page heading */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
                            Transactions
                        </h1>
                        <p className="mt-1 text-sm text-ink-500 sm:text-base">
                            Every income and expense, searchable and sortable.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={exportTransactions}
                            disabled={
                                transactionsQuery.isPending ||
                                filteredTransactions.length === 0
                            }
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-ink-800 shadow-sm transition hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                        >
                            <ArrowDownToLine size={17} />
                            Export
                        </button>

                        <Link
                            to="/transactions/new"
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#242c39] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#171d27] sm:flex-none"
                        >
                            <Plus size={18} />
                            <span className="whitespace-nowrap">
                                Add transaction
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Table / mobile card container */}
                <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                    {/* Desktop filters */}
                    <div className="hidden flex-wrap items-center gap-2.5 border-b border-border p-4 xl:flex">
                        <div className="relative min-w-47.5 flex-1">
                            <Search
                                size={17}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
                            />
                            <input
                                value={search}
                                onChange={(event) => {
                                    setSearch(event.target.value);
                                    setPage(0);
                                }}
                                placeholder="Search description"
                                aria-label="Search transactions"
                                className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-ink-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                            />
                        </div>

                        <div className="flex shrink-0 items-center rounded-xl border border-border bg-[#eef1f4] p-1">
                            {(["ALL", "INCOME", "EXPENSE"] as const).map(
                                (item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => changeType(item)}
                                        className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                                            type === item
                                                ? "bg-white text-ink-900 shadow-sm"
                                                : "text-ink-600 hover:text-ink-900"
                                        }`}
                                    >
                                        {item === "ALL" ? (
                                            "All"
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5">
                                                <span
                                                    className={`h-2.5 w-2.5 rounded-full ${
                                                        item === "INCOME"
                                                            ? "bg-emerald-600"
                                                            : "bg-red-500"
                                                    }`}
                                                />
                                                {item === "INCOME"
                                                    ? "Income"
                                                    : "Expense"}
                                            </span>
                                        )}
                                    </button>
                                ),
                            )}
                        </div>

                        <select
                            aria-label="Filter by category"
                            value={categoryId}
                            onChange={(event) => {
                                setCategoryId(event.target.value);
                                setPage(0);
                            }}
                            className="min-w-42.5 rounded-xl border border-border bg-surface px-3.5 py-3 text-sm outline-none focus:border-brand-600"
                        >
                            <option value="">All categories</option>
                            {categoryOptions.map((category: Category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>

                        <select
                            aria-label="Filter by date range"
                            value={datePreset}
                            onChange={(event) =>
                                changeDatePreset(
                                    event.target.value as DatePreset,
                                )
                            }
                            className="min-w-41.25 rounded-xl border border-border bg-surface px-3.5 py-3 text-sm outline-none focus:border-brand-600"
                        >
                            <option value="this-month">This month</option>
                            <option value="last-month">Last month</option>
                            <option value="last-90-days">Last 90 days</option>
                            <option value="year-to-date">Year to date</option>
                            <option value="all-time">All time</option>
                            <option value="custom">Custom range</option>
                        </select>

                        {datePreset === "custom" && (
                            <>
                                <input
                                    type="date"
                                    aria-label="Start date"
                                    value={fromDate}
                                    max={toDate || undefined}
                                    onChange={(event) => {
                                        setFromDate(event.target.value);
                                        setPage(0);
                                    }}
                                    className="rounded-xl border border-border bg-surface px-3 py-3 text-sm"
                                />
                                <input
                                    type="date"
                                    aria-label="End date"
                                    value={toDate}
                                    min={fromDate || undefined}
                                    onChange={(event) => {
                                        setToDate(event.target.value);
                                        setPage(0);
                                    }}
                                    className="rounded-xl border border-border bg-surface px-3 py-3 text-sm"
                                />
                            </>
                        )}

                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="inline-flex items-center gap-1.5 px-2 py-2 text-sm font-medium text-ink-700 hover:text-brand-700"
                            >
                                <X size={15} />
                                Clear
                            </button>
                        )}

                        <span className="ml-auto shrink-0 text-sm text-ink-500">
                            {filteredTransactions.length} results
                        </span>
                    </div>

                    {/* Compact responsive filters */}
                    <div className="space-y-3 border-b border-border p-3 xl:hidden sm:p-4">
                        <div className="flex gap-2">
                            <div className="relative min-w-0 flex-1">
                                <Search
                                    size={18}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
                                />
                                <input
                                    value={search}
                                    onChange={(event) => {
                                        setSearch(event.target.value);
                                        setPage(0);
                                    }}
                                    placeholder="Search transactions"
                                    aria-label="Search transactions"
                                    className="w-full rounded-xl border border-border bg-surface py-3.5 pl-10 pr-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowMobileFilters(true)}
                                aria-label="Open transaction filters"
                                className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-medium text-ink-800 transition hover:bg-canvas"
                            >
                                <SlidersHorizontal size={19} />
                                <span className="hidden sm:inline">
                                    Filters
                                </span>
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {(["ALL", "INCOME", "EXPENSE"] as const).map(
                                (item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => changeType(item)}
                                        className={`rounded-full border px-3.5 py-2 text-sm font-medium ${
                                            type === item
                                                ? "border-brand-600 bg-brand-50 text-brand-700"
                                                : "border-border text-ink-600"
                                        }`}
                                    >
                                        {item === "ALL"
                                            ? "All"
                                            : item === "INCOME"
                                              ? "Income"
                                              : "Expense"}
                                    </button>
                                ),
                            )}
                            <span className="ml-auto text-xs text-ink-500">
                                {filteredTransactions.length} results
                            </span>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <SortSelect value={sort} onChange={setSort} />

                            <select
                                aria-label="Filter by date range"
                                value={datePreset}
                                onChange={(event) =>
                                    changeDatePreset(
                                        event.target.value as DatePreset,
                                    )
                                }
                                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm sm:w-48"
                            >
                                <option value="this-month">This month</option>
                                <option value="last-month">Last month</option>
                                <option value="last-90-days">
                                    Last 90 days
                                </option>
                                <option value="year-to-date">
                                    Year to date
                                </option>
                                <option value="all-time">All time</option>
                                <option value="custom">Custom range</option>
                            </select>
                        </div>

                        {datePreset === "custom" && (
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="date"
                                    aria-label="Start date"
                                    value={fromDate}
                                    max={toDate || undefined}
                                    onChange={(event) =>
                                        setFromDate(event.target.value)
                                    }
                                    className="min-w-0 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm"
                                />
                                <input
                                    type="date"
                                    aria-label="End date"
                                    value={toDate}
                                    min={fromDate || undefined}
                                    onChange={(event) =>
                                        setToDate(event.target.value)
                                    }
                                    className="min-w-0 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm"
                                />
                            </div>
                        )}
                    </div>

                    {/* Summary bar */}
                    <div className="flex flex-wrap gap-x-6 gap-y-2 border-b border-border px-4 py-4 text-sm sm:px-6">
                        <p className="text-ink-600">
                            Income{" "}
                            <span className="font-semibold text-emerald-700">
                                +{currency(totalIncome)}
                            </span>
                        </p>
                        <p className="text-ink-600">
                            Expenses{" "}
                            <span className="font-semibold text-ink-900">
                                −{currency(totalExpenses)}
                            </span>
                        </p>
                        <p className="text-ink-600">
                            Net{" "}
                            <span
                                className={`font-semibold ${
                                    netTotal >= 0
                                        ? "text-emerald-700"
                                        : "text-red-600"
                                }`}
                            >
                                {netTotal >= 0 ? "+" : "−"}
                                {currency(Math.abs(netTotal))}
                            </span>
                        </p>
                    </div>

                    {/* Loading and error */}
                    {transactionsQuery.isPending && (
                        <div className="flex min-h-72 items-center justify-center gap-3 text-sm text-ink-500">
                            <LoaderCircle
                                size={21}
                                className="animate-spin text-brand-600"
                            />
                            Loading transactions...
                        </div>
                    )}

                    {transactionsQuery.isError && (
                        <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
                            <CircleAlert size={28} className="text-red-600" />
                            <p className="mt-3 font-semibold text-ink-900">
                                Could not load transactions
                            </p>
                            <p className="mt-1 text-sm text-ink-500">
                                Check your connection and try again.
                            </p>
                            <button
                                type="button"
                                onClick={() => void transactionsQuery.refetch()}
                                className="mt-4 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white"
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {!transactionsQuery.isPending &&
                        !transactionsQuery.isError &&
                        filteredTransactions.length === 0 && (
                            <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
                                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-canvas text-ink-400">
                                    <Search size={24} />
                                </span>
                                <h2 className="mt-4 font-semibold text-ink-900">
                                    No transactions found
                                </h2>
                                <p className="mt-1 text-sm text-ink-500">
                                    Try changing your search or filters.
                                </p>
                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={resetFilters}
                                        className="mt-4 text-sm font-semibold text-brand-700 hover:text-brand-800"
                                    >
                                        Clear all filters
                                    </button>
                                )}
                            </div>
                        )}

                    {/* Desktop table */}
                    {!transactionsQuery.isPending &&
                        !transactionsQuery.isError &&
                        filteredTransactions.length > 0 && (
                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full min-w-212.5 table-fixed border-collapse text-left">
                                    <colgroup>
                                        <col className="w-[31%]" />
                                        <col className="w-[18%]" />
                                        <col className="w-[14%]" />
                                        <col className="w-[18%]" />
                                        <col className="w-[13%]" />
                                        <col className="w-[6%]" />
                                    </colgroup>

                                    <thead className="bg-[#eef1f4] text-xs font-medium text-ink-500">
                                        <tr>
                                            <th className="px-5 py-3.5">
                                                Description
                                            </th>
                                            <th className="px-4 py-3.5">
                                                Category
                                            </th>
                                            <th className="px-4 py-3.5">
                                                Type
                                            </th>
                                            <th className="px-4 py-3.5">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSort(
                                                            sort === "date-desc"
                                                                ? "date-asc"
                                                                : "date-desc",
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1.5 text-ink-800 hover:text-brand-700"
                                                >
                                                    Date
                                                    {sort === "date-asc" ? (
                                                        <ArrowUp size={14} />
                                                    ) : (
                                                        <ArrowDown size={14} />
                                                    )}
                                                </button>
                                            </th>
                                            <th className="px-4 py-3.5 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSort(
                                                            sort ===
                                                                "amount-desc"
                                                                ? "amount-asc"
                                                                : "amount-desc",
                                                        )
                                                    }
                                                    className="ml-auto inline-flex items-center gap-1.5 hover:text-brand-700"
                                                >
                                                    Amount
                                                    {sort.startsWith(
                                                        "amount",
                                                    ) ? (
                                                        sort ===
                                                        "amount-asc" ? (
                                                            <ArrowUp
                                                                size={14}
                                                            />
                                                        ) : (
                                                            <ArrowDown
                                                                size={14}
                                                            />
                                                        )
                                                    ) : (
                                                        <ArrowDown
                                                            size={14}
                                                            className="text-ink-300"
                                                        />
                                                    )}
                                                </button>
                                            </th>
                                            <th
                                                className="px-2 py-3.5"
                                                aria-label="Actions"
                                            />
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {visibleTransactions.map(
                                            (transaction) => (
                                                <tr
                                                    key={transaction.id}
                                                    className="border-t border-border transition hover:bg-canvas/70"
                                                >
                                                    <td className="px-5 py-3">
                                                        <div className="flex min-w-0 items-center gap-3">
                                                            <TransactionCategoryIcon
                                                                categoryName={
                                                                    transaction.categoryName
                                                                }
                                                                type={
                                                                    transaction.type
                                                                }
                                                                size="sm"
                                                            />
                                                            <span className="truncate text-sm font-medium text-ink-900">
                                                                {transaction.description ||
                                                                    "Untitled transaction"}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <div className="flex min-w-0 items-center gap-2">
                                                            <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-brand-500" />
                                                            <span className="truncate text-sm text-ink-700">
                                                                {
                                                                    transaction.categoryName
                                                                }
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <TypeBadge
                                                            type={
                                                                transaction.type
                                                            }
                                                        />
                                                    </td>

                                                    <td className="px-4 py-3 text-sm text-ink-600">
                                                        {formatDate(
                                                            transaction.transactionDate,
                                                        )}
                                                    </td>

                                                    <td
                                                        className={`whitespace-nowrap px-4 py-3 text-right text-sm font-semibold ${
                                                            transaction.type ===
                                                            "INCOME"
                                                                ? "text-emerald-700"
                                                                : "text-ink-900"
                                                        }`}
                                                    >
                                                        {transaction.type ===
                                                        "INCOME"
                                                            ? "+"
                                                            : "−"}
                                                        {currency(
                                                            transaction.amount,
                                                        )}
                                                    </td>

                                                    <td className="px-2 py-3">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button
                                                                type="button"
                                                                title="Edit transaction"
                                                                aria-label={`Edit ${transaction.description}`}
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/transactions/${transaction.id}/edit`,
                                                                    )
                                                                }
                                                                className="rounded-lg p-2 text-ink-600 transition hover:bg-brand-50 hover:text-brand-700"
                                                            >
                                                                <Pencil
                                                                    size={16}
                                                                />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                title="Delete transaction"
                                                                aria-label={`Delete ${transaction.description}`}
                                                                onClick={() => {
                                                                    setActionError(
                                                                        "",
                                                                    );
                                                                    setDeleteTarget(
                                                                        transaction,
                                                                    );
                                                                }}
                                                                className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                                                            >
                                                                <Trash2
                                                                    size={16}
                                                                />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                    {/* Mobile cards */}
                    {!transactionsQuery.isPending &&
                        !transactionsQuery.isError &&
                        filteredTransactions.length > 0 && (
                            <div className="divide-y divide-border md:hidden">
                                {visibleTransactions.map((transaction) => (
                                    <article
                                        key={transaction.id}
                                        className="flex items-center gap-3 px-4 py-4"
                                    >
                                        <TransactionCategoryIcon
                                            categoryName={
                                                transaction.categoryName
                                            }
                                            type={transaction.type}
                                        />

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-ink-900">
                                                {transaction.description ||
                                                    "Untitled transaction"}
                                            </p>
                                            <p className="mt-1 truncate text-xs text-ink-500">
                                                {transaction.categoryName} ·{" "}
                                                {formatDate(
                                                    transaction.transactionDate,
                                                )}
                                            </p>
                                            <div className="mt-2">
                                                <TypeBadge
                                                    type={transaction.type}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 flex-col items-end gap-2">
                                            <p
                                                className={`whitespace-nowrap text-sm font-semibold ${
                                                    transaction.type ===
                                                    "INCOME"
                                                        ? "text-emerald-700"
                                                        : "text-ink-900"
                                                }`}
                                            >
                                                {transaction.type === "INCOME"
                                                    ? "+"
                                                    : "−"}
                                                {currency(transaction.amount)}
                                            </p>

                                            <div className="flex gap-1">
                                                <button
                                                    type="button"
                                                    aria-label={`Edit ${transaction.description}`}
                                                    onClick={() =>
                                                        navigate(
                                                            `/transactions/${transaction.id}/edit`,
                                                        )
                                                    }
                                                    className="rounded-lg p-2 text-ink-600 hover:bg-brand-50 hover:text-brand-700"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    aria-label={`Delete ${transaction.description}`}
                                                    onClick={() => {
                                                        setActionError("");
                                                        setDeleteTarget(
                                                            transaction,
                                                        );
                                                    }}
                                                    className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}

                    {/* Pagination */}
                    {!transactionsQuery.isPending &&
                        !transactionsQuery.isError &&
                        filteredTransactions.length > 0 && (
                            <div className="flex flex-col gap-3 border-t border-border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                <p className="text-sm text-ink-500">
                                    Showing{" "}
                                    <span className="font-medium text-ink-900">
                                        {firstResult}–{lastResult}
                                    </span>{" "}
                                    of {filteredTransactions.length}
                                </p>

                                <div className="flex items-center justify-end gap-1">
                                    <button
                                        type="button"
                                        aria-label="Previous page"
                                        disabled={currentPage === 0}
                                        onClick={() =>
                                            setPage(
                                                Math.max(0, currentPage - 1),
                                            )
                                        }
                                        className="rounded-lg p-2 text-ink-600 hover:bg-canvas disabled:cursor-not-allowed disabled:text-ink-300"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>

                                    {Array.from(
                                        { length: totalPages },
                                        (_, index) => index,
                                    )
                                        .filter(
                                            (index) =>
                                                index === 0 ||
                                                index === totalPages - 1 ||
                                                Math.abs(index - currentPage) <=
                                                    1,
                                        )
                                        .reduce<(number | "ellipsis")[]>(
                                            (result, index) => {
                                                const previous =
                                                    result[result.length - 1];

                                                if (
                                                    typeof previous ===
                                                        "number" &&
                                                    index - previous > 1
                                                ) {
                                                    result.push("ellipsis");
                                                }

                                                result.push(index);
                                                return result;
                                            },
                                            [],
                                        )
                                        .map((item, index) =>
                                            item === "ellipsis" ? (
                                                <span
                                                    key={`ellipsis-${index}`}
                                                    className="px-2 text-sm text-ink-500"
                                                >
                                                    …
                                                </span>
                                            ) : (
                                                <button
                                                    key={item}
                                                    type="button"
                                                    aria-current={
                                                        currentPage === item
                                                            ? "page"
                                                            : undefined
                                                    }
                                                    onClick={() =>
                                                        setPage(item)
                                                    }
                                                    className={`min-w-9 rounded-lg border px-3 py-2 text-sm ${
                                                        currentPage === item
                                                            ? "border-border bg-surface font-semibold text-ink-900 shadow-sm"
                                                            : "border-transparent text-ink-700 hover:bg-canvas"
                                                    }`}
                                                >
                                                    {item + 1}
                                                </button>
                                            ),
                                        )}

                                    <button
                                        type="button"
                                        aria-label="Next page"
                                        disabled={currentPage >= totalPages - 1}
                                        onClick={() =>
                                            setPage(
                                                Math.min(
                                                    totalPages - 1,
                                                    currentPage + 1,
                                                ),
                                            )
                                        }
                                        className="rounded-lg p-2 text-ink-600 hover:bg-canvas disabled:cursor-not-allowed disabled:text-ink-300"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                </section>
            </div>

            {/* Mobile filter bottom sheet */}
            {showMobileFilters && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 md:hidden">
                    <button
                        type="button"
                        aria-label="Close filters"
                        className="absolute inset-0 cursor-default"
                        onClick={() => setShowMobileFilters(false)}
                    />

                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="mobile-filters-title"
                        className="relative max-h-[90dvh] w-full overflow-y-auto rounded-t-3xl bg-surface shadow-2xl"
                    >
                        <div className="sticky top-0 z-10 border-b border-border bg-surface px-5 pb-4 pt-3">
                            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-ink-300" />

                            <div className="flex items-center justify-between">
                                <h2
                                    id="mobile-filters-title"
                                    className="text-lg font-semibold text-ink-900"
                                >
                                    Filters
                                </h2>

                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="text-sm font-medium text-ink-600 hover:text-brand-700"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6 px-5 py-5">
                            <div>
                                <label className="mb-3 block text-sm font-semibold text-ink-800">
                                    Type
                                </label>

                                <div className="grid grid-cols-3 rounded-xl bg-[#eef1f4] p-1">
                                    {(
                                        ["ALL", "INCOME", "EXPENSE"] as const
                                    ).map((item) => (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => changeType(item)}
                                            className={`rounded-lg px-2 py-3 text-sm font-medium ${
                                                type === item
                                                    ? "bg-white text-ink-900 shadow-sm"
                                                    : "text-ink-600"
                                            }`}
                                        >
                                            {item === "ALL"
                                                ? "All"
                                                : item === "INCOME"
                                                  ? "Income"
                                                  : "Expense"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="mobile-category"
                                    className="mb-3 block text-sm font-semibold text-ink-800"
                                >
                                    Category
                                </label>

                                <select
                                    id="mobile-category"
                                    value={categoryId}
                                    onChange={(event) => {
                                        setCategoryId(event.target.value);
                                        setPage(0);
                                    }}
                                    className="w-full rounded-xl border border-border bg-surface px-4 py-3.5 text-sm"
                                >
                                    <option value="">All categories</option>
                                    {categoryOptions.map(
                                        (category: Category) => (
                                            <option
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {category.name}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="mb-3 block text-sm font-semibold text-ink-800">
                                    Date range
                                </label>

                                <div className="flex flex-wrap gap-2">
                                    {(
                                        [
                                            ["this-month", "This month"],
                                            ["last-month", "Last month"],
                                            ["last-90-days", "Last 90 days"],
                                            ["year-to-date", "Year to date"],
                                            ["all-time", "All time"],
                                            ["custom", "Custom range"],
                                        ] as const
                                    ).map(([value, label]) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() =>
                                                changeDatePreset(value)
                                            }
                                            className={`rounded-full border px-3.5 py-2.5 text-sm ${
                                                datePreset === value
                                                    ? "border-ink-700 bg-canvas font-semibold text-ink-900"
                                                    : "border-border text-ink-600 hover:bg-canvas"
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>

                                {datePreset === "custom" && (
                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                        <input
                                            type="date"
                                            aria-label="Start date"
                                            value={fromDate}
                                            max={toDate || undefined}
                                            onChange={(event) =>
                                                setFromDate(event.target.value)
                                            }
                                            className="min-w-0 rounded-xl border border-border px-3 py-3 text-sm"
                                        />
                                        <input
                                            type="date"
                                            aria-label="End date"
                                            value={toDate}
                                            min={fromDate || undefined}
                                            onChange={(event) =>
                                                setToDate(event.target.value)
                                            }
                                            className="min-w-0 rounded-xl border border-border px-3 py-3 text-sm"
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <SortSelect value={sort} onChange={setSort} />
                            </div>
                        </div>

                        <div className="sticky bottom-0 border-t border-border bg-surface p-4">
                            <button
                                type="button"
                                onClick={() => setShowMobileFilters(false)}
                                className="w-full rounded-xl bg-[#242c39] px-4 py-4 text-sm font-semibold text-white transition hover:bg-[#171d27]"
                            >
                                Show {filteredTransactions.length} results
                            </button>
                        </div>
                    </section>
                </div>
            )}

            {/* Delete confirmation */}
            {deleteTarget && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-title"
                        className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl"
                    >
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                            <Trash2 size={22} />
                        </span>

                        <h2
                            id="delete-title"
                            className="mt-4 text-lg font-bold text-ink-900"
                        >
                            Delete transaction?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-ink-500">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold text-ink-800">
                                {deleteTarget.description || "this transaction"}
                            </span>
                            ? This action cannot be undone.
                        </p>

                        {actionError && (
                            <p
                                role="alert"
                                className="mt-3 text-sm text-red-600"
                            >
                                {actionError}
                            </p>
                        )}

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                disabled={deleteMutation.isPending}
                                onClick={() => setDeleteTarget(null)}
                                className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-canvas disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={deleteMutation.isPending}
                                onClick={() => void confirmDelete()}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {deleteMutation.isPending && (
                                    <LoaderCircle
                                        size={16}
                                        className="animate-spin"
                                    />
                                )}
                                Delete transaction
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TransactionsPage;
