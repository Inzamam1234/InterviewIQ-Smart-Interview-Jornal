package com.injamam.interviewjournal.repository;

import com.injamam.interviewjournal.entity.InterviewPreparation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InterviewPreparationRepository
        extends JpaRepository<InterviewPreparation, Long> {

    Optional<InterviewPreparation> findByInterviewId(Long interviewId);
}
