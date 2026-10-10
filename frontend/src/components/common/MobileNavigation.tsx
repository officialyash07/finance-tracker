import { NavLink, useNavigate } from "react-router-dom";
import {
    ArrowLeftRight,
    LayoutDashboard,
    Plus,
    Tag,
    UserRound,
} from "lucide-react";

const navigationItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Transactions", path: "/transactions", icon: ArrowLeftRight },
    { label: "Categories", path: "/categories", icon: Tag },
    { label: "Profile", path: "/profile", icon: UserRound },
];

const MobileNavigation = () => {
    const navigate = useNavigate();

    return (
        <nav
            aria-label="Mobile navigation"
            className="fixed inset-x-0 bottom-0 z-40 grid h-19 grid-cols-5 items-center border-t border-border bg-white px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(15,23,42,0.04)] md:hidden"
        >
            {navigationItems.slice(0, 2).map(({ label, path, icon: Icon }) => (
                <NavLink
                    key={path}
                    to={path}
                    end={path === "/transactions"}
                    className={({ isActive }) =>
                        `flex h-full flex-col items-center justify-center gap-1 text-[11px] ${
                            isActive
                                ? "font-semibold text-ink-950"
                                : "text-ink-500"
                        }`
                    }
                >
                    <Icon size={22} strokeWidth={1.8} />
                    <span>{label}</span>
                </NavLink>
            ))}

            <button
                type="button"
                onClick={() => navigate("/transactions/new")}
                aria-label="Add transaction"
                className="-mt-5 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-900 text-white shadow-lg shadow-ink-900/20 transition hover:bg-ink-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-500 focus-visible:ring-offset-2"
            >
                <Plus size={28} strokeWidth={1.8} />
            </button>

            {navigationItems.slice(2).map(({ label, path, icon: Icon }) => (
                <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) =>
                        `flex h-full flex-col items-center justify-center gap-1 text-[11px] ${
                            isActive
                                ? "font-semibold text-ink-950"
                                : "text-ink-500"
                        }`
                    }
                >
                    <Icon size={22} strokeWidth={1.8} />
                    <span>{label}</span>
                </NavLink>
            ))}
        </nav>
    );
};

export default MobileNavigation;
