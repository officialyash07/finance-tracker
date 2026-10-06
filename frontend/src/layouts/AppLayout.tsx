import { Outlet } from "react-router-dom";

const AppLayout = () => {
    return (
        <div className="min-h-screen bg-canvas">
            <Outlet />
        </div>
    );
};

export default AppLayout;
