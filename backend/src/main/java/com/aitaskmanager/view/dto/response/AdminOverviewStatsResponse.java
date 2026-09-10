package com.aitaskmanager.view.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminOverviewStatsResponse {
    private long totalUsers;
    private long activeUsers;
    private long adminUsers;
    private long totalTasks;
    private long completedTasks;
    private long inProgressTasks;
    private long overdueTasks;
    private long totalActivities;
    private long activitiesToday;
    private Map<String, Long> categoryBreakdown;
}
