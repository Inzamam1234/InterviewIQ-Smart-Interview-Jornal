package com.injamam.interviewjournal.service;

import com.injamam.interviewjournal.dto.DashboardResponse;
import com.injamam.interviewjournal.entity.Interview;
import com.injamam.interviewjournal.enums.Role;
import com.injamam.interviewjournal.exception.InterviewAccessDeniedException;
import com.injamam.interviewjournal.exception.InterviewNotFoundException;
import com.injamam.interviewjournal.repository.InterviewRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.injamam.interviewjournal.dto.CreateInterviewRequest;
import com.injamam.interviewjournal.entity.User;
import com.injamam.interviewjournal.enums.InterviewStatus;
import com.injamam.interviewjournal.repository.UserRepository;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import org.springframework.data.domain.Sort;

import java.util.List;

@Service
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final UserRepository userRepository;

    public InterviewService(
            InterviewRepository interviewRepository,
            UserRepository userRepository) {

        this.interviewRepository = interviewRepository;
        this.userRepository = userRepository;
    }

    public List<Interview> getAllInterviews() {

        return interviewRepository.findAll();
    }
    public Interview createInterview(CreateInterviewRequest request) {

        User currentUser = getCurrentUser();

        Interview interview = new Interview();

        interview.setCompanyName(request.getCompanyName());
        interview.setRole(request.getRole());
        interview.setApplicationDate(request.getApplicationDate());
        interview.setCurrentRound(request.getCurrentRound());
        interview.setNextRoundDate(request.getNextRoundDate());
        interview.setOverallFeedback(request.getOverallFeedback());
        interview.setStatus(
                request.getStatus() == null
                        ? InterviewStatus.APPLIED
                        : request.getStatus()
        );
        interview.setUser(currentUser);

        return interviewRepository.save(interview);
    }

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public Interview getInterviewById(Long id) {

        return getAuthorizedInterview(id);
    }

    public Interview updateInterview(Long id, Interview updatedInterview) {

        Interview existingInterview = getAuthorizedInterview(id);

        if (updatedInterview.getCompanyName() != null) {
            existingInterview.setCompanyName(updatedInterview.getCompanyName());
        }
        if (updatedInterview.getRole() != null) {
            existingInterview.setRole(updatedInterview.getRole());
        }
        existingInterview.setApplicationDate(updatedInterview.getApplicationDate());
        existingInterview.setCurrentRound(updatedInterview.getCurrentRound());
        existingInterview.setNextRoundDate(updatedInterview.getNextRoundDate());
        existingInterview.setOverallFeedback(updatedInterview.getOverallFeedback());
        if (updatedInterview.getStatus() != null) {
            existingInterview.setStatus(updatedInterview.getStatus());
        }

        return interviewRepository.save(existingInterview);
    }

    public void deleteInterview(Long id) {

        Interview existingInterview = getAuthorizedInterview(id);

        interviewRepository.delete(existingInterview);
    }

    public List<Interview> getInterviewsByUserId(Long userId) {

        User currentUser = getCurrentUser();

        if (!currentUser.getId().equals(userId)
                && currentUser.getRole() != Role.ADMIN) {
            throw new InterviewAccessDeniedException();
        }

        return interviewRepository.findByUserId(userId);
    }

    public List<Interview> getUpcomingInterviews() {

        User currentUser = getCurrentUser();
        List<InterviewStatus> excludedStatuses = List.of(
                InterviewStatus.REJECTED,
                InterviewStatus.SELECTED
        );

        if (currentUser.getRole() == Role.ADMIN) {
            return interviewRepository
                    .findByNextRoundDateIsNotNullAndStatusNotInOrderByNextRoundDateAsc(
                            excludedStatuses);
        }

        return interviewRepository
                .findByUserIdAndNextRoundDateIsNotNullAndStatusNotInOrderByNextRoundDateAsc(
                        currentUser.getId(),
                        excludedStatuses);
    }

    public List<Interview> getInterviewsByStatus(InterviewStatus status) {

        User currentUser = getCurrentUser();

        // ADMIN can see all interviews by status
        if (currentUser.getRole().name().equals("ADMIN")) {
            return interviewRepository.findByStatus(status);
        }

        // USER can see only their own interviews by status
        return interviewRepository.findByUserIdAndStatus(
                currentUser.getId(),
                status
        );
    }

    private Interview getAuthorizedInterview(Long interviewId) {

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new InterviewNotFoundException(interviewId));

        User currentUser = getCurrentUser();

        if (currentUser.getRole() != Role.ADMIN
                && !interview.getUser().getId().equals(currentUser.getId())) {
            throw new InterviewAccessDeniedException();
        }

        return interview;
    }

    public DashboardResponse getDashboardStats() {

        DashboardResponse response = new DashboardResponse();

        User currentUser = getCurrentUser();

        if (currentUser.getRole().name().equals("ADMIN")) {

            response.setTotalInterviews(interviewRepository.count());

            response.setAppliedCount(
                    interviewRepository
                            .findByStatus(InterviewStatus.APPLIED)
                            .size());

            response.setSelectedCount(
                    interviewRepository
                            .findByStatus(InterviewStatus.SELECTED)
                            .size());

            response.setRejectedCount(
                    interviewRepository
                            .findByStatus(InterviewStatus.REJECTED)
                            .size());

            response.setInProgressCount(
                    interviewRepository
                            .findByStatus(InterviewStatus.IN_PROGRESS)
                            .size());

        } else {

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
        }

        return response;
    }

    public Page<Interview> getAllInterviews(int page, int size) {

        Sort sort = Sort.by("companyName");
        Pageable pageable = PageRequest.of(page, size, sort);

        User currentUser = getCurrentUser();

        if (currentUser.getRole().name().equals("ADMIN")) {
            return interviewRepository.findAll(pageable);
        }

        return interviewRepository.findByUserId(
                currentUser.getId(),
                pageable
        );
    }
    public List<Interview> searchInterviews(
            InterviewStatus status,
            String keyword) {

        User currentUser = getCurrentUser();

        // ADMIN can search all interviews
        if (currentUser.getRole().name().equals("ADMIN")) {
            return interviewRepository.searchInterviews(status, keyword);
        }

        // USER can search only their own interviews
        return interviewRepository.searchInterviewsByUser(
                currentUser.getId(),
                status,
                keyword
        );
    }
}
