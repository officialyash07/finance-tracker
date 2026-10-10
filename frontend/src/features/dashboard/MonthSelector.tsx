import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

interface MonthSelectorProps {
    year: number;
    month: number;
    onChange: (year: number, month: number) => void;
}

const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

const MonthSelector = ({ year, month, onChange }: MonthSelectorProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [pickerYear, setPickerYear] = useState(year);
    const containerRef = useRef<HTMLDivElement>(null);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const isCurrentMonth = year === currentYear && month === currentMonth;

    const formattedMonth = new Intl.DateTimeFormat("en", {
        month: "long",
        year: "numeric",
    }).format(new Date(year, month - 1, 1));

    useEffect(() => {
        if (!isOpen) return;

        const handleOutsideClick = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen]);

    const changeMonth = (offset: number) => {
        const nextDate = new Date(year, month - 1 + offset, 1);
        const nextYear = nextDate.getFullYear();
        const nextMonth = nextDate.getMonth() + 1;

        if (
            nextYear > currentYear ||
            (nextYear === currentYear && nextMonth > currentMonth)
        ) {
            return;
        }

        onChange(nextYear, nextMonth);
    };

    const openPicker = () => {
        setPickerYear(year);
        setIsOpen((previous) => !previous);
    };

    const selectMonth = (selectedMonth: number) => {
        const isFuture =
            pickerYear > currentYear ||
            (pickerYear === currentYear && selectedMonth > currentMonth);

        if (isFuture) return;

        onChange(pickerYear, selectedMonth);
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className="relative">
            <div className="inline-flex h-11 max-w-full items-center overflow-hidden rounded-xl border border-border bg-white shadow-xs">
                <button
                    type="button"
                    onClick={() => changeMonth(-1)}
                    aria-label="Previous month"
                    className="flex h-full w-9 shrink-0 items-center justify-center text-ink-600 transition hover:bg-canvas sm:w-10"
                >
                    <ChevronLeft size={18} />
                </button>

                <button
                    type="button"
                    onClick={openPicker}
                    aria-label="Choose month and year"
                    aria-expanded={isOpen}
                    className="flex h-full min-w-0 flex-1 items-center justify-center gap-2 border-x border-border px-2 text-sm font-medium text-ink-950 transition hover:bg-canvas sm:min-w-44 sm:px-3"
                >
                    <CalendarDays size={17} className="shrink-0 text-ink-500" />
                    <span className="whitespace-nowrap">{formattedMonth}</span>
                </button>

                <button
                    type="button"
                    onClick={() => changeMonth(1)}
                    disabled={isCurrentMonth}
                    aria-label="Next month"
                    className="flex h-full w-9 shrink-0 items-center justify-center text-ink-600 transition hover:bg-canvas disabled:cursor-not-allowed disabled:text-ink-300 sm:w-10"
                >
                    <ChevronRight size={18} />
                </button>
            </div>

            {isOpen && (
                <div
                    role="dialog"
                    aria-label="Select month"
                    className="absolute left-0 top-full z-50 mt-2 w-[min(300px,calc(100vw-2rem))] rounded-xl border border-border bg-white p-3 shadow-lg sm:left-auto sm:right-0 sm:p-4"
                >
                    <div className="mb-3 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() =>
                                setPickerYear((previous) => previous - 1)
                            }
                            aria-label="Previous year"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-600 transition hover:bg-canvas"
                        >
                            <ChevronLeft size={19} />
                        </button>

                        <h2 className="text-base font-semibold text-ink-950">
                            {pickerYear}
                        </h2>

                        <button
                            type="button"
                            onClick={() =>
                                setPickerYear((previous) =>
                                    Math.min(previous + 1, currentYear),
                                )
                            }
                            disabled={pickerYear >= currentYear}
                            aria-label="Next year"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-600 transition hover:bg-canvas disabled:cursor-not-allowed disabled:text-ink-300"
                        >
                            <ChevronRight size={19} />
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                        {MONTHS.map((monthName, index) => {
                            const monthNumber = index + 1;

                            const selected =
                                year === pickerYear && month === monthNumber;

                            const future =
                                pickerYear > currentYear ||
                                (pickerYear === currentYear &&
                                    monthNumber > currentMonth);

                            return (
                                <button
                                    key={monthName}
                                    type="button"
                                    disabled={future}
                                    onClick={() => selectMonth(monthNumber)}
                                    aria-pressed={selected}
                                    className={`h-10 rounded-lg text-sm font-medium transition ${
                                        selected
                                            ? "bg-ink-900 text-white"
                                            : future
                                              ? "cursor-not-allowed text-ink-300"
                                              : "text-ink-700 hover:bg-canvas"
                                    }`}
                                >
                                    {monthName}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MonthSelector;
