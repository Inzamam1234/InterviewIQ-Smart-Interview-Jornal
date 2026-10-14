package com.injamam.interviewjournal.service;

import com.injamam.interviewjournal.dto.DashboardResponse;
import com.injamam.interviewjournal.entity.JournalEntry;
import com.injamam.interviewjournal.entity.User;
import com.injamam.interviewjournal.enums.InterviewStatus;
import com.injamam.interviewjournal.repository.InterviewRepository;
import com.injamam.interviewjournal.repository.JournalEntryRepository;
import com.injamam.interviewjournal.repository.QuestionRepository;
import com.injamam.interviewjournal.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final InterviewRepository interviewRepository;
    private final QuestionRepository questionRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final UserRepository userRepository;

    public DashboardService(
            InterviewRepository interviewRepository,
            QuestionRepository questionRepository,
            JournalEntryRepository journalEntryRepository,
            UserRepository userRepository) {

        this.interviewRepository = interviewRepository;
        this.questionRepository = questionRepository;
        this.journalEntryRepository = journalEntryRepository;
        this.userRepository = userRepository;
    }

    public DashboardResponse getDashboardStats() {

        User currentUser = getCurrentUser();

        DashboardResponse response = new DashboardResponse();

        /*
         * ADMIN
         * -----
         * Admin sees statistics from the entire application.
         */
        if (currentUser.getRole().name().equals("ADMIN")) {

            response.setTotalInterviews(
                    interviewRepository.count());

            response.setAppliedCount(
                    interviewRepository.countByStatus(
                            InterviewStatus.APPLIED));

            response.setSelectedCount(
                    interviewRepository.countByStatus(
                            InterviewStatus.SELECTED));

            response.setRejectedCount(
                    interviewRepository.countByStatus(
                            InterviewStatus.REJECTED));

            response.setInProgressCount(
                    interviewRepository.countByStatus(
                            InterviewStatus.IN_PROGRESS));

            response.setTotalQuestions(
                    questionRepository.count());

            double averageConfidence =
                    journalEntryRepository.findAll()
                            .stream()
                            .mapToInt(JournalEntry::getConfidenceLevel)
                            .average()
                            .orElse(0);

            response.setAverageConfidenceLevel(
                    averageConfidence);

        }

        /*
         * USER
         * ----
         * User sees statistics only for their own data.
         */
        else {

            Long userId = currentUser.getId();

            response.setTotalInterviews(
                    interviewRepository.countByUserId(userId));

            response.setAppliedCount(
                    interviewRepository.countByUserIdAndStatus(
                            userId,
                            InterviewStatus.APPLIED));

            response.setSelectedCount(
                    interviewRepository.countByUserIdAndStatus(
                            userId,
                            InterviewStatus.SELECTED));

            response.setRejectedCount(
                    interviewRepository.countByUserIdAndStatus(
                            userId,
                            InterviewStatus.REJECTED));

            response.setInProgressCount(
                    interviewRepository.countByUserIdAndStatus(
                            userId,
                            InterviewStatus.IN_PROGRESS));

            response.setTotalQuestions(
                    questionRepository.countByInterview_User_Id(userId));

            double averageConfidence =
                    journalEntryRepository
                            .findByInterview_User_Id(userId)
                            .stream()
                            .mapToInt(JournalEntry::getConfidenceLevel)
                            .average()
                            .orElse(0);

            response.setAverageConfidenceLevel(
                    averageConfidence);
        }

        return response;
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