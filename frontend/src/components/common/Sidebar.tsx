import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    ArrowLeftRight,
    ChevronDown,
    ChevronUp,
    LayoutDashboard,
    LogOut,
    Plus,
    ShieldCheck,
    Tag,
    UserRound,
} from "lucide-react";

import { useAppSelector } from "../../store/hooks";
import { useLogout } from "../../features/auth/useLogout";

const navigationItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Transactions", path: "/transactions", icon: ArrowLeftRight },
    { label: "Categories", path: "/categories", icon: Tag },
    { label: "Profile", path: "/profile", icon: UserRound },
];

const Sidebar = () => {
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);

    const navigate = useNavigate();
    const user = useAppSelector((state) => state.auth.user);
    const logoutMutation = useLogout();

    const fullName = user
        ? `${user.firstName} ${user.lastName}`.trim()
        : "Your account";

    const initials = user
        ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
        : "U";

    return (
        <aside className="relative flex h-full w-16 shrink-0 flex-col border-r border-border bg-canvas transition-[width] duration-200 lg:w-64">
            {/* Brand */}
            <div className="flex h-16 shrink-0 items-center justify-center gap-3 px-2 lg:justify-start lg:px-6">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-ink-950 text-white">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full border-[2.5px] border-white">
                        <span className="h-1 w-1 rounded-full bg-white" />
                    </span>
                </span>

                <span className="hidden text-xl font-semibold tracking-tight text-ink-950 lg:block">
                    Finance Tracker
                </span>
            </div>

            {/* Add transaction */}
            <div className="px-2 pb-5 pt-4 lg:px-4">
                <button
                    type="button"
                    onClick={() => navigate("/transactions/new")}
                    title="Add transaction"
                    aria-label="Add transaction"
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-ink-900 px-2 text-sm font-medium text-white shadow-xs transition hover:bg-ink-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-500 focus-visible:ring-offset-2 lg:px-3"
                >
                    <Plus size={19} strokeWidth={1.8} />
                    <span className="hidden lg:inline">Add transaction</span>
                </button>
            </div>

            {/* Navigation */}
            <nav
                aria-label="Main navigation"
                className="min-h-0 flex-1 overflow-y-auto px-2 lg:px-4"
            >
                <p className="mb-2 hidden px-3 text-xs font-medium uppercase tracking-wide text-ink-500 lg:block">
                    Menu
                </p>

                <div className="space-y-1">
                    {navigationItems.map(({ label, path, icon: Icon }) => (
                        <NavLink
                            key={path}
                            to={path}
                            end={path === "/transactions"}
                            title={label}
                            aria-label={label}
                            className={({ isActive }) =>
                                [
                                    "flex h-11 items-center justify-center gap-3 rounded-lg border px-2 text-sm transition-colors lg:justify-start lg:px-3",
                                    isActive
                                        ? "border-border-strong bg-white font-semibold text-ink-950 shadow-xs"
                                        : "border-transparent font-medium text-ink-600 hover:bg-white/70 hover:text-ink-950",
                                ].join(" ")
                            }
                        >
                            <Icon
                                size={19}
                                strokeWidth={1.8}
                                className="shrink-0"
                            />
                            <span className="hidden lg:inline">{label}</span>
                        </NavLink>
                    ))}
                </div>
            </nav>

            {/* Account section pinned to the bottom */}
            <div className="relative mt-auto shrink-0 px-2 pb-4 lg:px-4">
                <div className="mb-5 hidden items-start gap-3 rounded-xl border border-border bg-white p-3 lg:flex">
                    <ShieldCheck
                        size={18}
                        className="mt-0.5 shrink-0 text-pos-600"
                    />
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-ink-950">
                            Session secured
                        </p>
                        <p className="mt-0.5 text-xs leading-4 text-ink-500">
                            Signed in to your account
                        </p>
                    </div>
                </div>

                {/* Profile menu */}
                {profileMenuOpen && (
                    <div className="absolute bottom-[calc(100%-8px)] left-2 z-50 mb-2 w-60 max-w-[calc(100vw-5rem)] overflow-hidden rounded-xl border border-border bg-white shadow-lg lg:left-4">
                        <div className="border-b border-border px-4 py-3">
                            <p className="truncate text-sm font-semibold text-ink-950">
                                {fullName}
                            </p>
                            <p className="mt-1 truncate text-xs text-ink-500">
                                {user?.email ?? ""}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setProfileMenuOpen(false);
                                navigate("/profile");
                            }}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-ink-700 hover:bg-canvas"
                        >
                            <UserRound size={18} />
                            Profile
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setProfileMenuOpen(false);
                                navigate("/profile?tab=security");
                            }}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-ink-700 hover:bg-canvas"
                        >
                            <UserRound size={18} />
                            Change password
                        </button>

                        <div className="border-t border-border">
                            <button
                                type="button"
                                disabled={logoutMutation.isPending}
                                onClick={() => logoutMutation.mutate()}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-neg-600 hover:bg-neg-50 disabled:opacity-60"
                            >
                                <LogOut size={18} />
                                {logoutMutation.isPending
                                    ? "Logging out..."
                                    : "Log out"}
                            </button>
                        </div>
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => setProfileMenuOpen((current) => !current)}
                    aria-label="Toggle account menu"
                    aria-expanded={profileMenuOpen}
                    title={fullName}
                    className="flex w-full items-center justify-center gap-3 rounded-xl p-2 text-left transition hover:bg-white lg:justify-start"
                >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E5E7EB] text-xs font-semibold text-ink-900">
                        {initials}
                    </span>

                    <span className="hidden min-w-0 flex-1 flex-col lg:flex">
                        <span className="block truncate text-sm font-semibold text-ink-950">
                            {fullName}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-ink-500">
                            {user?.email ?? ""}
                        </span>
                    </span>

                    <span className="hidden lg:block">
                        {profileMenuOpen ? (
                            <ChevronDown size={17} className="text-ink-500" />
                        ) : (
                            <ChevronUp size={17} className="text-ink-500" />
                        )}
                    </span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
