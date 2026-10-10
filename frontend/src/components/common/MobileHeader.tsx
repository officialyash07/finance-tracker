import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ChevronRight,
    KeyRound,
    LogOut,
    Tag,
    UserRound,
    X,
} from "lucide-react";

import { useAppSelector } from "../../store/hooks";
import { useLogout } from "../../features/auth/useLogout";

const MobileHeader = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    const navigate = useNavigate();
    const user = useAppSelector((state) => state.auth.user);
    const logoutMutation = useLogout();

    const fullName = user
        ? `${user.firstName} ${user.lastName}`.trim()
        : "Your account";

    const initials = user
        ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
        : "U";

    const closeMenu = () => setMenuOpen(false);

    const navigateTo = (path: string) => {
        closeMenu();
        navigate(path);
    };

    const handleLogout = () => {
        logoutMutation.mutate(undefined, {
            onSuccess: closeMenu,
        });
    };

    return (
        <>
            {/* Mobile top header */}
            <header className="sticky top-0 z-30 flex h-23 items-center justify-between border-b border-border bg-canvas px-6 md:hidden">
                <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    aria-label="Finance Tracker home"
                    className="flex items-center gap-3"
                >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-950 text-white">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full border-[3px] border-white">
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        </span>
                    </span>

                    <span className="text-2xl font-semibold tracking-tight text-ink-950">
                        Finance Tracker
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setMenuOpen(true)}
                    aria-label="Open account menu"
                    aria-haspopup="dialog"
                    aria-expanded={menuOpen}
                    className="flex h-13 w-13 items-center justify-center rounded-full bg-[#E5E7EB] text-base font-semibold text-ink-950 transition hover:bg-[#DDE0E5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-500"
                >
                    {initials}
                </button>
            </header>

            {/* Account bottom sheet */}
            {menuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    {/* Backdrop */}
                    <button
                        type="button"
                        aria-label="Close account menu"
                        onClick={closeMenu}
                        className="absolute inset-0 h-full w-full bg-ink-950/40"
                    />

                    {/* Sheet */}
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-label="Account menu"
                        className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-[28px] bg-white pb-[calc(24px+env(safe-area-inset-bottom))] shadow-2xl"
                    >
                        {/* Drag handle */}
                        <div className="flex h-8 items-center justify-center">
                            <span className="h-1.5 w-15 rounded-full bg-border-strong" />
                        </div>

                        {/* User details */}
                        <div className="flex items-center gap-4 px-8 pb-7 pt-5">
                            <span className="flex h-18 w-18 shrink-0 items-center justify-center rounded-full bg-[#E5E7EB] text-xl font-semibold text-ink-950">
                                {initials}
                            </span>

                            <div className="min-w-0 flex-1">
                                <h2 className="truncate text-xl font-semibold text-ink-950">
                                    {fullName}
                                </h2>
                                <p className="mt-1 truncate text-base text-ink-500">
                                    {user?.email ?? ""}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeMenu}
                                aria-label="Close account menu"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-500 hover:bg-canvas"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Account actions */}
                        <div className="px-5">
                            <button
                                type="button"
                                onClick={() => navigateTo("/profile")}
                                className="flex min-h-21 w-full items-center gap-5 px-4 text-left text-lg text-ink-900 transition hover:bg-canvas"
                            >
                                <UserRound size={27} strokeWidth={1.8} />
                                <span className="flex-1">Profile</span>
                                <ChevronRight
                                    size={22}
                                    className="text-ink-400"
                                />
                            </button>

                            <button
                                type="button"
                                onClick={() => navigateTo("/profile")}
                                className="flex min-h-21 w-full items-center gap-5 px-4 text-left text-lg text-ink-900 transition hover:bg-canvas"
                            >
                                <KeyRound size={27} strokeWidth={1.8} />
                                <span className="flex-1">Change password</span>
                                <ChevronRight
                                    size={22}
                                    className="text-ink-400"
                                />
                            </button>

                            <button
                                type="button"
                                onClick={() => navigateTo("/categories")}
                                className="flex min-h-21 w-full items-center gap-5 px-4 text-left text-lg text-ink-900 transition hover:bg-canvas"
                            >
                                <Tag size={27} strokeWidth={1.8} />
                                <span className="flex-1">Categories</span>
                                <ChevronRight
                                    size={22}
                                    className="text-ink-400"
                                />
                            </button>

                            <div className="my-2 border-t border-border" />

                            {logoutMutation.isError && (
                                <p
                                    role="alert"
                                    className="px-4 py-3 text-sm text-neg-600"
                                >
                                    Logout failed. Please try again.
                                </p>
                            )}

                            <button
                                type="button"
                                onClick={handleLogout}
                                disabled={logoutMutation.isPending}
                                className="flex min-h-21 w-full items-center gap-5 px-4 text-left text-lg font-medium text-neg-600 transition hover:bg-neg-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <LogOut size={27} strokeWidth={1.8} />
                                <span>
                                    {logoutMutation.isPending
                                        ? "Logging out..."
                                        : "Log out"}
                                </span>
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </>
    );
};

export default MobileHeader;
