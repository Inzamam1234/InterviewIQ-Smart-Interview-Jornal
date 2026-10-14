package com.injamam.interviewjournal.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateInterviewRequest {

    @NotBlank(message = "Company name cannot be empty")
    private String companyName;

    @NotBlank(message = "Role cannot be empty")
    private String role;

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
}