import { useEffect, useRef, useState } from "react";
import {
    Check,
    ChevronDown,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    ShieldCheck,
    UserRound,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import apiClient from "../../api/client";
import { useAppDispatch } from "../../store/hooks";
import { setAuthenticatedUser } from "../auth/authSlice";
import type { User } from "../../types/user";
import { CURRENCIES } from "./currencies";
import { getCurrencySymbol } from "../../utils/currency";

type ProfileTab = "personal" | "security";

const REQUIREMENTS = [
    { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
    { label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
    { label: "One number", test: (v: string) => /\d/.test(v) },
    {
        label: "One special character",
        test: (v: string) => /[^A-Za-z0-9]/.test(v),
    },
];

const inputClass =
    "w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-sm text-ink-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100";

function PasswordInput({
    label,
    value,
    onChange,
    autoComplete,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    autoComplete: "current-password" | "new-password";
}) {
    const [visible, setVisible] = useState(false);

    return (
        <label className="block">
            <span className="mb-2 block text-sm font-medium text-ink-800">
                {label}
            </span>
            <span className="relative block">
                <input
                    required
                    type={visible ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    autoComplete={autoComplete}
                    className={`${inputClass} pr-12`}
                />
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex items-center px-3.5 text-ink-500"
                >
                    {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </span>
        </label>
    );
}

function CurrencyDropdown({
    value,
    onChange,
    disabled,
}: {
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const selected = CURRENCIES.find((currency) => currency.code === value) ?? {
        code: value,
        name: value,
    };

    useEffect(() => {
        const outsideClick = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        const escape = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };

        document.addEventListener("mousedown", outsideClick);
        document.addEventListener("keydown", escape);

        return () => {
            document.removeEventListener("mousedown", outsideClick);
            document.removeEventListener("keydown", escape);
        };
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className={`flex w-full items-center gap-4 rounded-xl border border-border bg-surface px-3.5 py-3 text-left outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100 ${
                    disabled ? "cursor-not-allowed opacity-60" : ""
                }`}
            >
                <span className="w-12 shrink-0 text-sm text-ink-500">
                    {selected.code}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink-900">
                    {selected.name}
                </span>
                <ChevronDown
                    size={18}
                    className={`shrink-0 text-ink-500 transition ${
                        open ? "rotate-180" : ""
                    }`}
                />
            </button>

            {open && (
                <div
                    role="listbox"
                    aria-label="Preferred currency"
                    className="absolute left-0 right-0 top-full z-100 mt-2 max-h-72 overflow-y-auto rounded-xl border border-border bg-surface p-1.5 shadow-xl"
                >
                    {CURRENCIES.map((currency) => {
                        const isSelected = currency.code === value;

                        return (
                            <button
                                key={currency.code}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => {
                                    onChange(currency.code);
                                    setOpen(false);
                                }}
                                className={`flex w-full items-center gap-3 rounded-lg px-3.5 py-3 text-left transition ${
                                    isSelected
                                        ? "bg-slate-100"
                                        : "hover:bg-canvas"
                                }`}
                            >
                                <span className="w-12 shrink-0 text-sm text-ink-500">
                                    {currency.code}
                                </span>
                                <span className="min-w-0 flex-1 text-sm font-medium text-ink-900">
                                    {currency.name}
                                </span>
                                <span className="w-9 shrink-0 text-right text-sm text-ink-500">
                                    {getCurrencySymbol(currency.code)}
                                </span>
                                <span className="flex w-4 shrink-0 justify-center">
                                    {isSelected && <Check size={17} />}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function memberSince(createdAt: string) {
    if (!createdAt) return "";

    const date = new Date(createdAt);

    return Number.isNaN(date.getTime())
        ? ""
        : date.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
          });
}

export default function ProfilePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const dispatch = useAppDispatch();
    const tab: ProfileTab =
        searchParams.get("tab") === "security" ? "security" : "personal";
    const [profile, setProfile] = useState<User | null>(null);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [currency, setCurrency] = useState("INR");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadProfile() {
            try {
                const { data } = await apiClient.get<User>("/users/me");

                if (cancelled) return;

                setProfile(data);
                setFirstName(data.firstName ?? "");
                setLastName(data.lastName ?? "");
                setCurrency(data.preferredCurrency || "INR");
            } catch {
                if (!cancelled) {
                    setError("Unable to load your profile. Please try again.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void loadProfile();

        return () => {
            cancelled = true;
        };
    }, []);

    const requirementsMet = REQUIREMENTS.map((r) => r.test(newPassword));
    const strength = requirementsMet.filter(Boolean).length;
    const passwordsMatch =
        confirmPassword.length > 0 && newPassword === confirmPassword;

    const passwordValid =
        currentPassword.length >= 8 &&
        newPassword.length >= 8 &&
        requirementsMet.every(Boolean) &&
        passwordsMatch;

    const dirty =
        !!profile &&
        (firstName !== profile.firstName ||
            lastName !== profile.lastName ||
            currency !== profile.preferredCurrency);

    const initials =
        `${firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase();

    function selectTab(nextTab: ProfileTab) {
        setError("");
        setSuccess("");
        setSearchParams((currentParams) => {
            const nextParams = new URLSearchParams(currentParams);
            if (nextTab === "security") {
                nextParams.set("tab", "security");
            } else {
                nextParams.delete("tab");
            }
            return nextParams;
        });
    }

    function discardProfile() {
        if (!profile) return;

        setFirstName(profile.firstName ?? "");
        setLastName(profile.lastName ?? "");
        setCurrency(profile.preferredCurrency || "INR");
        setError("");
        setSuccess("");
    }

    async function saveProfile(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!profile || !dirty) return;

        if (!firstName.trim() || !lastName.trim()) {
            setError("First name and last name are required.");
            return;
        }

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const { data } = await apiClient.put<User>("/users/me", {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                preferredCurrency: currency,
            });

            setProfile(data);
            dispatch(setAuthenticatedUser(data));
            setFirstName(data.firstName ?? "");
            setLastName(data.lastName ?? "");
            setCurrency(data.preferredCurrency || "INR");
            setSuccess("Your personal details have been saved.");
        } catch {
            setError("Unable to save your details. Please try again.");
        } finally {
            setSaving(false);
        }
    }

    async function changePassword(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!passwordValid) return;

        setChangingPassword(true);
        setError("");
        setSuccess("");

        try {
            await apiClient.put("/users/me/password", {
                currentPassword,
                newPassword,
            });

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setSuccess("Your password has been updated.");
        } catch {
            setError(
                "Unable to update your password. Check your current password and try again.",
            );
        } finally {
            setChangingPassword(false);
        }
    }

    return (
        <div className="min-h-full bg-canvas">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                <header className="mb-7">
                    <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
                        Profile
                    </h1>
                    <p className="mt-2 text-sm text-ink-500 sm:text-base">
                        Manage your personal details and sign-in security.
                    </p>
                </header>

                <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-6">
                    <nav
                        aria-label="Profile settings"
                        className="flex gap-2 overflow-x-auto lg:flex-col"
                    >
                        <button
                            type="button"
                            onClick={() => selectTab("personal")}
                            aria-current={
                                tab === "personal" ? "page" : undefined
                            }
                            className={`inline-flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium ${
                                tab === "personal"
                                    ? "bg-slate-200/80 text-ink-900"
                                    : "text-ink-600 hover:bg-slate-100"
                            }`}
                        >
                            <UserRound size={18} />
                            Personal details
                        </button>

                        <button
                            type="button"
                            onClick={() => selectTab("security")}
                            aria-current={
                                tab === "security" ? "page" : undefined
                            }
                            className={`inline-flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium ${
                                tab === "security"
                                    ? "bg-slate-200/80 text-ink-900"
                                    : "text-ink-600 hover:bg-slate-100"
                            }`}
                        >
                            <LockKeyhole size={18} />
                            Password &amp; security
                        </button>
                    </nav>

                    <div className="min-w-0 space-y-4">
                        {error && (
                            <div
                                role="alert"
                                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                            >
                                {error}
                            </div>
                        )}

                        {success && (
                            <div
                                role="status"
                                className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                            >
                                {success}
                            </div>
                        )}

                        {loading ? (
                            <section className="animate-pulse rounded-2xl border border-border bg-surface p-6">
                                <div className="h-6 w-48 rounded bg-slate-200" />
                                <div className="mt-6 h-16 rounded-xl bg-slate-100" />
                                <div className="mt-6 h-12 rounded-xl bg-slate-100" />
                            </section>
                        ) : !profile ? (
                            <section className="rounded-2xl border border-border bg-surface p-6">
                                <p className="text-sm text-ink-600">
                                    Your profile could not be loaded.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => window.location.reload()}
                                    className="mt-3 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white"
                                >
                                    Try again
                                </button>
                            </section>
                        ) : tab === "personal" ? (
                            <section className="relative rounded-2xl border border-border bg-surface shadow-sm">
                                <div className="border-b border-border px-5 py-5 sm:px-6">
                                    <h2 className="font-semibold text-ink-900">
                                        Personal details
                                    </h2>
                                    <p className="mt-1 text-sm text-ink-500">
                                        This is how you appear across Kept.
                                    </p>
                                </div>

                                <form onSubmit={saveProfile}>
                                    <div className="space-y-6 p-5 sm:p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xl font-semibold text-ink-800">
                                                {initials || (
                                                    <UserRound size={25} />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate font-semibold text-ink-900">
                                                    {[
                                                        profile.firstName,
                                                        profile.lastName,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(" ")}
                                                </p>
                                                <p className="mt-1 text-sm text-ink-500">
                                                    {memberSince(
                                                        profile.createdAt,
                                                    )
                                                        ? `Member since ${memberSince(profile.createdAt)}`
                                                        : "Personal account"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <label className="block">
                                                <span className="mb-2 block text-sm font-medium text-ink-800">
                                                    First name
                                                </span>
                                                <input
                                                    required
                                                    maxLength={100}
                                                    autoComplete="given-name"
                                                    value={firstName}
                                                    onChange={(e) =>
                                                        setFirstName(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={inputClass}
                                                />
                                            </label>

                                            <label className="block">
                                                <span className="mb-2 block text-sm font-medium text-ink-800">
                                                    Last name
                                                </span>
                                                <input
                                                    required
                                                    maxLength={100}
                                                    autoComplete="family-name"
                                                    value={lastName}
                                                    onChange={(e) =>
                                                        setLastName(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={inputClass}
                                                />
                                            </label>
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-ink-800">
                                                Email
                                            </label>
                                            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-slate-100 px-3.5 py-3">
                                                <Mail
                                                    size={17}
                                                    className="shrink-0 text-ink-500"
                                                />
                                                <span className="min-w-0 flex-1 break-all text-sm text-ink-800">
                                                    {profile.email}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-xs leading-5 text-ink-500">
                                                Your sign-in email can't be
                                                changed here. Contact support to
                                                update it.
                                            </p>
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-ink-800">
                                                Preferred currency
                                            </label>
                                            <CurrencyDropdown
                                                value={currency}
                                                onChange={setCurrency}
                                                disabled={saving}
                                            />
                                            <p className="mt-2 text-xs leading-5 text-ink-500">
                                                Used to display all amounts.
                                                Existing values aren't
                                                converted.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col-reverse gap-3 rounded-b-2xl border-t border-border bg-slate-100 p-4 sm:flex-row sm:justify-end sm:px-6">
                                        <button
                                            type="button"
                                            onClick={discardProfile}
                                            disabled={!dirty || saving}
                                            className="rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-ink-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Discard
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!dirty || saving}
                                            className="rounded-xl bg-[#242c39] px-4 py-3 text-sm font-semibold text-white hover:bg-[#171d27] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {saving
                                                ? "Saving..."
                                                : "Save changes"}
                                        </button>
                                    </div>
                                </form>
                            </section>
                        ) : (
                            <>
                                <section className="rounded-2xl border border-border bg-surface shadow-sm">
                                    <div className="border-b border-border px-5 py-5 sm:px-6">
                                        <h2 className="font-semibold text-ink-900">
                                            Change password
                                        </h2>
                                        <p className="mt-1 text-sm text-ink-500">
                                            Choose a strong password you don't
                                            use anywhere else.
                                        </p>
                                    </div>

                                    <form onSubmit={changePassword}>
                                        <div className="space-y-6 p-5 sm:p-6">
                                            <PasswordInput
                                                label="Current password"
                                                value={currentPassword}
                                                onChange={setCurrentPassword}
                                                autoComplete="current-password"
                                            />

                                            <div className="border-t border-border" />

                                            <div>
                                                <PasswordInput
                                                    label="New password"
                                                    value={newPassword}
                                                    onChange={setNewPassword}
                                                    autoComplete="new-password"
                                                />

                                                <div className="mt-4 grid grid-cols-4 gap-1">
                                                    {REQUIREMENTS.map(
                                                        (
                                                            requirement,
                                                            index,
                                                        ) => (
                                                            <div
                                                                key={
                                                                    requirement.label
                                                                }
                                                                className={`h-1.5 rounded-full ${
                                                                    requirementsMet[
                                                                        index
                                                                    ]
                                                                        ? strength ===
                                                                          4
                                                                            ? "bg-emerald-500"
                                                                            : "bg-amber-500"
                                                                        : "bg-slate-200"
                                                                }`}
                                                            />
                                                        ),
                                                    )}
                                                </div>

                                                <p className="mt-2 text-right text-xs text-ink-500">
                                                    {newPassword.length === 0
                                                        ? "—"
                                                        : strength <= 1
                                                          ? "Weak"
                                                          : strength <= 3
                                                            ? "Moderate"
                                                            : "Strong"}
                                                </p>

                                                <ul className="grid grid-cols-1 gap-2 text-xs text-ink-500 sm:grid-cols-2">
                                                    {REQUIREMENTS.map(
                                                        (
                                                            requirement,
                                                            index,
                                                        ) => (
                                                            <li
                                                                key={
                                                                    requirement.label
                                                                }
                                                                className="flex items-center gap-2"
                                                            >
                                                                {requirementsMet[
                                                                    index
                                                                ] ? (
                                                                    <Check
                                                                        size={
                                                                            15
                                                                        }
                                                                        className="text-emerald-600"
                                                                    />
                                                                ) : (
                                                                    <span className="h-3.5 w-3.5 rounded-full border border-slate-300" />
                                                                )}
                                                                {
                                                                    requirement.label
                                                                }
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            </div>

                                            <div>
                                                <PasswordInput
                                                    label="Confirm new password"
                                                    value={confirmPassword}
                                                    onChange={
                                                        setConfirmPassword
                                                    }
                                                    autoComplete="new-password"
                                                />
                                                {confirmPassword &&
                                                    newPassword !==
                                                        confirmPassword && (
                                                        <p
                                                            role="alert"
                                                            className="mt-2 text-xs text-red-600"
                                                        >
                                                            Passwords do not
                                                            match.
                                                        </p>
                                                    )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col-reverse gap-3 rounded-b-2xl border-t border-border bg-slate-100 p-4 sm:flex-row sm:justify-end sm:px-6">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCurrentPassword("");
                                                    setNewPassword("");
                                                    setConfirmPassword("");
                                                    setError("");
                                                    setSuccess("");
                                                }}
                                                disabled={changingPassword}
                                                className="rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-ink-700 disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={
                                                    !passwordValid ||
                                                    changingPassword
                                                }
                                                className="rounded-xl bg-[#242c39] px-4 py-3 text-sm font-semibold text-white hover:bg-[#171d27] disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {changingPassword
                                                    ? "Updating..."
                                                    : "Update password"}
                                            </button>
                                        </div>
                                    </form>
                                </section>

                                <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-sm text-ink-500 shadow-sm">
                                    <ShieldCheck
                                        size={19}
                                        className="shrink-0"
                                    />
                                    <p>
                                        <span className="font-semibold text-ink-800">
                                            Account security
                                        </span>{" "}
                                        — keep your password private and unique.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
