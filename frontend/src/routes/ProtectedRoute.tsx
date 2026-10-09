import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAppSelector } from "../store/hooks";

const ProtectedRoute = () => {
    const { isAuthenticated, isInitialized } = useAppSelector(
        (state) => state.auth,
    );

    const location = useLocation();

    if (!isInitialized) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-canvas">
                <p className="text-sm text-ink-500">Checking your session...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
