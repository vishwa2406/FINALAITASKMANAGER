package com.aitaskmanager.view.dto.request;

import com.aitaskmanager.model.enums.TaskPriority;
import com.aitaskmanager.model.enums.TaskStatus;
import lombok.*;

import java.time.LocalDate;

/**
 * View layer DTO — captures search/filter/pagination/sort
 * query parameters from GET /api/tasks into one object that
 * the Service layer can work with.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskFilterRequest {
    private TaskStatus status;
    private TaskPriority priority;
    private String category;
    private String searchTerm;
    private LocalDate dueDateFrom;
    private LocalDate dueDateTo;
    private String viewType;      // INCOMING, OUTGOING, DEPARTMENT, WAITING_REVIEW
    private String sortBy;        // title, dueDate, createdAt, priority
    private String sortDirection; // ASC or DESC
    private int page;
    private int size;
}
