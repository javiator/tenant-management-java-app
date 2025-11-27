package com.example.tenantmanagement.web.dto;

import java.util.List;

public class PaginatedResponse<T> {
    public List<T> data;
    public int pages;
    public int currentPage;
    public long total;

    public PaginatedResponse(List<T> data, int pages, int currentPage, long total) {
        this.data = data;
        this.pages = pages;
        this.currentPage = currentPage;
        this.total = total;
    }
}
