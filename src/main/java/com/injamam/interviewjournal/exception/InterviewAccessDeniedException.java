package com.injamam.interviewjournal.exception;

public class InterviewAccessDeniedException extends RuntimeException {

    public InterviewAccessDeniedException() {
        super("You are not authorized to access this interview");
    }
}
