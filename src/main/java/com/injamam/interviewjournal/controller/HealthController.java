package com.injamam.interviewjournal.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/**
 * Lightweight liveness endpoint for Render and external uptime monitors.
 * It intentionally does not expose database or environment details.
 */
@RestController
public class HealthController {

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
                "status", "UP",
                "service", "interviewiq-api",
                "timestamp", Instant.now()
        );
    }
}
