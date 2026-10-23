package com.injamam.interviewjournal.controller;

import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class HealthControllerTest {

    private final HealthController controller = new HealthController();

    @Test
    void returnsMinimalLivenessPayload() {
        Map<String, Object> response = controller.health();

        assertEquals("UP", response.get("status"));
        assertEquals("interviewiq-api", response.get("service"));
        assertNotNull(response.get("timestamp"));
    }
}
