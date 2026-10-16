package com.injamam.interviewjournal.dto;

import com.injamam.interviewjournal.enums.InterviewStatus;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public class CreateInterviewRequest {

    @NotBlank(message = "Company name cannot be empty")
    private String companyName;

    @NotBlank(message = "Role cannot be empty")
    private String role;

    private LocalDate applicationDate;

    private String currentRound;

    private LocalDate nextRoundDate;

    private String overallFeedback;

    private InterviewStatus status;

    public CreateInterviewRequest() {
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public LocalDate getApplicationDate() {
        return applicationDate;
    }

    public void setApplicationDate(LocalDate applicationDate) {
        this.applicationDate = applicationDate;
    }

    public String getCurrentRound() {
        return currentRound;
    }

    public void setCurrentRound(String currentRound) {
        this.currentRound = currentRound;
    }

    public LocalDate getNextRoundDate() {
        return nextRoundDate;
    }

    public void setNextRoundDate(LocalDate nextRoundDate) {
        this.nextRoundDate = nextRoundDate;
    }

    public String getOverallFeedback() {
        return overallFeedback;
    }

    public void setOverallFeedback(String overallFeedback) {
        this.overallFeedback = overallFeedback;
    }

    public InterviewStatus getStatus() {
        return status;
    }

    public void setStatus(InterviewStatus status) {
        this.status = status;
    }
}
