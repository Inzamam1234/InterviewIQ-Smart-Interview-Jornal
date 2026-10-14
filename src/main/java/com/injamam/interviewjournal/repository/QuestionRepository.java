package com.injamam.interviewjournal.repository;

import com.injamam.interviewjournal.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository
        extends JpaRepository<Question, Long> {

    List<Question> findByInterviewId(Long interviewId);

    long countByInterview_User_Id(Long userId);
}