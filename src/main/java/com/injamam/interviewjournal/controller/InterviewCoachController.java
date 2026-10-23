package com.injamam.interviewjournal.controller;

import com.injamam.interviewjournal.dto.InterviewPreparationResponse;
import com.injamam.interviewjournal.dto.SaveInterviewPreparationRequest;
import com.injamam.interviewjournal.service.InterviewCoachService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/interviews/{interviewId}/coach")
@SecurityRequirement(name = "bearerAuth")
public class InterviewCoachController {

    private final InterviewCoachService interviewCoachService;

    public InterviewCoachController(InterviewCoachService interviewCoachService) {
        this.interviewCoachService = interviewCoachService;
    }

    @GetMapping("/profile")
    public InterviewPreparationResponse getPreparation(
            @PathVariable Long interviewId) {

        return interviewCoachService.getPreparation(interviewId);
    }

    @PutMapping("/profile")
    public InterviewPreparationResponse savePreparation(
            @PathVariable Long interviewId,
            @Valid @RequestBody SaveInterviewPreparationRequest request) {

        return interviewCoachService.savePreparation(interviewId, request);
    }
}
