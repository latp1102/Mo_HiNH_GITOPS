package com.ptit.gitops.lab.service;

import com.ptit.gitops.lab.dto.StatsResponse;
import com.ptit.gitops.lab.dto.TaskRequest;
import com.ptit.gitops.lab.exception.NotFoundException;
import com.ptit.gitops.lab.model.Task;
import com.ptit.gitops.lab.repository.InMemoryTaskRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    private final InMemoryTaskRepository repository;

    public TaskService(InMemoryTaskRepository repository) {
        this.repository = repository;
    }

    @PostConstruct
    void seed() {
        repository.seedIfEmpty(List.of(
                new Task(null, "Thiết kế kiến trúc GitOps", "Hoàn thiện sơ đồ CI/CD với Argo CD", Task.Status.COMPLETED, null, null),
                new Task(null, "Xây dựng Pipeline CI/CD", "Tích hợp GitHub Actions, GHCR và Argo CD", Task.Status.IN_PROGRESS, null, null)
        ));
    }

    public List<Task> getAll(Task.Status status) {
        List<Task> tasks = repository.findAll();
        if (status != null) {
            return tasks.stream().filter(t -> t.getStatus() == status).toList();
        }
        return tasks;
    }

    public Task getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy task với id=" + id));
    }

    public Task create(TaskRequest request) {
        Task task = new Task(
                null,
                request.getTitle().trim(),
                request.getDescription() == null ? "" : request.getDescription().trim(),
                request.getStatus() == null ? Task.Status.PENDING : request.getStatus(),
                null,
                null
        );
        return repository.save(task);
    }

    public Task update(Long id, TaskRequest request) {
        Task task = getById(id);
        task.setTitle(request.getTitle().trim());
        task.setDescription(request.getDescription() == null ? "" : request.getDescription().trim());
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }
        return repository.save(task);
    }

    public Task updateStatus(Long id, Task.Status status) {
        Task task = getById(id);
        task.setStatus(status);
        return repository.save(task);
    }

    public void delete(Long id) {
        if (!repository.deleteById(id)) {
            throw new NotFoundException("Không tìm thấy task với id=" + id);
        }
    }

    public StatsResponse getStats() {
        return new StatsResponse(
                repository.count(),
                repository.countByStatus(Task.Status.PENDING),
                repository.countByStatus(Task.Status.IN_PROGRESS),
                repository.countByStatus(Task.Status.COMPLETED)
        );
    }
}
