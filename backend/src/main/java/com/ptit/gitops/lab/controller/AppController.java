package com.ptit.gitops.lab.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class AppController {

    @Value("${app.version:1.0.0}")
    private String appVersion;

    @Value("${app.message:Hello from GitOps Task Manager}")
    private String appMessage;

    @GetMapping("/api/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", "UP");
        body.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(body);
    }

    @GetMapping("/api/version")
    public ResponseEntity<Map<String, Object>> version() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("version", resolveVersion());
        body.put("message", appMessage);
        body.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(body);
    }

    private String resolveVersion() {
        String envVersion = System.getenv("APP_VERSION");
        return (envVersion != null && !envVersion.isBlank()) ? envVersion : appVersion;
    }
}
