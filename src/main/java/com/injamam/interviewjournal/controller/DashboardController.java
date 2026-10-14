package com.injamam.interviewjournal.controller;

import com.injamam.interviewjournal.dto.DashboardResponse;
import com.injamam.interviewjournal.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/dashboard")
@SecurityRequirement(name = "bearerAuth")

public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public DashboardResponse getDashboardStats() {
        return dashboardService.getDashboardStats();
    }
}