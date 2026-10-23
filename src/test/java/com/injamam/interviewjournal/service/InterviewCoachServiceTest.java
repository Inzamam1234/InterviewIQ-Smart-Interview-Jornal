package com.injamam.interviewjournal.service;

import com.injamam.interviewjournal.dto.InterviewPreparationResponse;
import com.injamam.interviewjournal.dto.SaveInterviewPreparationRequest;
import com.injamam.interviewjournal.entity.Interview;
import com.injamam.interviewjournal.entity.User;
import com.injamam.interviewjournal.repository.InterviewPreparationRepository;
import com.injamam.interviewjournal.repository.InterviewRepository;
import com.injamam.interviewjournal.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class InterviewCoachServiceTest {

    private final InterviewPreparationRepository preparationRepository =
            mock(InterviewPreparationRepository.class);
    private final InterviewRepository interviewRepository =
            mock(InterviewRepository.class);
    private final UserRepository userRepository = mock(UserRepository.class);

    private InterviewCoachService service;

    @BeforeEach
    void setUp() {
        service = new InterviewCoachService(
                preparationRepository,
                interviewRepository,
                userRepository);

        User user = new User();
        ReflectionTestUtils.setField(user, "id", 1L);
        user.setEmail("user@example.com");

        Interview interview = new Interview();
        ReflectionTestUtils.setField(interview, "id", 20L);
        interview.setUser(user);

        when(interviewRepository.findById(20L)).thenReturn(Optional.of(interview));
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(preparationRepository.findByInterviewId(20L)).thenReturn(Optional.empty());
        when(preparationRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "user@example.com",
                        "ignored"));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void extractsSkillsAndBuildsPreparationGuidance() {
        SaveInterviewPreparationRequest request = new SaveInterviewPreparationRequest();
        request.setJobDescription(
                "Build Java Spring Boot REST APIs with PostgreSQL and Docker. "
                        + "Collaborate with the team and solve complex problems.");

        InterviewPreparationResponse response = service.savePreparation(20L, request);

        assertEquals(5, response.getExtractedSkills().size());
        assertTrue(response.getExtractedSkills().contains("Java"));
        assertTrue(response.getExtractedSkills().contains("Spring Boot"));
        assertTrue(response.getExtractedSkills().contains("PostgreSQL"));
        assertTrue(response.getExtractedSkills().contains("Docker"));
        assertTrue(response.getFocusAreas().stream()
                .anyMatch(area -> area.contains("hands-on technical work")));
        assertEquals(5, response.getSuggestedQuestions().size());
    }
}
