import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { registerSchema, type RegisterFormData } from "./registerSchema";
import { useRegister } from "./useRegister";
import { useAppDispatch } from "../../store/hooks";
import { setAuthenticatedUser } from "./authSlice";

const passwordRules = [
    {
        label: "At least 8 characters",
        test: (password: string) => password.length >= 8,
    },
    {
        label: "One uppercase letter",
        test: (password: string) => /[A-Z]/.test(password),
    },
    {
        label: "One number",
        test: (password: string) => /[0-9]/.test(password),
    },
    {
        label: "One special character",
        test: (password: string) => /[^A-Za-z0-9]/.test(password),
    },
];

const RegisterPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const registerMutation = useRegister();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
            preferredCurrency: "INR",
            acceptTerms: false,
        },
    });

    const password = useWatch({ control, name: "password" }) ?? "";
    const confirmPassword =
        useWatch({ control, name: "confirmPassword" }) ?? "";

    const passedRules = passwordRules.filter((rule) =>
        rule.test(password),
    ).length;

    const strengthLabel =
        password.length === 0
            ? ""
            : passedRules <= 1
              ? "Weak"
              : passedRules === 2
                ? "Fair"
                : passedRules === 3
                  ? "Good"
                  : "Strong";

    const strengthColor =
        passedRules <= 1
            ? "bg-neg-500"
            : passedRules === 2
              ? "bg-warn-500"
              : "bg-pos-500";

    const onSubmit = async (formData: RegisterFormData) => {
        registerMutation.reset();

        try {
            const user = await registerMutation.mutateAsync({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                preferredCurrency: formData.preferredCurrency,
            });

            dispatch(setAuthenticatedUser(user));
            navigate("/dashboard", { replace: true });
        } catch {
            // The error is displayed through registerMutation.isError.
        }
    };

    const registrationErrorMessage = (() => {
        if (!registerMutation.isError) {
            return null;
        }

        if (axios.isAxiosError(registerMutation.error)) {
            const status = registerMutation.error.response?.status;

            if (status === 409) {
                return "An account with this email already exists.";
            }

            if (status === 400) {
                return "Please check your details and try again.";
            }
        }

        return "Unable to create your account. Please try again later.";
    })();

    return (
        <main className="min-h-screen bg-white">
            <div className="mx-auto flex min-h-screen max-w-[1600px] gap-0 p-0 lg:p-5">
                {/* Registration form */}
                <section className="flex min-h-screen w-full flex-col px-6 py-8 sm:px-10 lg:w-1/2 lg:px-16 lg:py-8 xl:px-28">
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

                    <div className="flex flex-1 items-center py-10">
                        <div className="mx-auto w-full max-w-130">
                            <div className="mb-8">
                                <h1 className="text-3xl font-semibold tracking-tight text-ink-950 sm:text-4xl">
                                    Create your account
                                </h1>

                                <p className="mt-3 text-base text-ink-500">
                                    Free for personal use. Takes under a minute.
                                </p>
                            </div>

                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                noValidate
                                className="space-y-5"
                            >
                                {registrationErrorMessage && (
                                    <div
                                        role="alert"
                                        className="rounded-lg border border-neg-100 bg-neg-50 px-4 py-3 text-sm text-neg-700"
                                    >
                                        {registrationErrorMessage}{" "}
                                        {axios.isAxiosError(
                                            registerMutation.error,
                                        ) &&
                                            registerMutation.error.response
                                                ?.status === 409 && (
                                                <Link
                                                    to="/login"
                                                    className="font-semibold underline underline-offset-2"
                                                >
                                                    Log in instead
                                                </Link>
                                            )}
                                    </div>
                                )}

                                {/* Name fields */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="firstName"
                                            className="mb-2 block text-sm font-medium text-ink-950"
                                        >
                                            First name
                                        </label>

                                        <input
                                            id="firstName"
                                            autoComplete="given-name"
                                            {...register("firstName")}
                                            aria-invalid={!!errors.firstName}
                                            className={`h-12 w-full rounded-lg border bg-white px-3 text-sm text-ink-950 shadow-xs outline-none transition focus:ring-2 ${
                                                errors.firstName
                                                    ? "border-neg-500 focus:ring-neg-100"
                                                    : "border-border-strong focus:border-ink-500 focus:ring-ink-300"
                                            }`}
                                        />

                                        {errors.firstName && (
                                            <p className="mt-1.5 text-sm text-neg-600">
                                                {errors.firstName.message}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="lastName"
                                            className="mb-2 block text-sm font-medium text-ink-950"
                                        >
                                            Last name
                                        </label>

                                        <input
                                            id="lastName"
                                            autoComplete="family-name"
                                            {...register("lastName")}
                                            aria-invalid={!!errors.lastName}
                                            className={`h-12 w-full rounded-lg border bg-white px-3 text-sm text-ink-950 shadow-xs outline-none transition focus:ring-2 ${
                                                errors.lastName
                                                    ? "border-neg-500 focus:ring-neg-100"
                                                    : "border-border-strong focus:border-ink-500 focus:ring-ink-300"
                                            }`}
                                        />

                                        {errors.lastName && (
                                            <p className="mt-1.5 text-sm text-neg-600">
                                                {errors.lastName.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="mb-2 block text-sm font-medium text-ink-950"
                                    >
                                        Email
                                    </label>

                                    <input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="you@example.com"
                                        {...register("email")}
                                        aria-invalid={!!errors.email}
                                        className={`h-12 w-full rounded-lg border bg-white px-3 text-sm text-ink-950 shadow-xs outline-none transition placeholder:text-ink-400 focus:ring-2 ${
                                            errors.email
                                                ? "border-neg-500 focus:ring-neg-100"
                                                : "border-border-strong focus:border-ink-500 focus:ring-ink-300"
                                        }`}
                                    />

                                    {errors.email && (
                                        <p className="mt-1.5 text-sm text-neg-600">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>

                                {/* Currency required by backend */}
                                <div>
                                    <label
                                        htmlFor="preferredCurrency"
                                        className="mb-2 block text-sm font-medium text-ink-950"
                                    >
                                        Preferred currency
                                    </label>

                                    <select
                                        id="preferredCurrency"
                                        {...register("preferredCurrency")}
                                        aria-invalid={
                                            !!errors.preferredCurrency
                                        }
                                        className={`h-12 w-full rounded-lg border bg-white px-3 text-sm text-ink-950 outline-none transition focus:ring-2 ${
                                            errors.preferredCurrency
                                                ? "border-neg-500 focus:ring-neg-100"
                                                : "border-border-strong focus:border-ink-500 focus:ring-ink-300"
                                        }`}
                                    >
                                        <option value="INR">
                                            INR — Indian Rupee
                                        </option>
                                        <option value="USD">
                                            USD — US Dollar
                                        </option>
                                        <option value="EUR">EUR — Euro</option>
                                        <option value="GBP">
                                            GBP — British Pound
                                        </option>
                                        <option value="CAD">
                                            CAD — Canadian Dollar
                                        </option>
                                        <option value="AUD">
                                            AUD — Australian Dollar
                                        </option>
                                    </select>

                                    {errors.preferredCurrency && (
                                        <p className="mt-1.5 text-sm text-neg-600">
                                            {errors.preferredCurrency.message}
                                        </p>
                                    )}
                                </div>

                                {/* Password */}
                                <div>
                                    <label
                                        htmlFor="password"
                                        className="mb-2 block text-sm font-medium text-ink-950"
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
                                            autoComplete="new-password"
                                            {...register("password")}
                                            aria-invalid={!!errors.password}
                                            className={`h-12 w-full rounded-lg border bg-white px-3 pr-12 text-sm text-ink-950 shadow-xs outline-none transition focus:ring-2 ${
                                                errors.password
                                                    ? "border-neg-500 focus:ring-neg-100"
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
                                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm p-1 text-ink-500 transition hover:bg-gray-100 hover:text-ink-900"
                                        >
                                            {showPassword ? (
                                                <EyeOff size={19} />
                                            ) : (
                                                <Eye size={19} />
                                            )}
                                        </button>
                                    </div>

                                    {/* Live strength meter */}
                                    <div
                                        className="mt-3 flex items-center gap-1.5"
                                        aria-label={`Password strength: ${strengthLabel || "not entered"}`}
                                    >
                                        {passwordRules.map((rule, index) => (
                                            <div
                                                key={rule.label}
                                                className={`h-1.5 flex-1 rounded-full transition-colors ${
                                                    password.length > 0 &&
                                                    index < passedRules
                                                        ? strengthColor
                                                        : "bg-border"
                                                }`}
                                            />
                                        ))}

                                        <span className="ml-2 min-w-12 text-right text-xs font-medium text-ink-500">
                                            {strengthLabel}
                                        </span>
                                    </div>

                                    {/* Live checklist */}
                                    <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
                                        {passwordRules.map((rule) => {
                                            const passed = rule.test(password);

                                            return (
                                                <div
                                                    key={rule.label}
                                                    className={`flex items-center gap-1.5 text-xs ${
                                                        passed
                                                            ? "text-pos-700"
                                                            : "text-ink-500"
                                                    }`}
                                                >
                                                    <span
                                                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                                                            passed
                                                                ? "bg-pos-500 text-white"
                                                                : "border border-border-strong"
                                                        }`}
                                                    >
                                                        {passed ? (
                                                            <Check
                                                                size={11}
                                                                strokeWidth={3}
                                                            />
                                                        ) : null}
                                                    </span>
                                                    {rule.label}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {errors.password && (
                                        <p className="mt-2 text-sm text-neg-600">
                                            {errors.password.message}
                                        </p>
                                    )}
                                </div>

                                {/* Confirm password */}
                                <div>
                                    <label
                                        htmlFor="confirmPassword"
                                        className="mb-2 block text-sm font-medium text-ink-950"
                                    >
                                        Confirm password
                                    </label>

                                    <div className="relative">
                                        <input
                                            id="confirmPassword"
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            autoComplete="new-password"
                                            {...register("confirmPassword")}
                                            aria-invalid={
                                                !!errors.confirmPassword
                                            }
                                            className={`h-12 w-full rounded-lg border bg-white px-3 pr-12 text-sm text-ink-950 shadow-xs outline-none transition focus:ring-2 ${
                                                errors.confirmPassword
                                                    ? "border-neg-500 focus:ring-neg-100"
                                                    : "border-border-strong focus:border-ink-500 focus:ring-ink-300"
                                            }`}
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    (current) => !current,
                                                )
                                            }
                                            aria-label={
                                                showConfirmPassword
                                                    ? "Hide confirm password"
                                                    : "Show confirm password"
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm p-1 text-ink-500 transition hover:bg-gray-100 hover:text-ink-900"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff size={19} />
                                            ) : (
                                                <Eye size={19} />
                                            )}
                                        </button>
                                    </div>

                                    {confirmPassword.length > 0 &&
                                        confirmPassword === password && (
                                            <p className="mt-1.5 flex items-center gap-1 text-xs text-pos-700">
                                                <Check size={14} />
                                                Passwords match
                                            </p>
                                        )}

                                    {errors.confirmPassword && (
                                        <p className="mt-1.5 text-sm text-neg-600">
                                            {errors.confirmPassword.message}
                                        </p>
                                    )}
                                </div>

                                {/* Terms and privacy */}
                                <div>
                                    <label className="flex cursor-pointer items-start gap-3 text-sm text-ink-900">
                                        <input
                                            type="checkbox"
                                            {...register("acceptTerms")}
                                            className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-ink-900"
                                        />

                                        <span>
                                            I agree to the{" "}
                                            <Link
                                                to="/terms"
                                                className="underline underline-offset-2"
                                            >
                                                Terms
                                            </Link>{" "}
                                            and{" "}
                                            <Link
                                                to="/privacy"
                                                className="underline underline-offset-2"
                                            >
                                                Privacy Policy
                                            </Link>
                                        </span>
                                    </label>

                                    {errors.acceptTerms && (
                                        <p className="mt-1.5 text-sm text-neg-600">
                                            {errors.acceptTerms.message}
                                        </p>
                                    )}
                                </div>

                                {/* Create account */}
                                <button
                                    type="submit"
                                    disabled={registerMutation.isPending}
                                    className="h-14 w-full rounded-lg bg-ink-900 px-5 text-base font-medium text-white shadow-xs transition hover:bg-ink-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {registerMutation.isPending
                                        ? "Creating account..."
                                        : "Create account"}
                                </button>
                            </form>

                            <p className="mt-6 text-center text-sm text-ink-500">
                                Already have an account?{" "}
                                <Link
                                    to="/login"
                                    className="font-medium text-ink-900 hover:underline"
                                >
                                    Log in
                                </Link>
                            </p>
                        </div>
                    </div>

                    <footer className="pt-6 text-center text-sm text-ink-500">
                        © 2026 Finance Tracker ·{" "}
                        <Link
                            to="/privacy"
                            className="underline underline-offset-2"
                        >
                            Privacy
                        </Link>{" "}
                        ·{" "}
                        <Link
                            to="/terms"
                            className="underline underline-offset-2"
                        >
                            Terms
                        </Link>
                    </footer>
                </section>

                {/* Showcase panel */}
                <aside className="relative hidden overflow-hidden rounded-[22px] bg-ink-950 lg:flex lg:w-1/2">
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

                        <div className="flex flex-1 flex-col justify-center">
                            <div className="mb-12 max-w-150 rounded-2xl bg-white p-7 shadow-lg">
                                <p className="text-sm font-medium uppercase tracking-wide text-ink-500">
                                    September net
                                </p>

                                <p className="mt-3 text-4xl font-semibold tracking-tight text-ink-950">
                                    +$4,212
                                    <span className="text-ink-400">.38</span>
                                </p>

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

export default RegisterPage;
