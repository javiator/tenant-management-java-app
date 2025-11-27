package com.example.tenantmanagement.repository;

import com.example.tenantmanagement.domain.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TenantRepository extends JpaRepository<Tenant, Long> {

    @Query(value = "SELECT t FROM Tenant t LEFT JOIN FETCH t.property", countQuery = "SELECT count(t) FROM Tenant t")
    org.springframework.data.domain.Page<Tenant> findAllWithProperty(org.springframework.data.domain.Pageable pageable);

    @Query("SELECT t FROM Tenant t LEFT JOIN FETCH t.property WHERE t.id = :id")
    Tenant findByIdWithProperty(@Param("id") Long id);
}
