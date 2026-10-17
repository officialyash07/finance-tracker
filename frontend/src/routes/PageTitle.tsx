import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const getPageTitle = (pathname: string) => {
    if (pathname === "/login") return "Login to Finance Tracker";
    if (pathname === "/register") return "Register | Finance Tracker";
    if (pathname === "/dashboard") return "Dashboard | Finance Tracker";
    if (pathname === "/transactions") return "Transactions | Finance Tracker";
    if (pathname === "/transactions/new") return "Add Transaction | Finance Tracker";
    if (/^\/transactions\/[^/]+\/edit$/.test(pathname)) {
        return "Edit Transaction | Finance Tracker";
    }
    if (pathname === "/categories") return "Categories | Finance Tracker";
    if (pathname === "/profile") return "Profile | Finance Tracker";

    return "Finance Tracker";
};

const PageTitle = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        document.title = getPageTitle(pathname);
    }, [pathname]);

    return null;
};

export default PageTitle;
