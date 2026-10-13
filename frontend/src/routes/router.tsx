import { createBrowserRouter, Navigate } from "react-router-dom";

import LoginPage from "../features/auth/LoginPage";
import RegisterPage from "../features/auth/RegisterPage";
import DashboardPage from "../features/dashboard/DashboardPage";
import AppLayout from "../layouts/AppLayout";
import AuthLayout from "../layouts/AuthLayout";
import ProtectedRoute from "./ProtectedRoute";
import EditTransactionPage from "../features/transactions/EditTransactionPage";
import TransactionsPage from "../features/transactions/TransactionsPage";
import NewTransactionPage from "../features/transactions/NewTransactionPage";
import CategoriesPage from "../features/categories/CategoriesPage";
import ProfilePage from "../features/profile/ProfilePage";

export const router = createBrowserRouter([
    {
        element: <AuthLayout />,
        children: [
            {
                path: "/login",
                element: <LoginPage />,
            },
            {
                path: "/register",
                element: <RegisterPage />,
            },
        ],
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <AppLayout />,
                children: [
                    {
                        path: "/dashboard",
                        element: <DashboardPage />,
                    },
                    {
                        path: "/transactions",
                        element: <TransactionsPage />,
                    },
                    {
                        path: "/transactions/new",
                        element: <NewTransactionPage />,
                    },
                    {
                        path: "/transactions/:id/edit",
                        element: <EditTransactionPage />,
                    },
                    {
                        path: "/categories",
                        element: <CategoriesPage />,
                    },
                    {
                        path: "/profile",
                        element: <ProfilePage />,
                    },
                ],
            },
        ],
    },
    {
        path: "/",
        element: <Navigate to="/login" replace />,
    },

    {
        path: "*",
        element: <Navigate to="/login" replace />,
    },
]);
