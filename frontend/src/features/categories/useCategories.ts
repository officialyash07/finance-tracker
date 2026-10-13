import { useQuery } from "@tanstack/react-query";

import { getCategories } from "./categoryApi";
import type { CategoryType } from "../../types/category";

export const useCategories = (type?: CategoryType) =>
    useQuery({
        queryKey: ["categories", type ?? "all"],
        queryFn: () => getCategories(type),
        staleTime: 5 * 60 * 1000,
        retry: false,
    });
