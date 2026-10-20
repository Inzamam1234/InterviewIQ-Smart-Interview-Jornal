package com.injamam.interviewjournal.repository;

import com.injamam.interviewjournal.entity.Interview;
import com.injamam.interviewjournal.enums.InterviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;



public interface InterviewRepository extends JpaRepository<Interview, Long> {

    List<Interview> findByUserId(Long userId);
    List<Interview> findByStatus(InterviewStatus status);
    List<Interview> findByNextRoundDateIsNotNullAndStatusNotInOrderByNextRoundDateAsc(
            List<InterviewStatus> excludedStatuses);
    List<Interview> findByUserIdAndNextRoundDateIsNotNullAndStatusNotInOrderByNextRoundDateAsc(
            Long userId,
            List<InterviewStatus> excludedStatuses);
    long countByStatus(InterviewStatus status);
    List<Interview> findByUserIdAndStatus(Long userId, InterviewStatus status);
    Page<Interview> findByUserId(Long userId, Pageable pageable);
    long countByUserId(Long userId);
    long countByUserIdAndStatus(Long userId, InterviewStatus status);

    @Query("""
    SELECT i FROM Interview i
    WHERE i.user.id = :userId
    AND i.status = :status
    AND (
        LOWER(i.companyName) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR LOWER(i.role) LIKE LOWER(CONCAT('%', :keyword, '%'))
    )
""")
    List<Interview> searchInterviewsByUser(
            @Param("userId") Long userId,
            @Param("status") InterviewStatus status,
            @Param("keyword") String keyword
    );

    @Query("""
SELECT i
FROM Interview i
WHERE i.status = :status
AND i.companyName LIKE %:keyword%
""")

    List<Interview> searchInterviews(
            @Param("status") InterviewStatus status,
            @Param("keyword") String keyword);
}
