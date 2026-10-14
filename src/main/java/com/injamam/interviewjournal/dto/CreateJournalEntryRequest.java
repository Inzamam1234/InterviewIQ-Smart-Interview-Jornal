package com.injamam.interviewjournal.dto;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class CreateJournalEntryRequest {

    @NotBlank(message = "Experience cannot be empty")
    private String experience;

    @NotBlank(message = "Mistakes cannot be empty")
    private String mistakes;

    @NotBlank(message = "Learnings cannot be empty")
    private String learnings;

    @Min(value = 1, message = "Confidence level must be at least 1")
    @Max(value = 10, message = "Confidence level cannot exceed 10")
    private int confidenceLevel;

    public CreateJournalEntryRequest() {
    }

    public String getExperience() {
        return experience;
    }

    public void setExperience(String experience) {
        this.experience = experience;
    }

    public String getMistakes() {
        return mistakes;
    }

    public void setMistakes(String mistakes) {
        this.mistakes = mistakes;
    }

    public String getLearnings() {
        return learnings;
    }

    public void setLearnings(String learnings) {
        this.learnings = learnings;
    }

    public int getConfidenceLevel() {
        return confidenceLevel;
    }

    public void setConfidenceLevel(int confidenceLevel) {
        this.confidenceLevel = confidenceLevel;
    }
}