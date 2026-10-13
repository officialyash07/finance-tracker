export const formatCurrency = (amount: number, currency: string): string =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
    }).format(amount);

export const getCurrencySymbol = (currency: string): string =>
    new Intl.NumberFormat("en", {
        style: "currency",
        currency,
        currencyDisplay: "narrowSymbol",
    })
        .formatToParts(0)
        .find((part) => part.type === "currency")?.value ?? currency;
