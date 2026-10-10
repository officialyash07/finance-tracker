import {
    ArrowDownLeft,
    ArrowUpRight,
    BriefcaseBusiness,
    CarFront,
    Clapperboard,
    HeartPulse,
    House,
    Package,
    ShoppingBag,
    Utensils,
    Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { TransactionType } from "../../types/transaction";

interface TransactionCategoryIconProps {
    categoryName: string;
    type: TransactionType;
    size?: "sm" | "md";
}

interface CategoryStyle {
    icon: LucideIcon;
    background: string;
    color: string;
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
    FOOD: {
        icon: Utensils,
        background: "bg-orange-50",
        color: "text-orange-600",
    },
    SALARY: {
        icon: Wallet,
        background: "bg-emerald-50",
        color: "text-emerald-700",
    },
    TRANSPORT: {
        icon: CarFront,
        background: "bg-sky-50",
        color: "text-sky-600",
    },
    HOUSING: {
        icon: House,
        background: "bg-indigo-50",
        color: "text-indigo-600",
    },
    HEALTHCARE: {
        icon: HeartPulse,
        background: "bg-pink-50",
        color: "text-pink-600",
    },
    FREELANCE: {
        icon: BriefcaseBusiness,
        background: "bg-teal-50",
        color: "text-teal-600",
    },
    OTHER_EXPENSE: {
        icon: Package,
        background: "bg-slate-100",
        color: "text-slate-600",
    },
    SHOPPING: {
        icon: ShoppingBag,
        background: "bg-teal-50",
        color: "text-teal-600",
    },
    ENTERTAINMENT: {
        icon: Clapperboard,
        background: "bg-violet-50",
        color: "text-violet-600",
    },
    OTHER_INCOME: {
        icon: Wallet,
        background: "bg-emerald-50",
        color: "text-emerald-700",
    },
};

const DEFAULT_STYLE: CategoryStyle = {
    icon: Wallet,
    background: "bg-slate-100",
    color: "text-slate-600",
};

const TransactionCategoryIcon = ({
    categoryName,
    type,
    size = "md",
}: TransactionCategoryIconProps) => {
    const categoryKey = categoryName
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, "_");

    const categoryStyle = CATEGORY_STYLES[categoryKey] ?? DEFAULT_STYLE;

    const CategoryIcon = categoryStyle.icon;
    const isIncome = type === "INCOME";

    const dimensions =
        size === "sm" ? "h-9 w-9 rounded-xl" : "h-12 w-12 rounded-2xl";

    const iconSize = size === "sm" ? 18 : 24;
    const badgeSize = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
    const badgeIconSize = size === "sm" ? 9 : 11;

    return (
        <span
            className={`relative inline-flex shrink-0 items-center justify-center ${dimensions} ${categoryStyle.background} ${categoryStyle.color}`}
            aria-label={`${categoryName}, ${isIncome ? "income" : "expense"}`}
        >
            <CategoryIcon size={iconSize} strokeWidth={1.8} />

            <span
                className={`absolute -right-1 -bottom-1 flex items-center justify-center rounded-full border-2 border-white ${
                    isIncome
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-600"
                } ${badgeSize}`}
            >
                {isIncome ? (
                    <ArrowDownLeft size={badgeIconSize} strokeWidth={2.2} />
                ) : (
                    <ArrowUpRight size={badgeIconSize} strokeWidth={2.2} />
                )}
            </span>
        </span>
    );
};

export default TransactionCategoryIcon;
