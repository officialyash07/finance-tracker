import { useLogout } from "../auth/useLogout";

const DashboardPage = () => {
    const logoutMutation = useLogout();

    return (
        <main className="p-8">
            <h1 className="text-2xl font-semibold">Dashboard</h1>

            <button
                type="button"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="mt-4 rounded-lg bg-ink-900 px-4 py-2 text-white disabled:opacity-60"
            >
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </button>

            {logoutMutation.isError && (
                <p role="alert" className="mt-3 text-sm text-neg-600">
                    Logout failed. Please try again.
                </p>
            )}
        </main>
    );
};

export default DashboardPage;
