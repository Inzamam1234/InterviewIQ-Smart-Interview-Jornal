package com.injamam.interviewjournal.service;

import com.injamam.interviewjournal.dto.CreateQuestionRequest;
import com.injamam.interviewjournal.entity.Interview;
import com.injamam.interviewjournal.entity.Question;
import com.injamam.interviewjournal.entity.User;
import com.injamam.interviewjournal.repository.InterviewRepository;
import com.injamam.interviewjournal.repository.QuestionRepository;
import com.injamam.interviewjournal.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final InterviewRepository interviewRepository;
    private final UserRepository userRepository;

    public QuestionService(
            QuestionRepository questionRepository,
            InterviewRepository interviewRepository,
            UserRepository userRepository) {

        this.questionRepository = questionRepository;
        this.interviewRepository = interviewRepository;
        this.userRepository = userRepository;
    }

    public Question createQuestion(
            Long interviewId,
            CreateQuestionRequest request) {

        Interview interview = getAuthorizedInterview(interviewId);

        Question question = new Question();

        question.setQuestionText(request.getQuestionText());
        question.setDifficulty(request.getDifficulty());
        question.setAnswer(request.getAnswer());
        question.setNotes(request.getNotes());

        question.setInterview(interview);

        return questionRepository.save(question);
    }

    public List<Question> getQuestionsByInterviewId(Long interviewId) {

        Interview interview = getAuthorizedInterview(interviewId);

        return questionRepository.findByInterviewId(interview.getId());
    }

    private Interview getAuthorizedInterview(Long interviewId) {

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() ->
                        new RuntimeException("Interview not found"));

        User currentUser = getCurrentUser();

        // ADMIN can access any interview
        if (currentUser.getRole().name().equals("ADMIN")) {
            return interview;
        }

        // USER can access only their own interview
        if (!interview.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access Denied");
        }

        return interview;
    }

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
    }
}