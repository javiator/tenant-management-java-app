package com.example.tenantmanagement.service;

import com.example.tenantmanagement.domain.Property;
import com.example.tenantmanagement.domain.Tenant;
import com.example.tenantmanagement.domain.Transaction;
import com.example.tenantmanagement.repository.PropertyRepository;
import com.example.tenantmanagement.repository.TenantRepository;
import com.example.tenantmanagement.repository.TransactionRepository;
import com.example.tenantmanagement.web.dto.TransactionDto;
import com.example.tenantmanagement.web.dto.PaginatedResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TransactionService {
    private final TransactionRepository repo;
    private final PropertyRepository propertyRepository;
    private final TenantRepository tenantRepository;

    public TransactionService(TransactionRepository repo, PropertyRepository propertyRepository,
            TenantRepository tenantRepository) {
        this.repo = repo;
        this.propertyRepository = propertyRepository;
        this.tenantRepository = tenantRepository;
    }

    public PaginatedResponse<TransactionDto> list(int page, int size) {
        Page<Transaction> result = repo
                .findAllWithRelations(PageRequest.of(page - 1, size, Sort.by("id").descending()));
        List<TransactionDto> dtos = result.getContent().stream().map(Mapping::toDto).collect(Collectors.toList());
        return new PaginatedResponse<>(dtos, result.getTotalPages(), result.getNumber() + 1, result.getTotalElements());
    }

    public List<TransactionDto> searchTransactions(LocalDate startDate, LocalDate endDate) {
        return repo.findByDateRange(startDate, endDate).stream()
                .map(Mapping::toDto)
                .collect(Collectors.toList());
    }

    public TransactionDto create(TransactionDto dto) {
        Transaction e = new Transaction();
        apply(dto, e);
        return Mapping.toDto(repo.save(e));
    }

    public TransactionDto get(Long id) {
        return Mapping.toDto(repo.findById(id).orElseThrow());
    }

    public TransactionDto update(Long id, TransactionDto dto) {
        Transaction e = repo.findById(id).orElseThrow();
        apply(dto, e);
        return Mapping.toDto(repo.save(e));
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

    private void apply(TransactionDto dto, Transaction e) {
        if (dto.propertyId != null) {
            Property p = propertyRepository.findById(dto.propertyId).orElseThrow();
            e.setProperty(p);
        }
        if (dto.tenantId != null) {
            Tenant t = tenantRepository.findById(dto.tenantId).orElseThrow();
            e.setTenant(t);
        } else {
            e.setTenant(null);
        }
        if (dto.type != null)
            e.setType(dto.type);
        e.setForMonth(dto.forMonth);
        if (dto.amount != null)
            e.setAmount(dto.amount);
        if (dto.transactionDate != null)
            e.setTransactionDate(dto.transactionDate);
        e.setComments(dto.comments);
    }
}
