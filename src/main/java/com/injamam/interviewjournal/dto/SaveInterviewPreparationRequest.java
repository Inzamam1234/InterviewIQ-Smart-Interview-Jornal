package com.injamam.interviewjournal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SaveInterviewPreparationRequest {

    @NotBlank(message = "Job description cannot be empty")
    @Size(max = 20000, message = "Job description cannot exceed 20,000 characters")
    private String jobDescription;

    public String getJobDescription() {
        return jobDescription;
    }

    public void setJobDescription(String jobDescription) {
        this.jobDescription = jobDescription;
    }
}
