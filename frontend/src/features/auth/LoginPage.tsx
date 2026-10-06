import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useLogin } from "./useLogin";
import { useAppDispatch } from "../../store/hooks";
import { setAuthenticatedUser } from "./authSlice";

const loginSchema = z.object({
    email: z.email({
        error: "Please enter a valid email address",
    }),

    password: z
        .string()
        .min(1, "Password is required")
        .min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);

    const loginMutation = useLogin();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            const user = await loginMutation.mutateAsync(data);

            dispatch(setAuthenticatedUser(user));
            navigate("/dashboard", { replace: true });
        } catch {
            // Error is exposed through loginMutation.isError
        }
    };

    return (
        <main className="min-h-screen bg-white">
            <div className="mx-auto flex min-h-screen max-w-[1600px] gap-0 p-0 lg:p-5">
                {/* Left side */}
                <section className="flex min-h-screen w-full flex-col px-6 py-8 sm:px-10 lg:w-1/2 lg:px-16 lg:py-8 xl:px-28">
                    {/* Brand */}
                    <header>
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-3"
                            aria-label="Finance Tracker home"
                        >
                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-950 text-white">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full border-[3px] border-white">
                                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                </span>
                            </span>

                            <span className="text-2xl font-semibold tracking-tight text-ink-950">
                                Finance Tracker
                            </span>
                        </Link>
                    </header>

                    {/* Form area */}
                    <div className="flex flex-1 items-center">
                        <div className="w-full max-w-155">
                            <div className="mb-9">
                                <h1 className="text-4xl font-semibold tracking-tight text-ink-950 sm:text-5xl">
                                    Welcome back
                                </h1>

                                <p className="mt-3 text-lg text-ink-500 sm:text-xl">
                                    Log in to see your balance and recent
                                    activity.
                                </p>
                            </div>

                            <form
                                onSubmit={(event) => {
                                    console.log("FORM SUBMITTED");
                                    handleSubmit(onSubmit)(event);
                                }}
                                className="space-y-6"
                            >
                                {loginMutation.isError && (
                                    <div className="mb-6 rounded-lg border border-neg-100 bg-neg-50 px-4 py-3 text-sm text-neg-700">
                                        Unable to log in. Please check your
                                        email and password.
                                    </div>
                                )}

                                {/* Email */}
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="mb-3 block text-base font-medium text-ink-950"
                                    >
                                        Email
                                    </label>

                                    <input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="you@example.com"
                                        {...register("email")}
                                        className={`h-14 w-full rounded-lg border bg-white px-4 text-base text-ink-950 shadow-xs outline-none transition placeholder:text-ink-400 focus:ring-2 ${
                                            errors.email
                                                ? "border-neg-500 focus:border-neg-500 focus:ring-neg-100"
                                                : "border-border-strong focus:border-ink-500 focus:ring-ink-300"
                                        }`}
                                    />

                                    {errors.email && (
                                        <p className="mt-2 text-sm text-neg-600">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>

                                {/* Password */}
                                <div>
                                    <label
                                        htmlFor="password"
                                        className="mb-3 block text-base font-medium text-ink-950"
                                    >
                                        Password
                                    </label>

                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            autoComplete="current-password"
                                            {...register("password")}
                                            className={`h-14 w-full rounded-lg border bg-white px-4 pr-12 text-base text-ink-950 shadow-xs outline-none transition focus:ring-2 ${
                                                errors.password
                                                    ? "border-neg-500 focus:border-neg-500 focus:ring-neg-100"
                                                    : "border-border-strong focus:border-ink-500 focus:ring-ink-300"
                                            }`}
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(
                                                    (current) => !current,
                                                )
                                            }
                                            aria-label={
                                                showPassword
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                            className="absolute rounded-sm p-1 right-4 top-1/2 -translate-y-1/2 text-ink-500 transition hover:text-ink-900 hover:bg-gray-100 cursor-pointer"
                                        >
                                            {showPassword ? (
                                                <EyeOff
                                                    size={21}
                                                    strokeWidth={1.8}
                                                />
                                            ) : (
                                                <Eye
                                                    size={21}
                                                    strokeWidth={1.8}
                                                />
                                            )}
                                        </button>
                                    </div>

                                    {errors.password && (
                                        <p className="mt-2 text-sm text-neg-600">
                                            {errors.password.message}
                                        </p>
                                    )}
                                </div>

                                {/* Remember + forgot password */}
                                <div className="flex items-center justify-between gap-4">
                                    <label className="flex cursor-pointer items-center gap-3 text-base text-ink-900">
                                        <span className="relative h-6 w-6 shrink-0">
                                            <input
                                                type="checkbox"
                                                defaultChecked
                                                className="peer absolute inset-0 h-6 w-6 cursor-pointer appearance-none rounded-md border border-border-strong bg-white transition-colors checked:border-ink-900 checked:bg-ink-900"
                                            />

                                            <svg
                                                className="pointer-events-none absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M5 12l4 4L19 7" />
                                            </svg>
                                        </span>

                                        <span>Keep me signed in</span>
                                    </label>

                                    <button
                                        type="button"
                                        className="text-base font-medium text-ink-900 transition hover:text-ink-500"
                                    >
                                        Forgot password?
                                    </button>
                                </div>

                                {/* Login */}
                                <button
                                    type="submit"
                                    disabled={loginMutation.isPending}
                                    className="h-14 w-full rounded-lg bg-ink-900 px-5 text-base font-medium text-white shadow-xs transition cursor-pointer hover:bg-ink-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loginMutation.isPending
                                        ? "Logging in..."
                                        : "Log in"}
                                </button>
                            </form>

                            {/* Register */}
                            <p className="mt-7 text-center text-base text-ink-500">
                                New to Finance Tracker?{" "}
                                <Link
                                    to="/register"
                                    className="font-medium text-ink-900 hover:underline"
                                >
                                    Create an account
                                </Link>
                            </p>

                            {/* Development hint */}
                            <p className="mt-5 text-center text-sm text-ink-400">
                                Tip: any password containing “wrong” shows the
                                server-error state.
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <footer className="pt-8 text-center text-sm text-ink-500">
                        © 2026 Finance Tracker ·{" "}
                        <a href="#" className="underline underline-offset-2">
                            Privacy
                        </a>{" "}
                        ·{" "}
                        <a href="#" className="underline underline-offset-2">
                            Terms
                        </a>
                    </footer>
                </section>

                {/* Right showcase panel */}
                <aside className="relative hidden overflow-hidden rounded-[22px] bg-ink-950 lg:flex lg:w-1/2">
                    {/* Subtle grid */}
                    <div
                        className="absolute inset-0 opacity-[0.07]"
                        style={{
                            backgroundImage: `
                linear-gradient(to right, white 1px, transparent 1px),
                linear-gradient(to bottom, white 1px, transparent 1px)
              `,
                            backgroundSize: "64px 64px",
                        }}
                    />

                    <div className="relative flex w-full flex-col px-12 py-12 xl:px-14">
                        {/* Brand */}
                        <div className="flex items-center gap-3 text-white">
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-ink-950">
                                <span className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-ink-950">
                                    <span className="h-1 w-1 rounded-full bg-ink-950" />
                                </span>
                            </span>

                            <span className="text-xl font-semibold">
                                Finance Tracker
                            </span>
                        </div>

                        {/* Showcase content */}
                        <div className="flex flex-1 flex-col justify-center">
                            {/* Chart card */}
                            <div className="mb-12 max-w-150 rounded-2xl bg-white p-7 shadow-lg">
                                <p className="text-sm font-medium uppercase tracking-wide text-ink-500">
                                    September net
                                </p>

                                <p className="mt-3 text-4xl font-semibold tracking-tight text-ink-950">
                                    +$4,212
                                    <span className="text-ink-400">.38</span>
                                </p>

                                {/* Bars */}
                                <div className="mt-8 flex h-20 items-end gap-3">
                                    {[72, 66, 73, 68, 72, 62].map(
                                        (height, index) => (
                                            <div
                                                key={index}
                                                className="flex h-full flex-1 items-end gap-1"
                                            >
                                                <div
                                                    className="w-1/2 rounded-t-sm bg-pos-500"
                                                    style={{
                                                        height: `${height}%`,
                                                    }}
                                                />

                                                <div
                                                    className="w-1/2 rounded-t-sm bg-neg-500"
                                                    style={{
                                                        height: `${Math.max(25, height - 42)}%`,
                                                    }}
                                                />
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>

                            <h2 className="max-w-150 text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
                                Know exactly where
                                <br />
                                every dollar went.
                            </h2>

                            <p className="mt-5 max-w-145 text-lg leading-8 text-ink-300">
                                Track income and spending by category, see your
                                month at a glance, and keep your history in one
                                secure place.
                            </p>
                        </div>

                        {/* Security footer */}
                        <div className="flex flex-wrap items-center gap-6 text-sm text-ink-400">
                            <span className="inline-flex items-center gap-2">
                                <LockKeyhole size={16} />
                                256-bit TLS
                            </span>

                            <span className="inline-flex items-center gap-2">
                                <ShieldCheck size={16} />
                                Token-based sessions
                            </span>
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    );
};

export default LoginPage;
