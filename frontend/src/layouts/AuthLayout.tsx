import { Outlet } from "react-router-dom";

import PageTitle from "../routes/PageTitle";

const AuthLayout = () => {
    return (
        <div className="min-h-screen bg-canvas">
            <PageTitle />
            <Outlet />
        </div>
    );
};

export default AuthLayout;
