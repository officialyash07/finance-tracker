import { lazy } from "react";

export const LoginPage = lazy(() => import("../features/auth/LoginPage"));
export const RegisterPage = lazy(() => import("../features/auth/RegisterPage"));
export const DashboardPage = lazy(() => import("../features/dashboard/DashboardPage"));
export const EditTransactionPage = lazy(
    () => import("../features/transactions/EditTransactionPage"),
);
export const TransactionsPage = lazy(
    () => import("../features/transactions/TransactionsPage"),
);
export const NewTransactionPage = lazy(
    () => import("../features/transactions/NewTransactionPage"),
);
export const CategoriesPage = lazy(
    () => import("../features/categories/CategoriesPage"),
);
export const ProfilePage = lazy(() => import("../features/profile/ProfilePage"));
