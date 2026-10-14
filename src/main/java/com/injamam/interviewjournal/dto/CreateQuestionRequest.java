package com.injamam.interviewjournal.dto;

import com.injamam.interviewjournal.enums.QuestionDifficulty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateQuestionRequest {

    @NotBlank(message = "Question text cannot be empty")
    private String questionText;

    @NotNull(message = "Difficulty must be selected")
    private QuestionDifficulty difficulty;

    private String answer;

    private String notes;

    public CreateQuestionRequest() {
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public QuestionDifficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(QuestionDifficulty difficulty) {
        this.difficulty = difficulty;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}