import { useMemo, useState } from "react";
import {
    ArrowDownLeft,
    ArrowUpRight,
    BookOpen,
    BriefcaseBusiness,
    CarFront,
    Clapperboard,
    Gift,
    Heart,
    House,
    Laptop,
    Package,
    ShoppingBag,
    Tag,
    Utensils,
    Wallet,
    Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { useCategories } from "./useCategories";
import type { Category, CategoryType } from "../../types/category";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
    HOUSING: House,
    FOOD: Utensils,
    GROCERIES: ShoppingBag,
    DINING: Utensils,
    TRANSPORT: CarFront,
    UTILITIES: Zap,
    HEALTH: Heart,
    HEALTHCARE: Heart,
    ENTERTAINMENT: Clapperboard,
    SHOPPING: ShoppingBag,
    EDUCATION: BookOpen,
    SALARY: Wallet,
    FREELANCE: Laptop,
    INVESTMENTS: BriefcaseBusiness,
    GIFTS: Gift,
    OTHER_EXPENSE: Package,
    OTHER_INCOME: Wallet,
};

const CATEGORY_COLORS: Record<string, string> = {
    HOUSING: "bg-indigo-50 text-indigo-600",
    FOOD: "bg-teal-50 text-teal-600",
    GROCERIES: "bg-teal-50 text-teal-600",
    DINING: "bg-orange-50 text-orange-600",
    TRANSPORT: "bg-sky-50 text-sky-600",
    UTILITIES: "bg-amber-50 text-amber-600",
    HEALTH: "bg-pink-50 text-pink-600",
    HEALTHCARE: "bg-pink-50 text-pink-600",
    ENTERTAINMENT: "bg-violet-50 text-violet-600",
    SHOPPING: "bg-slate-100 text-slate-600",
    EDUCATION: "bg-orange-50 text-orange-600",
    SALARY: "bg-teal-50 text-teal-600",
    FREELANCE: "bg-indigo-50 text-indigo-600",
    INVESTMENTS: "bg-violet-50 text-violet-600",
    GIFTS: "bg-slate-100 text-slate-600",
};

const normalizeCode = (category: Category) =>
    category.code.toUpperCase().replace(/[\s-]+/g, "_");

function CategoryCard({ category }: { category: Category }) {
    const code = normalizeCode(category);
    const Icon = CATEGORY_ICONS[code] ?? Tag;
    const iconColor = CATEGORY_COLORS[code] ?? "bg-slate-100 text-slate-600";

    return (
        <Link
            to={`/transactions?categoryId=${encodeURIComponent(category.id)}`}
            aria-label={`View transactions in ${category.name} category`}
            className={`block rounded-xl border border-border bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${
                category.active ? "" : "bg-slate-50/70 opacity-75"
            }`}
        >
            <article>
                <div className="flex items-start gap-3">
                    <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconColor}`}
                    >
                        <Icon size={21} strokeWidth={1.8} />
                    </span>

                    <div className="min-w-0 flex-1">
                        <h2 className="truncate text-sm font-semibold text-ink-900">
                            {category.name}
                        </h2>

                        <span
                            className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
                                category.type === "EXPENSE"
                                    ? "border-neg-100 bg-neg-50 text-neg-700"
                                    : "border-pos-100 bg-pos-50 text-pos-700"
                            }`}
                        >
                            {category.type === "EXPENSE" ? (
                                <ArrowUpRight size={12} />
                            ) : (
                                <ArrowDownLeft size={12} />
                            )}

                            {category.type === "EXPENSE" ? "Expense" : "Income"}
                        </span>
                    </div>

                    <span
                        className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
                            category.active
                                ? "bg-pos-50 text-pos-700"
                                : "bg-slate-100 text-slate-500"
                        }`}
                    >
                        <span className="mr-1">●</span>
                        {category.active ? "Active" : "Inactive"}
                    </span>
                </div>

                {!category.active && (
                    <p className="mt-5 text-xs leading-5 text-ink-400">
                        Hidden from new transactions. Past entries are kept.
                    </p>
                )}

                <p className="mt-4 text-xs font-medium text-ink-500">
                    View transactions →
                </p>
            </article>
        </Link>
    );
}

export default function CategoriesPage() {
    const [selectedType, setSelectedType] = useState<CategoryType>("EXPENSE");
    const [showInactive, setShowInactive] = useState(true);

    const categoriesQuery = useCategories(selectedType);

    const categories = useMemo(
        () =>
            (categoriesQuery.data ?? []).filter(
                (category) => showInactive || category.active,
            ),
        [categoriesQuery.data, showInactive],
    );

    const incomeQuery = useCategories("INCOME");
    const expenseQuery = useCategories("EXPENSE");

    const incomeCount = (incomeQuery.data ?? []).length;
    const allExpenseCount = (expenseQuery.data ?? []).length;

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <header className="mb-7">
                <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
                    Categories
                </h1>

                <p className="mt-2 text-sm text-ink-500 sm:text-base">
                    How your transactions are grouped. Categories are managed by
                    your workspace.
                </p>
            </header>

            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div
                    className="inline-flex w-fit items-center rounded-xl border border-border bg-slate-100 p-1"
                    role="tablist"
                    aria-label="Category type"
                >
                    <button
                        type="button"
                        role="tab"
                        aria-selected={selectedType === "EXPENSE"}
                        onClick={() => setSelectedType("EXPENSE")}
                        className={`rounded-lg px-3 py-2 text-sm transition ${
                            selectedType === "EXPENSE"
                                ? "bg-surface font-semibold text-ink-900 shadow-sm"
                                : "text-ink-500 hover:text-ink-800"
                        }`}
                    >
                        <span className="mr-1.5 text-neg-600">●</span>
                        Expense
                        <span className="ml-1.5 text-xs">
                            {allExpenseCount}
                        </span>
                    </button>

                    <button
                        type="button"
                        role="tab"
                        aria-selected={selectedType === "INCOME"}
                        onClick={() => setSelectedType("INCOME")}
                        className={`rounded-lg px-3 py-2 text-sm transition ${
                            selectedType === "INCOME"
                                ? "bg-surface font-semibold text-ink-900 shadow-sm"
                                : "text-ink-500 hover:text-ink-800"
                        }`}
                    >
                        <span className="mr-1.5 text-pos-600">●</span>
                        Income
                        <span className="ml-1.5 text-xs">{incomeCount}</span>
                    </button>
                </div>

                <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink-700">
                    <input
                        type="checkbox"
                        checked={showInactive}
                        onChange={(event) =>
                            setShowInactive(event.target.checked)
                        }
                        className="h-4 w-4 rounded border-border accent-slate-800"
                    />
                    Show inactive
                </label>
            </div>

            {categoriesQuery.isPending ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }, (_, index) => (
                        <div
                            key={index}
                            className="h-32 animate-pulse rounded-xl border border-border bg-slate-100"
                        />
                    ))}
                </div>
            ) : categoriesQuery.isError ? (
                <div
                    role="alert"
                    className="rounded-xl border border-neg-100 bg-neg-50 p-5 text-sm text-neg-700"
                >
                    Categories could not be loaded. Please try again.
                </div>
            ) : categories.length === 0 ? (
                <div className="rounded-xl border border-border bg-surface px-6 py-14 text-center">
                    <Tag className="mx-auto mb-3 text-ink-400" size={28} />

                    <h2 className="font-semibold text-ink-900">
                        No categories found
                    </h2>

                    <p className="mt-1 text-sm text-ink-500">
                        {showInactive
                            ? "There are no categories for this type yet."
                            : 'No active categories found. Enable "Show inactive" to see inactive categories.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {categories.map((category) => (
                        <CategoryCard key={category.id} category={category} />
                    ))}
                </div>
            )}
        </div>
    );
}
