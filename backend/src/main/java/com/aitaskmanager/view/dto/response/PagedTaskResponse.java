package com.aitaskmanager.view.dto.response;

import lombok.*;

import java.util.List;

/**
 * View layer DTO wrapping a page of tasks with pagination
 * metadata, returned by GET /api/tasks.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PagedTaskResponse {
    private List<TaskResponse> tasks;
    private int currentPage;
    private int totalPages;
    private long totalElements;
    private int pageSize;
    private boolean hasNext;
    private boolean hasPrevious;
}
