import { createBrowserRouter, Navigate } from "react-router-dom";

import PlaceholderPage from "../pages/PlaceholderPage";
import LoginPage from "../features/auth/LoginPage";
import AppLayout from "../layouts/AppLayout";
import AuthLayout from "../layouts/AuthLayout";

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
                element: <PlaceholderPage title="Register" />,
            },
        ],
    },

    {
        element: <AppLayout />,
        children: [
            {
                path: "/dashboard",
                element: <PlaceholderPage title="Dashboard" />,
            },
            {
                path: "/transactions",
                element: <PlaceholderPage title="Transactions" />,
            },
            {
                path: "/transactions/new",
                element: <PlaceholderPage title="New Transaction" />,
            },
            {
                path: "/transactions/:id/edit",
                element: <PlaceholderPage title="Edit Transaction" />,
            },
            {
                path: "/categories",
                element: <PlaceholderPage title="Categories" />,
            },
            {
                path: "/profile",
                element: <PlaceholderPage title="Profile" />,
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
