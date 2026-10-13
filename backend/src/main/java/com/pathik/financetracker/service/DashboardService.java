package com.pathik.financetracker.service;

import com.pathik.financetracker.dto.dashboard.CategorySummaryResponse;
import com.pathik.financetracker.dto.dashboard.DashboardSummaryResponse;
import com.pathik.financetracker.dto.dashboard.MonthlySummaryResponse;
import com.pathik.financetracker.dto.transaction.TransactionResponse;
import com.pathik.financetracker.entity.TransactionType;
import com.pathik.financetracker.mapper.TransactionMapper;
import com.pathik.financetracker.repository.TransactionRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
public class DashboardService {

    private final TransactionRepository transactionRepository;
    private final TransactionMapper transactionMapper;

    public DashboardService(
            TransactionRepository transactionRepository,
            TransactionMapper transactionMapper
    ) {
        this.transactionRepository = transactionRepository;
        this.transactionMapper = transactionMapper;
    }

    public DashboardSummaryResponse getSummary(UUID userId) {
        BigDecimal totalIncome =
                transactionRepository.sumAmountByUserIdAndType(
                        userId,
                        TransactionType.INCOME
                );

        BigDecimal totalExpense =
                transactionRepository.sumAmountByUserIdAndType(
                        userId,
                        TransactionType.EXPENSE
                );

        BigDecimal balance = totalIncome.subtract(totalExpense);

        return new DashboardSummaryResponse(
                totalIncome,
                totalExpense,
                balance
        );
    }

    public List<MonthlySummaryResponse> getMonthlySummary(
            UUID userId,
            int year
    ) {
        List<Object[]> totalRows =
                transactionRepository.findMonthlyTotals(userId, year);

        Map<Integer, BigDecimal> incomeByMonth = new HashMap<>();
        Map<Integer, BigDecimal> expenseByMonth = new HashMap<>();

        for (Object[] row : totalRows) {
            int month = ((Number) row[0]).intValue();
            TransactionType type = (TransactionType) row[1];
            BigDecimal total = (BigDecimal) row[2];

            if (type == TransactionType.INCOME) {
                incomeByMonth.put(month, total);
            } else {
                expenseByMonth.put(month, total);
            }
        }

        List<Object[]> countRows =
                transactionRepository.countMonthlyTransactionsByUserId(
                        userId,
                        year
                );

        Map<Integer, Long> incomeCountByMonth = new HashMap<>();
        Map<Integer, Long> expenseCountByMonth = new HashMap<>();

        for (Object[] row : countRows) {
            int month = ((Number) row[0]).intValue();
            TransactionType type = (TransactionType) row[1];
            long count = ((Number) row[2]).longValue();

            if (type == TransactionType.INCOME) {
                incomeCountByMonth.put(month, count);
            } else {
                expenseCountByMonth.put(month, count);
            }
        }

        List<MonthlySummaryResponse> result = new ArrayList<>();

        for (int month = 1; month <= 12; month++) {
            BigDecimal income =
                    incomeByMonth.getOrDefault(month, BigDecimal.ZERO);

            BigDecimal expense =
                    expenseByMonth.getOrDefault(month, BigDecimal.ZERO);

            long incomeCount =
                    incomeCountByMonth.getOrDefault(month, 0L);

            long expenseCount =
                    expenseCountByMonth.getOrDefault(month, 0L);

            result.add(
                    new MonthlySummaryResponse(
                            month,
                            income,
                            expense,
                            income.subtract(expense),
                            incomeCount,
                            expenseCount
                    )
            );
        }

        return result;
    }

    public List<CategorySummaryResponse> getCategorySummary(
            UUID userId,
            int year,
            int month
    ) {
        List<Object[]> rows =
                transactionRepository.findCategoryTotals(
                        userId,
                        TransactionType.EXPENSE,
                        year,
                        month
                );

        return rows.stream()
                .map(row -> new CategorySummaryResponse(
                        (UUID) row[0],
                        (String) row[1],
                        (BigDecimal) row[2]
                ))
                .toList();
    }

    public List<CategorySummaryResponse> getAllTimeCategorySummary(UUID userId) {
        List<Object[]> rows =
                transactionRepository.findAllTimeCategoryTotals(
                        userId,
                        TransactionType.EXPENSE
                );

        return rows.stream()
                .map(row -> new CategorySummaryResponse(
                        (UUID) row[0],
                        (String) row[1],
                        (BigDecimal) row[2]
                ))
                .toList();
    }

    public List<TransactionResponse> getRecentTransactions(
            UUID userId,
            int limit
    ) {
        Pageable pageable = PageRequest.of(0, limit);

        return transactionRepository
                .findRecentTransactions(userId, pageable)
                .stream()
                .map(transactionMapper::toResponse)
                .toList();
    }
}
