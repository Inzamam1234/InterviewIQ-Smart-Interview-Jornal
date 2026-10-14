package com.injamam.interviewjournal.controller;

import com.injamam.interviewjournal.dto.CreateJournalEntryRequest;
import com.injamam.interviewjournal.entity.JournalEntry;
import com.injamam.interviewjournal.service.JournalEntryService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/interviews/{interviewId}/journal-entries")
@SecurityRequirement(name = "bearerAuth")
public class JournalEntryController {

    private final JournalEntryService journalEntryService;

    public JournalEntryController(
            JournalEntryService journalEntryService) {

        this.journalEntryService = journalEntryService;
    }

    @PostMapping
    public JournalEntry createJournalEntry(
            @PathVariable Long interviewId,
            @Valid @RequestBody CreateJournalEntryRequest request){

        return journalEntryService.createJournalEntry(interviewId, request);
    }

    @GetMapping
    public List<JournalEntry> getJournalEntriesByInterviewId(
            @PathVariable Long interviewId) {

        return journalEntryService
                .getJournalEntriesByInterviewId(interviewId);
    }
}