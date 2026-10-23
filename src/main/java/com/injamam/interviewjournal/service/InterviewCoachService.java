package com.injamam.interviewjournal.service;

import com.injamam.interviewjournal.dto.InterviewPreparationResponse;
import com.injamam.interviewjournal.dto.SaveInterviewPreparationRequest;
import com.injamam.interviewjournal.entity.Interview;
import com.injamam.interviewjournal.entity.InterviewPreparation;
import com.injamam.interviewjournal.entity.User;
import com.injamam.interviewjournal.enums.Role;
import com.injamam.interviewjournal.exception.InterviewAccessDeniedException;
import com.injamam.interviewjournal.exception.InterviewNotFoundException;
import com.injamam.interviewjournal.repository.InterviewPreparationRepository;
import com.injamam.interviewjournal.repository.InterviewRepository;
import com.injamam.interviewjournal.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

@Service
public class InterviewCoachService {

    private static final List<SkillDefinition> SKILL_CATALOG = List.of(
            new SkillDefinition("Java", "Technical", List.of("java")),
            new SkillDefinition("Spring Boot", "Technical", List.of("spring boot", "springboot")),
            new SkillDefinition("Python", "Technical", List.of("python")),
            new SkillDefinition("JavaScript", "Technical", List.of("javascript")),
            new SkillDefinition("TypeScript", "Technical", List.of("typescript")),
            new SkillDefinition("React", "Technical", List.of("react", "react.js", "reactjs")),
            new SkillDefinition("Node.js", "Technical", List.of("node.js", "nodejs")),
            new SkillDefinition("REST APIs", "Technical", List.of("rest api", "rest apis", "restful api")),
            new SkillDefinition("SQL", "Data", List.of("sql")),
            new SkillDefinition("PostgreSQL", "Data", List.of("postgresql", "postgres")),
            new SkillDefinition("MongoDB", "Data", List.of("mongodb", "mongo db")),
            new SkillDefinition("Data Structures", "Technical", List.of("data structures", "data structure")),
            new SkillDefinition("Algorithms", "Technical", List.of("algorithms", "algorithm")),
            new SkillDefinition("System Design", "Architecture", List.of("system design", "distributed systems")),
            new SkillDefinition("AWS", "Cloud", List.of("aws", "amazon web services")),
            new SkillDefinition("Azure", "Cloud", List.of("azure")),
            new SkillDefinition("GCP", "Cloud", List.of("gcp", "google cloud")),
            new SkillDefinition("Docker", "Cloud", List.of("docker", "containerization")),
            new SkillDefinition("Kubernetes", "Cloud", List.of("kubernetes", "k8s")),
            new SkillDefinition("Leadership", "Behavioral", List.of("leadership", "lead")),
            new SkillDefinition("Communication", "Behavioral", List.of("communication", "communicate")),
            new SkillDefinition("Problem Solving", "Behavioral", List.of("problem solving", "problem-solving")),
            new SkillDefinition("Teamwork", "Behavioral", List.of("teamwork", "collaboration", "collaborative"))
    );

    private final InterviewPreparationRepository preparationRepository;
    private final InterviewRepository interviewRepository;
    private final UserRepository userRepository;

    public InterviewCoachService(
            InterviewPreparationRepository preparationRepository,
            InterviewRepository interviewRepository,
            UserRepository userRepository) {

        this.preparationRepository = preparationRepository;
        this.interviewRepository = interviewRepository;
        this.userRepository = userRepository;
    }

    public InterviewPreparationResponse getPreparation(Long interviewId) {

        Interview interview = getAuthorizedInterview(interviewId);

        return preparationRepository.findByInterviewId(interview.getId())
                .map(this::toResponse)
                .orElseGet(this::emptyResponse);
    }

    public InterviewPreparationResponse savePreparation(
            Long interviewId,
            SaveInterviewPreparationRequest request) {

        Interview interview = getAuthorizedInterview(interviewId);
        String jobDescription = request.getJobDescription().trim();
        List<String> extractedSkills = extractSkills(jobDescription);

        InterviewPreparation preparation = preparationRepository
                .findByInterviewId(interview.getId())
                .orElseGet(InterviewPreparation::new);

        preparation.setInterview(interview);
        preparation.setJobDescription(jobDescription);
        preparation.setExtractedSkills(String.join(",", extractedSkills));
        preparation.setAnalyzedAt(LocalDateTime.now());

        return toResponse(preparationRepository.save(preparation));
    }

    private InterviewPreparationResponse toResponse(InterviewPreparation preparation) {

        List<String> skills = parseSkills(preparation.getExtractedSkills());
        InterviewPreparationResponse response = new InterviewPreparationResponse();

        response.setId(preparation.getId());
        response.setJobDescription(preparation.getJobDescription());
        response.setAnalyzedAt(preparation.getAnalyzedAt());
        response.setExtractedSkills(skills);
        response.setFocusAreas(buildFocusAreas(skills));
        response.setSuggestedQuestions(buildSuggestedQuestions(skills));

        return response;
    }

    private InterviewPreparationResponse emptyResponse() {

        InterviewPreparationResponse response = new InterviewPreparationResponse();

        response.setExtractedSkills(List.of());
        response.setFocusAreas(List.of());
        response.setSuggestedQuestions(List.of());

        return response;
    }

    private List<String> extractSkills(String jobDescription) {

        List<String> skills = new ArrayList<>();

        for (SkillDefinition skill : SKILL_CATALOG) {
            boolean matched = skill.aliases().stream()
                    .anyMatch(alias -> Pattern.compile(
                            "(?i)\\b" + Pattern.quote(alias) + "\\b")
                            .matcher(jobDescription)
                            .find());

            if (matched) {
                skills.add(skill.label());
            }
        }

        return skills;
    }

    private List<String> parseSkills(String storedSkills) {

        if (storedSkills == null || storedSkills.isBlank()) {
            return List.of();
        }

        return Arrays.stream(storedSkills.split(","))
                .map(String::trim)
                .filter(skill -> !skill.isBlank())
                .toList();
    }

    private List<String> buildFocusAreas(List<String> skills) {

        Set<String> focusAreas = new LinkedHashSet<>();
        Set<String> categories = skills.stream()
                .map(this::categoryForSkill)
                .collect(java.util.stream.Collectors.toSet());

        if (categories.contains("Technical")) {
            focusAreas.add("Prepare a concise explanation of your hands-on technical work and trade-offs.");
        }
        if (categories.contains("Data")) {
            focusAreas.add("Review data modeling, query performance, and how you validate data quality.");
        }
        if (categories.contains("Architecture")) {
            focusAreas.add("Practice explaining scalable designs, failure handling, and system trade-offs.");
        }
        if (categories.contains("Cloud")) {
            focusAreas.add("Be ready to explain deployment, observability, security, and cost decisions.");
        }
        if (categories.contains("Behavioral")) {
            focusAreas.add("Prepare STAR stories that show ownership, collaboration, and measurable impact.");
        }

        focusAreas.add("Prepare two thoughtful questions about the team, role, and success in the first 90 days.");

        return new ArrayList<>(focusAreas);
    }

    private List<String> buildSuggestedQuestions(List<String> skills) {

        List<String> questions = new ArrayList<>();

        for (String skill : skills.stream().limit(3).toList()) {
            questions.add("How have you used " + skill + " in a real project, and what trade-off did you make?");
        }

        questions.add("Tell me about a difficult problem you solved and how you measured the result.");
        questions.add("How would you approach your first 30 days in this role?");

        return questions;
    }

    private String categoryForSkill(String skill) {

        return SKILL_CATALOG.stream()
                .filter(definition -> definition.label().equals(skill))
                .map(SkillDefinition::category)
                .findFirst()
                .orElse("Technical");
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

    private User getCurrentUser() {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private record SkillDefinition(
            String label,
            String category,
            List<String> aliases) {
    }
}
