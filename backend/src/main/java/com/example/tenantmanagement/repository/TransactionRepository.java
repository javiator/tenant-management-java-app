package com.example.tenantmanagement.repository;

import com.example.tenantmanagement.domain.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query(value = "SELECT t FROM Transaction t LEFT JOIN FETCH t.tenant LEFT JOIN FETCH t.property", countQuery = "SELECT count(t) FROM Transaction t")
    org.springframework.data.domain.Page<Transaction> findAllWithRelations(
            org.springframework.data.domain.Pageable pageable);

    @Query("SELECT t FROM Transaction t LEFT JOIN FETCH t.tenant LEFT JOIN FETCH t.property WHERE t.tenant.id = :tenantId")
    List<Transaction> findByTenantId(@Param("tenantId") Long tenantId);

    @Query("SELECT t FROM Transaction t LEFT JOIN FETCH t.tenant LEFT JOIN FETCH t.property WHERE t.property.id = :propertyId")
    List<Transaction> findByPropertyId(@Param("propertyId") Long propertyId);

    @Query("SELECT t FROM Transaction t LEFT JOIN FETCH t.tenant LEFT JOIN FETCH t.property WHERE t.transactionDate BETWEEN :startDate AND :endDate")
    List<Transaction> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
