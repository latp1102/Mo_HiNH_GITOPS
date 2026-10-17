package com.ptit.gitops.lab.controller;

import com.ptit.gitops.lab.dto.TaskRequest;
import com.ptit.gitops.lab.model.Task;
import com.ptit.gitops.lab.service.TaskService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TaskController.class)
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TaskService taskService;

    private Task sampleTask() {
        return new Task(1L, "Task mẫu", "Mô tả", Task.Status.PENDING, Instant.now(), Instant.now());
    }

    @Test
    void list_shouldReturnTasks() throws Exception {
        when(taskService.getAll(null)).thenReturn(List.of(sampleTask()));

        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].title").value("Task mẫu"))
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }

    @Test
    void create_shouldReturn201() throws Exception {
        when(taskService.create(any(TaskRequest.class))).thenReturn(sampleTask());

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Task mới\",\"description\":\"desc\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Task mẫu"));
    }

    @Test
    void create_shouldReturn400_whenTitleBlank() throws Exception {
        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"\",\"description\":\"desc\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").isNotEmpty());
    }

    @Test
    void get_shouldReturn404_whenNotFound() throws Exception {
        when(taskService.getById(99L)).thenThrow(
                new com.ptit.gitops.lab.exception.NotFoundException("Không tìm thấy task với id=99"));

        mockMvc.perform(get("/api/tasks/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Không tìm thấy task với id=99"));
    }

    @Test
    void update_shouldReturnUpdatedTask() throws Exception {
        Task updated = sampleTask();
        updated.setTitle("Đã cập nhật");
        when(taskService.update(eq(1L), any(TaskRequest.class))).thenReturn(updated);

        mockMvc.perform(put("/api/tasks/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Đã cập nhật\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Đã cập nhật"));
    }

    @Test
    void delete_shouldReturn204() throws Exception {
        mockMvc.perform(delete("/api/tasks/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void stats_shouldReturnCounts() throws Exception {
        when(taskService.getStats()).thenReturn(new com.ptit.gitops.lab.dto.StatsResponse(3, 1, 1, 1));

        mockMvc.perform(get("/api/tasks/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(3))
                .andExpect(jsonPath("$.completed").value(1));
    }
}
