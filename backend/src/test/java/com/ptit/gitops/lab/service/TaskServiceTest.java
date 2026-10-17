package com.ptit.gitops.lab.service;

import com.ptit.gitops.lab.dto.TaskRequest;
import com.ptit.gitops.lab.exception.NotFoundException;
import com.ptit.gitops.lab.model.Task;
import com.ptit.gitops.lab.repository.InMemoryTaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TaskServiceTest {

    private InMemoryTaskRepository repository;
    private TaskService taskService;

    @BeforeEach
    void setUp() {
        repository = new InMemoryTaskRepository();
        taskService = new TaskService(repository);
        taskService.seed();
    }

    @Test
    void seed_shouldLoadSampleTasksOnce() {
        assertEquals(2, repository.count());
        taskService.seed();
        assertEquals(2, repository.count());
    }

    @Test
    void create_shouldAssignIdAndTimestamps() {
        TaskRequest request = new TaskRequest();
        request.setTitle("  Task test  ");
        request.setDescription("desc");

        Task created = taskService.create(request);

        assertNotNull(created.getId());
        assertEquals("Task test", created.getTitle());
        assertNotNull(created.getCreatedAt());
        assertNotNull(created.getUpdatedAt());
    }

    @Test
    void getById_shouldThrowWhenMissing() {
        assertThrows(NotFoundException.class, () -> taskService.getById(999L));
    }

    @Test
    void update_shouldChangeTitleAndStatus() {
        TaskRequest request = new TaskRequest();
        request.setTitle("Cập nhật");
        request.setStatus(Task.Status.COMPLETED);

        Task first = taskService.getAll(null).get(0);
        Task updated = taskService.update(first.getId(), request);

        assertEquals("Cập nhật", updated.getTitle());
        assertEquals(Task.Status.COMPLETED, updated.getStatus());
    }

    @Test
    void delete_shouldRemoveTask() {
        Task first = taskService.getAll(null).get(0);
        taskService.delete(first.getId());
        assertTrue(taskService.getAll(null).stream().noneMatch(t -> t.getId().equals(first.getId())));
    }

    @Test
    void getStats_shouldMatchCounts() {
        var stats = taskService.getStats();
        assertEquals(2, stats.getTotal());
        assertEquals(0, stats.getPending());
        assertEquals(1, stats.getInProgress());
        assertEquals(1, stats.getCompleted());
    }
}
