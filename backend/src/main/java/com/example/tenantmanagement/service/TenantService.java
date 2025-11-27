package com.example.tenantmanagement.service;

import com.example.tenantmanagement.domain.Property;
import com.example.tenantmanagement.domain.Tenant;
import com.example.tenantmanagement.repository.PropertyRepository;
import com.example.tenantmanagement.repository.TenantRepository;
import com.example.tenantmanagement.repository.TransactionRepository;
import com.example.tenantmanagement.web.dto.TenantDto;
import com.example.tenantmanagement.web.dto.TransactionDto;
import com.example.tenantmanagement.web.dto.PaginatedResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TenantService {
    private final TenantRepository repo;
    private final PropertyRepository propertyRepository;
    private final TransactionRepository transactionRepository;

    public TenantService(TenantRepository repo, PropertyRepository propertyRepository,
            TransactionRepository transactionRepository) {
        this.repo = repo;
        this.propertyRepository = propertyRepository;
        this.transactionRepository = transactionRepository;
    }

    public PaginatedResponse<TenantDto> list(int page, int size) {
        Page<Tenant> result = repo.findAllWithProperty(PageRequest.of(page - 1, size, Sort.by("id").descending()));
        List<TenantDto> dtos = result.getContent().stream().map(Mapping::toDto).collect(Collectors.toList());
        return new PaginatedResponse<>(dtos, result.getTotalPages(), result.getNumber() + 1, result.getTotalElements());
    }

    public TenantDto create(TenantDto dto) {
        Tenant e = new Tenant();
        apply(dto, e);
        return Mapping.toDto(repo.save(e));
    }

    public TenantDto get(Long id) {
        return Mapping.toDto(repo.findByIdWithProperty(id));
    }

    public TenantDto update(Long id, TenantDto dto) {
        Tenant e = repo.findById(id).orElseThrow();
        apply(dto, e);
        return Mapping.toDto(repo.save(e));
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

    public List<TransactionDto> getTransactions(Long tenantId) {
        return transactionRepository.findByTenantId(tenantId).stream()
                .map(Mapping::toDto)
                .collect(Collectors.toList());
    }

    private void apply(TenantDto dto, Tenant e) {
        if (dto.name != null)
            e.setName(dto.name);
        if (dto.propertyId != null) {
            Property p = propertyRepository.findById(dto.propertyId).orElseThrow();
            e.setProperty(p);
        }
        e.setPassport(dto.passport);
        e.setPassportValidity(dto.passportValidity);
        e.setAadharNo(dto.aadharNo);
        e.setEmploymentDetails(dto.employmentDetails);
        e.setPermanentAddress(dto.permanentAddress);
        e.setContactNo(dto.contactNo);
        e.setEmergencyContactNo(dto.emergencyContactNo);
        if (dto.rent != null)
            e.setRent(dto.rent);
        if (dto.security != null)
            e.setSecurity(dto.security);
        e.setMoveInDate(dto.moveInDate);
        e.setContractStartDate(dto.contractStartDate);
        e.setContractExpiryDate(dto.contractExpiryDate);
    }

    public List<TenantDto> getTenantsWithOutstandingBalances() {
        java.time.LocalDate now = java.time.LocalDate.now();
        java.time.LocalDate start = now.withDayOfMonth(1);
        java.time.LocalDate end = now.withDayOfMonth(now.lengthOfMonth());

        List<com.example.tenantmanagement.domain.Transaction> transactions = transactionRepository
                .findByDateRange(start, end);
        java.util.Set<Long> paidTenantIds = transactions.stream()
                .filter(t -> t.getTenant() != null)
                .map(t -> t.getTenant().getId())
                .collect(Collectors.toSet());

        return repo.findAll().stream()
                .filter(t -> !paidTenantIds.contains(t.getId()))
                .map(Mapping::toDto)
                .collect(Collectors.toList());
    }
}
