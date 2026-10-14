package com.injamam.interviewjournal.dto;


public class DashboardResponse {

    private long totalInterviews;
    private long appliedCount;
    private long selectedCount;
    private long rejectedCount;
    private long inProgressCount;

    private long totalQuestions;
    private double averageConfidenceLevel;

    public DashboardResponse() {
    }

    public long getTotalInterviews() {
        return totalInterviews;
    }

    public void setTotalInterviews(long totalInterviews) {
        this.totalInterviews = totalInterviews;
    }

    public long getAppliedCount() {
        return appliedCount;
    }

    public void setAppliedCount(long appliedCount) {
        this.appliedCount = appliedCount;
    }

    public long getSelectedCount() {
        return selectedCount;
    }

    public void setSelectedCount(long selectedCount) {
        this.selectedCount = selectedCount;
    }

    public long getRejectedCount() {
        return rejectedCount;
    }

    public void setRejectedCount(long rejectedCount) {
        this.rejectedCount = rejectedCount;
    }

    public long getInProgressCount() {
        return inProgressCount;
    }

    public void setInProgressCount(long inProgressCount) {
        this.inProgressCount = inProgressCount;
    }

    public void setTotalQuestions(long totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public long getTotalQuestions() {
        return totalQuestions;
    }
    public double getAverageConfidenceLevel() {
        return averageConfidenceLevel;
    }

    public void setAverageConfidenceLevel(double averageConfidenceLevel) {
        this.averageConfidenceLevel = averageConfidenceLevel;
    }
}