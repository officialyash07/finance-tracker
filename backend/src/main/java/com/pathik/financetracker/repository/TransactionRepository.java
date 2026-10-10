package com.pathik.financetracker.repository;

import com.pathik.financetracker.entity.Transaction;
import com.pathik.financetracker.entity.TransactionType;
import com.pathik.financetracker.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    @EntityGraph(attributePaths = "category")
    Optional<Transaction> findByIdAndUserId(UUID transactionId, UUID userId);

    @EntityGraph(attributePaths = "category")
    Page<Transaction> findAllByUserId(UUID userId, Pageable pageable);

//    UUID user(User user);

    @Query("""
        SELECT t
        FROM Transaction t
        WHERE t.user.id = :userId
          AND (:type IS NULL OR t.transactionType = :type)
          AND (:categoryId IS NULL OR t.category.id = :categoryId)
          AND (:fromDate IS NULL OR t.transactionDate >= :fromDate)
          AND (:toDate IS NULL OR t.transactionDate <= :toDate)
        """)
    @EntityGraph(attributePaths = "category")
    Page<Transaction> findTransactions(
            @Param("userId") UUID userId,
            @Param("type")TransactionType type,
            @Param("categoryId") UUID categoryId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate  toDate,
            Pageable pageable
            );

    UUID user(User user);

    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.user.id = :userId
          AND t.transactionType = :type
        """)
    BigDecimal sumAmountByUserIdAndType(@Param("userId") UUID userId, @Param("type") TransactionType type);

    @Query("""
        SELECT
            MONTH(t.transactionDate),
            t.transactionType,
            COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.user.id = :userId
          AND YEAR(t.transactionDate) = :year
        GROUP BY MONTH(t.transactionDate), t.transactionType
        ORDER BY MONTH(t.transactionDate)
        """)
    List<Object[]> findMonthlyTotals(@Param("userId") UUID userId, @Param("year") int year);

    @Query("""
        SELECT
            c.id,
            c.name,
            COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        JOIN t.category c
        WHERE t.user.id = :userId
          AND t.transactionType = :type
          AND YEAR(t.transactionDate) = :year
          AND MONTH(t.transactionDate) = :month
        GROUP BY c.id, c.name
        ORDER BY SUM(t.amount) DESC
        """)
    List<Object[]> findCategoryTotals(
            @Param("userId") UUID userId,
            @Param("type") TransactionType type,
            @Param("year") int year,
            @Param("month") int month
    );

    @EntityGraph(attributePaths = "category")
    @Query("""
        SELECT t
        FROM Transaction t
        WHERE t.user.id = :userId
        ORDER BY t.transactionDate DESC, t.createdAt DESC
        """)
    List<Transaction> findRecentTransactions(@Param("userId") UUID userId, Pageable pageable);

    @Query("""
        SELECT MONTH(t.transactionDate), t.transactionType, COUNT(t)
        FROM Transaction t
        WHERE t.user.id = :userId
          AND YEAR(t.transactionDate) = :year
        GROUP BY MONTH(t.transactionDate), t.transactionType
        """)
    List<Object[]> countMonthlyTransactionsByUserId(
            @Param("userId") UUID userId,
            @Param("year") int year
    );
}
