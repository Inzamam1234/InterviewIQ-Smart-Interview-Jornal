package com.injamam.interviewjournal.repository;

import com.injamam.interviewjournal.entity.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JournalEntryRepository
        extends JpaRepository<JournalEntry, Long> {

    List<JournalEntry> findByInterviewId(Long interviewId);

    List<JournalEntry> findByInterview_User_Id(Long userId);
}