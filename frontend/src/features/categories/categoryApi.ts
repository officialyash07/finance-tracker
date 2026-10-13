import apiClient from "../../api/client";
import type { Category, CategoryType } from "../../types/category";

export const getCategories = async (
    type?: CategoryType,
): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>("/categories", {
        params: type ? { type } : undefined,
    });

    return response.data;
};
