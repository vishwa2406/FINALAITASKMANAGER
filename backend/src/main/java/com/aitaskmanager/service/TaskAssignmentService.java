package com.aitaskmanager.service;

import com.aitaskmanager.model.entity.Task;
import com.aitaskmanager.model.entity.TaskComment;
import com.aitaskmanager.model.entity.TaskHistory;
import com.aitaskmanager.model.entity.User;
import com.aitaskmanager.model.enums.TaskStatus;
import com.aitaskmanager.repository.TaskCommentRepository;
import com.aitaskmanager.repository.TaskHistoryRepository;
import com.aitaskmanager.view.dto.response.TaskCommentResponse;
import com.aitaskmanager.view.dto.response.TaskHistoryResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TaskAssignmentService {

    private final TaskHistoryRepository historyRepository;
    private final TaskCommentRepository commentRepository;

    public void recordHistory(Task task, User performedBy, String action, TaskStatus oldStatus, TaskStatus newStatus, String comment) {
        TaskHistory history = TaskHistory.builder()
                .task(task)
                .performedBy(performedBy)
                .action(action)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .comment(comment)
                .build();
        historyRepository.save(history);
        log.info("Recorded TaskHistory for Task id={}: action={}", task.getId(), action);
    }

    public TaskCommentResponse addComment(Task task, User user, String commentText) {
        TaskComment comment = TaskComment.builder()
                .task(task)
                .user(user)
                .comment(commentText)
                .build();
        TaskComment saved = commentRepository.save(comment);

        // Record history event for comment addition
        recordHistory(task, user, "COMMENT_ADDED", task.getStatus(), task.getStatus(), "Added comment: " + (commentText.length() > 50 ? commentText.substring(0, 50) + "..." : commentText));

        return mapToCommentResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TaskHistoryResponse> getTaskHistory(Long taskId) {
        return historyRepository.findByTaskIdOrderByCreatedAtDesc(taskId).stream()
                .map(this::mapToHistoryResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TaskCommentResponse> getTaskComments(Long taskId) {
        return commentRepository.findByTaskIdOrderByCreatedAtAsc(taskId).stream()
                .map(this::mapToCommentResponse)
                .collect(Collectors.toList());
    }

    public TaskHistoryResponse mapToHistoryResponse(TaskHistory h) {
        return TaskHistoryResponse.builder()
                .id(h.getId())
                .taskId(h.getTask().getId())
                .performedByUserId(h.getPerformedBy().getId())
                .performedByUserName(h.getPerformedBy().getFullName())
                .performedByUserEmail(h.getPerformedBy().getEmail())
                .action(h.getAction())
                .oldStatus(h.getOldStatus())
                .newStatus(h.getNewStatus())
                .comment(h.getComment())
                .createdAt(h.getCreatedAt())
                .build();
    }

    public TaskCommentResponse mapToCommentResponse(TaskComment c) {
        return TaskCommentResponse.builder()
                .id(c.getId())
                .taskId(c.getTask().getId())
                .userId(c.getUser().getId())
                .userName(c.getUser().getFullName())
                .userEmail(c.getUser().getEmail())
                .comment(c.getComment())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
