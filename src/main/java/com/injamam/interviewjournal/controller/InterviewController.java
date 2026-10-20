package com.injamam.interviewjournal.controller;

import com.injamam.interviewjournal.dto.CreateInterviewRequest;
import com.injamam.interviewjournal.entity.Interview;
import com.injamam.interviewjournal.enums.InterviewStatus;
import com.injamam.interviewjournal.service.InterviewService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;


@RestController
@RequestMapping("/interviews")
@SecurityRequirement(name = "bearerAuth")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @PostMapping
    public ResponseEntity<Interview> createInterview(
            @Valid @RequestBody CreateInterviewRequest request) {

        Interview interview = interviewService.createInterview(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(interview);
    }

    @GetMapping("/upcoming")
    public List<Interview> getUpcomingInterviews() {

        return interviewService.getUpcomingInterviews();
    }

    @GetMapping("/all")
    public List<Interview> getAllInterviews() {
        return interviewService.getAllInterviews();
    }

    @GetMapping("/{id}")
    public Interview getInterviewById(@PathVariable Long id) {
        return interviewService.getInterviewById(id);
    }

    @PutMapping("/{id}")
    public Interview updateInterview(
            @PathVariable Long id,
            @RequestBody Interview updatedInterview) {

        return interviewService.updateInterview(id, updatedInterview);
    }

    @DeleteMapping("/{id}")
    public String deleteInterview(@PathVariable Long id) {

        interviewService.deleteInterview(id);

        return "Interview deleted successfully";
    }

    @GetMapping("/user/{userId}")
    public List<Interview> getInterviewsByUserId(
            @PathVariable Long userId) {

        return interviewService.getInterviewsByUserId(userId);
    }
    @GetMapping("/status/{status}")
    public List<Interview> getInterviewsByStatus(
            @PathVariable InterviewStatus status) {

        return interviewService.getInterviewsByStatus(status);
    }

    @GetMapping
    public Page<Interview> getAllInterviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        return interviewService.getAllInterviews(page, size);
    }

    @GetMapping("/search")
    public List<Interview> searchInterviews(
            @RequestParam InterviewStatus status,
            @RequestParam String keyword) {

        return interviewService.searchInterviews(status, keyword);
    }
}
