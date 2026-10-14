package com.injamam.interviewjournal.controller;

import com.injamam.interviewjournal.dto.CreateQuestionRequest;
import com.injamam.interviewjournal.entity.Question;
import com.injamam.interviewjournal.service.QuestionService;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.util.List;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/interviews/{interviewId}/questions")
@SecurityRequirement(name = "bearerAuth")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @PostMapping
    public Question createQuestion(
            @PathVariable Long interviewId,
            @Valid @RequestBody CreateQuestionRequest request) {

        return questionService.createQuestion(interviewId, request);
    }

    @GetMapping
    public List<Question> getQuestionsByInterviewId(
            @PathVariable Long interviewId) {

        return questionService.getQuestionsByInterviewId(interviewId);
    }
}