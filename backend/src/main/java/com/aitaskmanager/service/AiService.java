package com.aitaskmanager.service;

import com.aitaskmanager.exception.ResourceNotFoundException;
import com.aitaskmanager.model.entity.Task;
import com.aitaskmanager.model.entity.User;
import com.aitaskmanager.repository.TaskRepository;
import com.aitaskmanager.repository.UserRepository;
import com.aitaskmanager.view.dto.response.TaskResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * ============================================================
 * SERVICE — AI Business Logic
 * ============================================================
 * Bridges the Model (Task entities) with the OpenAI external
 * API, then surfaces results as View response DTOs.
 *
 * Three capabilities:
 *  1. getTaskSuggestion  — per-task GPT analysis
 *  2. getProductivityAnalysis — cross-task pattern analysis
 *  3. getTaskSuggestions — GPT-recommended new task titles
 * ============================================================
 */
import com.aitaskmanager.model.enums.ActivityCategory;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AiService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final TaskService taskService;
    private final ActivityLogService activityLogService;

    @Value("${app.openai.base-url}")
    private String openAiBaseUrl;

    @Value("${app.openai.api-key}")
    private String openAiApiKey;

    @Value("${app.openai.model}")
    private String openAiModel;

    @Value("${app.openai.max-tokens}")
    private int maxTokens;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ────────────────────────────────────────────────────────────
    // 1. Per-task AI suggestion
    // ────────────────────────────────────────────────────────────
    public TaskResponse getTaskSuggestion(Long taskId, String userEmail) {
        User user = findUserByEmail(userEmail);
        Task task = taskRepository.findByIdAndUserId(taskId, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));

        String suggestion = callOpenAI(buildTaskPrompt(task));

        // Persist the AI result back onto the Model entity
        task.setAiSuggestion(suggestion);
        task.setAiAnalyzed(true);
        taskRepository.save(task);

        log.info("AI suggestion saved for task id={}", taskId);
        activityLogService.logActivity(user, ActivityCategory.AI, "AI_SUGGESTION_REQUESTED", "TASK", taskId, "Requested AI suggestion for task: " + task.getTitle());
        // Return View DTO (never the raw Model entity)
        return taskService.mapToResponse(task);
    }

    // ────────────────────────────────────────────────────────────
    // 2. Productivity analysis
    // ────────────────────────────────────────────────────────────
    public String getProductivityAnalysis(String userEmail) {
        User user = findUserByEmail(userEmail);
        List<Task> tasks = taskRepository.findRecentTasksByUserId(
            user.getId(), PageRequest.of(0, 20));

        if (tasks.isEmpty()) {
            return "No tasks found. Start creating tasks to get AI productivity insights!";
        }
        activityLogService.logActivity(user, ActivityCategory.AI, "AI_PRODUCTIVITY_ANALYSIS", "USER", user.getId(), "Generated AI productivity analysis report");
        return callOpenAI(buildAnalysisPrompt(tasks, user.getFullName()));
    }

    // ────────────────────────────────────────────────────────────
    // 3. Suggested new tasks
    // ────────────────────────────────────────────────────────────
    public List<String> getTaskSuggestions(String userEmail) {
        User user = findUserByEmail(userEmail);
        List<Task> existing = taskRepository.findRecentTasksByUserId(
            user.getId(), PageRequest.of(0, 10));

        String response = callOpenAI(buildSuggestionsPrompt(existing));
        return parseNumberedList(response);
    }

    // ────────────────────────────────────────────────────────────
    // Prompt builders
    // ────────────────────────────────────────────────────────────
    private String buildTaskPrompt(Task t) {
        return String.format("""
            You are a productivity expert. Analyze this task and give actionable advice.

            Task: %s
            Description: %s
            Priority: %s
            Status: %s
            Due Date: %s
            Estimated Hours: %s
            Category: %s

            Provide:
            1. Strategy (2-3 sentences)
            2. Key steps (3-5 bullet points)
            3. Potential challenges and solutions
            4. One specific time management tip

            Keep the response under 300 words and practical.
            """,
            t.getTitle(),
            t.getDescription() != null ? t.getDescription() : "No description",
            t.getPriority(),
            t.getStatus(),
            t.getDueDate() != null ? t.getDueDate() : "No due date",
            t.getEstimatedHours() != null ? t.getEstimatedHours() + "h" : "Not set",
            t.getCategory() != null ? t.getCategory() : "General"
        );
    }

    private String buildAnalysisPrompt(List<Task> tasks, String name) {
        long total = tasks.size();
        long done = tasks.stream().filter(t -> t.getStatus().name().equals("COMPLETED")).count();
        long overdue = tasks.stream()
            .filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(LocalDate.now())
                && !t.getStatus().name().equals("COMPLETED")).count();

        String summary = tasks.stream()
            .map(t -> "- " + t.getTitle() + " [" + t.getStatus() + "/" + t.getPriority() + "]")
            .collect(Collectors.joining("\n"));

        return String.format("""
            You are a productivity coach analyzing %s's tasks.

            Stats: %d total, %d completed (%.0f%%), %d overdue

            Recent tasks:
            %s

            Give:
            1. Strengths
            2. Areas for improvement
            3. Three actionable recommendations
            4. Motivational closing

            Be specific, practical and encouraging. Under 400 words.
            """, name, total, done, total > 0 ? (double) done / total * 100 : 0, overdue, summary);
    }

    private String buildSuggestionsPrompt(List<Task> existing) {
        String titles = existing.stream().map(Task::getTitle).collect(Collectors.joining(", "));
        return String.format("""
            Based on these existing tasks: %s

            Suggest 5 new productive tasks that complement this workflow.
            Return ONLY a numbered list (1. 2. 3. 4. 5.).
            Each title should be clear and under 10 words.
            """, titles.isBlank() ? "No existing tasks" : titles);
    }

    // ────────────────────────────────────────────────────────────
    // OpenAI HTTP call via WebClient
    // ────────────────────────────────────────────────────────────
    private String callOpenAI(String userMessage) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("model", openAiModel);
            body.put("max_tokens", maxTokens);
            body.put("messages", List.of(Map.of("role", "user", "content", userMessage)));

            WebClient client = WebClient.builder()
                .baseUrl(openAiBaseUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + openAiApiKey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();

            String json = client.post()
                .uri("/v1/chat/completions")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .block();

            JsonNode node = objectMapper.readTree(json);
            return node.path("choices").get(0).path("message").path("content").asText();

        } catch (Exception e) {
            log.error("OpenAI API error: {}", e.getMessage());
            return "AI service temporarily unavailable. Please check your API key and try again.";
        }
    }

    private List<String> parseNumberedList(String response) {
        return Arrays.stream(response.split("\n"))
            .filter(line -> line.matches("^\\d+\\..*"))
            .map(line -> line.replaceFirst("^\\d+\\.\\s*", "").trim())
            .collect(Collectors.toList());
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }
}
