import { useQuery } from "@tanstack/react-query";

import {
    getCategorySummary,
    getDashboardSummary,
    getMonthlySummary,
    getRecentTransactions,
} from "./dashboardApi";

export const useDashboardSummary = () =>
    useQuery({
        queryKey: ["dashboard", "summary"],
        queryFn: getDashboardSummary,
    });

export const useMonthlySummary = (year: number) =>
    useQuery({
        queryKey: ["dashboard", "monthly", year],
        queryFn: () => getMonthlySummary(year),
    });

export const useCategorySummary = (year: number, month: number) =>
    useQuery({
        queryKey: ["dashboard", "categories", year, month],
        queryFn: () => getCategorySummary(year, month),
    });

export const useRecentTransactions = (limit = 5) =>
    useQuery({
        queryKey: ["dashboard", "recent-transactions", limit],
        queryFn: () => getRecentTransactions(limit),
    });
