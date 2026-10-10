import axios from "axios";

import type {
    CategorySummary,
    DashboardSummary,
    MonthlySummary,
} from "../../types/dashboard";
import type { Transaction } from "../../types/transaction";

const DASHBOARD_API_URL = `${import.meta.env.VITE_API_BASE_URL}/dashboard`;

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
    const response = await axios.get<DashboardSummary>(
        `${DASHBOARD_API_URL}/summary`,
        { withCredentials: true },
    );

    return response.data;
};

export const getMonthlySummary = async (
    year: number,
): Promise<MonthlySummary[]> => {
    const response = await axios.get<MonthlySummary[]>(
        `${DASHBOARD_API_URL}/monthly`,
        {
            params: { year },
            withCredentials: true,
        },
    );

    return response.data;
};

export const getCategorySummary = async (
    year: number,
    month: number,
): Promise<CategorySummary[]> => {
    const response = await axios.get<CategorySummary[]>(
        `${DASHBOARD_API_URL}/categories`,
        {
            params: { year, month },
            withCredentials: true,
        },
    );

    return response.data;
};

export const getRecentTransactions = async (
    limit = 5,
): Promise<Transaction[]> => {
    const response = await axios.get<Transaction[]>(
        `${DASHBOARD_API_URL}/recent-transactions`,
        {
            params: { limit },
            withCredentials: true,
        },
    );

    return response.data;
};
