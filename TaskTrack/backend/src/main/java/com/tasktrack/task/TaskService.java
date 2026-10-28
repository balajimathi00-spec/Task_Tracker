package com.tasktrack.task;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TaskService {
    private final TaskRepository repository;

    public TaskService(TaskRepository repository) {
        this.repository = repository;
    }

    public List<Task> findAll(TaskStatus status) {
        return status == null
                ? repository.findAllByOrderByCreatedAtDesc()
                : repository.findByStatusOrderByCreatedAtDesc(status);
    }

    public Task findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
    }

    public Task create(TaskRequest request) {
        Task task = new Task();
        apply(task, request);
        return repository.save(task);
    }

    public Task update(Long id, TaskRequest request) {
        Task task = findById(id);
        apply(task, request);
        return repository.save(task);
    }

    public void delete(Long id) {
        Task task = findById(id);
        repository.delete(task);
    }

    private void apply(Task task, TaskRequest request) {
        task.setTitle(request.getTitle().trim());
        task.setDescription(request.getDescription() == null ? "" : request.getDescription().trim());
        task.setDueDate(request.getDueDate());
        task.setPriority(request.getPriority() == null ? TaskPriority.MEDIUM : request.getPriority());
        task.setStatus(request.getStatus() == null ? TaskStatus.PENDING : request.getStatus());
    }
}
