package com.example.tenantmanagement.web;

import java.util.List;

import com.example.tenantmanagement.service.TenantService;
import com.example.tenantmanagement.web.dto.TenantDto;
import com.example.tenantmanagement.web.dto.TransactionDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.example.tenantmanagement.web.dto.PaginatedResponse;

@RestController
@RequestMapping("/api/tenants")
public class TenantController {
    private final TenantService service;

    public TenantController(TenantService service) {
        this.service = service;
    }

    @GetMapping
    public PaginatedResponse<TenantDto> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "15") int per_page) {
        return service.list(page, per_page);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TenantDto create(@Valid @RequestBody TenantDto dto) {
        return service.create(dto);
    }

    @GetMapping("/{id}")
    public TenantDto get(@PathVariable Long id) {
        return service.get(id);
    }

    @PutMapping("/{id}")
    public TenantDto update(@PathVariable Long id, @RequestBody TenantDto dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @GetMapping("/{id}/transactions")
    public List<TransactionDto> getTransactions(@PathVariable Long id) {
        return service.getTransactions(id);
    }
}
