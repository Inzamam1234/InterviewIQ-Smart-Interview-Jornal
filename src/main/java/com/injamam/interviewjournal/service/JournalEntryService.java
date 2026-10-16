package com.injamam.interviewjournal.service;

import com.injamam.interviewjournal.dto.CreateJournalEntryRequest;
import com.injamam.interviewjournal.entity.Interview;
import com.injamam.interviewjournal.entity.JournalEntry;
import com.injamam.interviewjournal.repository.InterviewRepository;
import com.injamam.interviewjournal.repository.JournalEntryRepository;
import com.injamam.interviewjournal.enums.Role;
import com.injamam.interviewjournal.exception.InterviewAccessDeniedException;
import com.injamam.interviewjournal.exception.InterviewNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JournalEntryService {

    private final JournalEntryRepository journalEntryRepository;
    private final InterviewRepository interviewRepository;

    public JournalEntryService(
            JournalEntryRepository journalEntryRepository,
            InterviewRepository interviewRepository) {

        this.journalEntryRepository = journalEntryRepository;
        this.interviewRepository = interviewRepository;
    }

    public JournalEntry createJournalEntry(
            Long interviewId,
            CreateJournalEntryRequest request) {

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new InterviewNotFoundException(interviewId));

        checkInterviewOwnership(interview);

        JournalEntry journalEntry = new JournalEntry();

        journalEntry.setExperience(request.getExperience());
        journalEntry.setMistakes(request.getMistakes());
        journalEntry.setLearnings(request.getLearnings());
        journalEntry.setConfidenceLevel(request.getConfidenceLevel());

        journalEntry.setInterview(interview);

        return journalEntryRepository.save(journalEntry);
    }

    public List<JournalEntry> getJournalEntriesByInterviewId(
            Long interviewId) {

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new InterviewNotFoundException(interviewId));

        checkInterviewOwnership(interview);

        return journalEntryRepository.findByInterviewId(interviewId);
    }

    private void checkInterviewOwnership(Interview interview) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String interviewOwnerEmail =
                interview.getUser().getEmail();

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_" + Role.ADMIN));

        if (!isAdmin && !authentication.getName().equals(interviewOwnerEmail)) {
            throw new InterviewAccessDeniedException();
        }
    }
}
