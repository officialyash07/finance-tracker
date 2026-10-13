export interface CurrencyOption {
    code: string;
    name: string;
}

export const CURRENCIES: CurrencyOption[] = [
    { code: "USD", name: "US Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "GBP", name: "British Pound" },
    { code: "JPY", name: "Japanese Yen" },
    { code: "CAD", name: "Canadian Dollar" },
    { code: "INR", name: "Indian Rupee" },
    { code: "AUD", name: "Australian Dollar" },
];
