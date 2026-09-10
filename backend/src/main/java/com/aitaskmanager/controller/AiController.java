package com.aitaskmanager.controller;

import com.aitaskmanager.service.AiService;
import com.aitaskmanager.view.dto.response.ApiResponse;
import com.aitaskmanager.view.dto.response.TaskResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ============================================================
 * CONTROLLER — AI Endpoints
 * ============================================================
 * Thin controller — just routes HTTP calls to AiService and
 * wraps every result in the standard ApiResponse View shape.
 *
 * Endpoints:
 *   POST /api/ai/tasks/{id}/suggest    → per-task GPT advice
 *   GET  /api/ai/productivity-analysis → overall analysis
 *   GET  /api/ai/task-suggestions      → suggested new tasks
 * ============================================================
 */
@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/tasks/{id}/suggest")
    public ResponseEntity<ApiResponse<TaskResponse>> suggest(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        TaskResponse task = aiService.getTaskSuggestion(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("AI suggestion generated", task));
    }

    @GetMapping("/productivity-analysis")
    public ResponseEntity<ApiResponse<String>> productivityAnalysis(
            @AuthenticationPrincipal UserDetails userDetails) {

        String analysis = aiService.getProductivityAnalysis(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Analysis complete", analysis));
    }

    @GetMapping("/task-suggestions")
    public ResponseEntity<ApiResponse<List<String>>> taskSuggestions(
            @AuthenticationPrincipal UserDetails userDetails) {

        List<String> suggestions = aiService.getTaskSuggestions(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Suggestions generated", suggestions));
    }
}
