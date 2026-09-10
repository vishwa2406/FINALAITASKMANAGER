package com.aitaskmanager.view.dto.request;

import com.aitaskmanager.model.enums.ActivityCategory;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Data
public class ActivityFilterRequest {
    private ActivityCategory category;
    private String userEmail;
    private String search;
    
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime startDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime endDate;

    private int page = 0;
    private int size = 15;
    private String sortBy = "createdAt";
    private String sortDirection = "DESC";
}
