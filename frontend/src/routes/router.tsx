import { createBrowserRouter, Navigate } from "react-router-dom";

import AppLayout from "../layouts/AppLayout";
import AuthLayout from "../layouts/AuthLayout";
import ProtectedRoute from "./ProtectedRoute";
import {
    CategoriesPage,
    DashboardPage,
    EditTransactionPage,
    LoginPage,
    NewTransactionPage,
    ProfilePage,
    RegisterPage,
    TransactionsPage,
} from "./lazyPages";

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
