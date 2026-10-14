package com.injamam.interviewjournal.service;

import com.injamam.interviewjournal.dto.CreateJournalEntryRequest;
import com.injamam.interviewjournal.entity.Interview;
import com.injamam.interviewjournal.entity.JournalEntry;
import com.injamam.interviewjournal.repository.InterviewRepository;
import com.injamam.interviewjournal.repository.JournalEntryRepository;
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
                .orElseThrow(() -> new RuntimeException("Interview not found"));

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
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        checkInterviewOwnership(interview);

        return journalEntryRepository.findByInterviewId(interviewId);
    }

    private void checkInterviewOwnership(Interview interview) {

        String loggedInUsername =
                SecurityContextHolder.getContext()
                        .getAuthentication()
                        .getName();

        String interviewOwnerEmail =
                interview.getUser().getEmail();

        if (!loggedInUsername.equals(interviewOwnerEmail)) {
            throw new RuntimeException("Access denied");
        }
    }
}