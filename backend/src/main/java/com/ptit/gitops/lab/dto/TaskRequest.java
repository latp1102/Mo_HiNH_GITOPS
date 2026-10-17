package com.ptit.gitops.lab.dto;

import com.ptit.gitops.lab.model.Task;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class TaskRequest {

    @NotBlank(message = "title không được để trống")
    @Size(max = 200, message = "title tối đa 200 ký tự")
    private String title;

    @Size(max = 2000, message = "description tối đa 2000 ký tự")
    private String description = "";

    private Task.Status status = Task.Status.PENDING;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Task.Status getStatus() {
        return status;
    }

    public void setStatus(Task.Status status) {
        this.status = status;
    }
}
