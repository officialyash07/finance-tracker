export type CategoryType = "INCOME" | "EXPENSE";

export interface Category {
    id: string;
    code: string;
    name: string;
    type: CategoryType;
    active: boolean;
}
