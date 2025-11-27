package com.example.tenantmanagement.service;

import com.example.tenantmanagement.domain.Property;
import com.example.tenantmanagement.repository.PropertyRepository;
import com.example.tenantmanagement.repository.TransactionRepository;
import com.example.tenantmanagement.web.dto.PropertyDto;
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
public class PropertyService {
    private final PropertyRepository repo;
    private final TransactionRepository transactionRepository;

    public PropertyService(PropertyRepository repo, TransactionRepository transactionRepository) {
        this.repo = repo;
        this.transactionRepository = transactionRepository;
    }

    public PaginatedResponse<PropertyDto> list(int page, int size) {
        Page<Property> result = repo.findAll(PageRequest.of(page - 1, size, Sort.by("id").descending()));
        List<PropertyDto> dtos = result.getContent().stream().map(Mapping::toDto).collect(Collectors.toList());
        return new PaginatedResponse<>(dtos, result.getTotalPages(), result.getNumber() + 1, result.getTotalElements());
    }

    public PropertyDto create(PropertyDto dto) {
        Property e = new Property();
        e.setAddress(dto.address);
        e.setRent(dto.rent);
        e.setMaintenance(dto.maintenance);
        return Mapping.toDto(repo.save(e));
    }

    public PropertyDto get(Long id) {
        return Mapping.toDto(repo.findById(id).orElseThrow());
    }

    public PropertyDto update(Long id, PropertyDto dto) {
        Property e = repo.findById(id).orElseThrow();
        if (dto.address != null)
            e.setAddress(dto.address);
        if (dto.rent != null)
            e.setRent(dto.rent);
        if (dto.maintenance != null)
            e.setMaintenance(dto.maintenance);
        return Mapping.toDto(repo.save(e));
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

    public List<TransactionDto> getTransactions(Long propertyId) {
        return transactionRepository.findByPropertyId(propertyId).stream()
                .map(Mapping::toDto)
                .collect(Collectors.toList());
    }
}
