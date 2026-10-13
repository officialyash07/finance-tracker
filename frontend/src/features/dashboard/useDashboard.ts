import { useQuery } from "@tanstack/react-query";

import {
    getAllTimeCategorySummary,
    getCategorySummary,
    getDashboardSummary,
    getMonthlySummary,
    getRecentTransactions,
} from "./dashboardApi";

export const useDashboardSummary = () =>
    useQuery({
        queryKey: ["dashboard", "summary"],
        queryFn: ({ signal }) => getDashboardSummary(signal),
    });

export const useMonthlySummary = (year: number) =>
    useQuery({
        queryKey: ["dashboard", "monthly", year],
        queryFn: ({ signal }) => getMonthlySummary(year, signal),
    });

export const useCategorySummary = (year: number, month: number) =>
    useQuery({
        queryKey: ["dashboard", "categories", year, month],
        queryFn: ({ signal }) => getCategorySummary(year, month, signal),
    });

export const useAllTimeCategorySummary = () =>
    useQuery({
        queryKey: ["dashboard", "categories", "all-time"],
        queryFn: ({ signal }) => getAllTimeCategorySummary(signal),
    });

export const useRecentTransactions = (limit = 5) =>
    useQuery({
        queryKey: ["dashboard", "recent-transactions", limit],
        queryFn: ({ signal }) => getRecentTransactions(limit, signal),
    });
