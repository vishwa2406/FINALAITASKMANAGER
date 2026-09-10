package com.aitaskmanager.view.dto.response;

import lombok.*;

import java.util.List;

/**
 * View layer DTO for GET /api/tasks/dashboard.
 * An aggregate/summary view built by TaskService — never
 * a 1:1 mirror of a single Model entity.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long total;
    private long completed;
    private long inProgress;
    private long todo;
    private long submittedForReview;
    private long cancelled;
    private long incomingCount;
    private long outgoingCount;
    private long waitingReviewCount;
    private List<TaskResponse> dueSoon;
    private List<TaskResponse> overdue;
    private double completionRate;
}
