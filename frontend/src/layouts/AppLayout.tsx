import { Outlet } from "react-router-dom";

import Sidebar from "../components/common/Sidebar";
import MobileNavigation from "../components/common/MobileNavigation";
import MobileHeader from "../components/common/MobileHeader";

const AppLayout = () => (
    <div className="h-screen overflow-hidden bg-canvas">
        {/* Mobile header */}
        <MobileHeader />

        <div className="flex h-full min-h-0">
            {/* Fixed desktop/tablet sidebar */}
            <aside className="hidden h-full shrink-0 md:block">
                <Sidebar />
            </aside>

            {/* Main content scrolls independently */}
            <main className="min-h-0 min-w-0 flex-1 overflow-y-auto pb-20 md:pb-0">
                <Outlet />
            </main>
        </div>

        {/* Fixed mobile navigation */}
        <MobileNavigation />
    </div>
);

export default AppLayout;
