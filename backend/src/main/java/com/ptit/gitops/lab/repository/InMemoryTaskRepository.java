package com.ptit.gitops.lab.repository;

import com.ptit.gitops.lab.model.Task;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Repository
public class InMemoryTaskRepository {

    private final Map<Long, Task> store = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(1);

    public List<Task> findAll() {
        return store.values().stream()
                .sorted(Comparator.comparing(Task::getId).reversed())
                .collect(Collectors.toList());
    }

    public Optional<Task> findById(Long id) {
        return Optional.ofNullable(store.get(id));
    }

    public Task save(Task task) {
        if (task.getId() == null) {
            task.setId(idGenerator.getAndIncrement());
            task.setCreatedAt(Instant.now());
        }
        task.setUpdatedAt(Instant.now());
        store.put(task.getId(), task);
        return task;
    }

    public boolean deleteById(Long id) {
        return store.remove(id) != null;
    }

    public long countByStatus(Task.Status status) {
        return store.values().stream()
                .filter(t -> t.getStatus() == status)
                .count();
    }

    public long count() {
        return store.size();
    }

    public void seedIfEmpty(List<Task> seedTasks) {
        if (store.isEmpty()) {
            seedTasks.forEach(this::save);
        }
    }
}
