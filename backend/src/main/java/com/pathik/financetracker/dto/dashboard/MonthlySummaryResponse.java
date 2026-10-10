package com.pathik.financetracker.dto.dashboard;

import java.math.BigDecimal;

public record MonthlySummaryResponse(
        int month,
        BigDecimal totalIncome,
        BigDecimal totalExpense,
        BigDecimal balance,
        long incomeTransactionCount,
        long expenseTransactionCount
) {
}

