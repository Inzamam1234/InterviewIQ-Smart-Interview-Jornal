import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../api/axios";
import { getApiErrorMessage } from "../api/errorMessage";
import InterviewProgressStepper from "../components/InterviewProgressStepper";
import JobDescriptionAnalyzer from "../components/JobDescriptionAnalyzer";
import PreparationHub from "../components/PreparationHub";

function InterviewDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [interview, setInterview] = useState(null);

    /* -------------------------------- */
    /* Questions State                  */
    /* -------------------------------- */

    const [questions, setQuestions] = useState([]);
    const [questionsLoading, setQuestionsLoading] = useState(true);
    const [questionsError, setQuestionsError] = useState("");

    /* -------------------------------- */
    /* Journal State                    */
    /* -------------------------------- */

    const [journalEntries, setJournalEntries] = useState([]);
    const [journalLoading, setJournalLoading] = useState(true);
    const [journalError, setJournalError] = useState("");

    /* -------------------------------- */
    /* Interview State                  */
    /* -------------------------------- */

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [nextRoundDate, setNextRoundDate] = useState("");
    const [savingNextRoundDate, setSavingNextRoundDate] = useState(false);

    const [preparationProfile, setPreparationProfile] = useState(null);
    const [jobDescription, setJobDescription] = useState("");
    const [preparationLoading, setPreparationLoading] = useState(true);
    const [preparationError, setPreparationError] = useState("");
    const [savingPreparation, setSavingPreparation] = useState(false);

    /* -------------------------------- */
    /* Question Modal                   */
    /* -------------------------------- */

    const [showQuestionModal, setShowQuestionModal] = useState(false);

    const [questionForm, setQuestionForm] = useState({
        questionText: "",
        difficulty: "MEDIUM",
        answer: "",
        notes: ""
    });

    const [submittingQuestion, setSubmittingQuestion] = useState(false);

    const [visibleAnswers, setVisibleAnswers] = useState({});
    const [visibleNotes, setVisibleNotes] = useState({});

    /* -------------------------------- */
    /* Journal Modal                    */
    /* -------------------------------- */

    const [showJournalModal, setShowJournalModal] = useState(false);

    const [journalForm, setJournalForm] = useState({
        experience: "",
        mistakes: "",
        learnings: "",
        confidenceLevel: ""
    });

    const [submittingJournal, setSubmittingJournal] = useState(false);


    /* -------------------------------- */
    /* Fetch Interview                  */
    /* -------------------------------- */

    useEffect(() => {

        const fetchInterview = async () => {

            try {

                const response = await api.get(`/interviews/${id}`);

                setInterview(response.data);
                setNextRoundDate(toDateInputValue(response.data.nextRoundDate));

            } catch (error) {

                if (error.response?.status === 403) {

                    setError(
                        "You do not have permission to view this interview."
                    );

                } else if (error.response?.status === 404) {

                    setError("Interview not found.");

                } else {

                    setError(
                        "Failed to load interview details."
                    );

                }

            } finally {

                setLoading(false);

            }

        };

        fetchInterview();

    }, [id]);


    /* -------------------------------- */
    /* Fetch role preparation           */
    /* -------------------------------- */

    useEffect(() => {

        const fetchPreparation = async () => {

            setPreparationLoading(true);
            setPreparationError("");

            try {

                const response = await api.get(
                    `/interviews/${id}/coach/profile`
                );

                setPreparationProfile(response.data);
                setJobDescription(response.data.jobDescription || "");

            } catch (error) {

                setPreparationError(
                    getApiErrorMessage(
                        error,
                        "Unable to load the role analysis."
                    )
                );

            } finally {

                setPreparationLoading(false);

            }

        };

        fetchPreparation();

    }, [id]);


    /* -------------------------------- */
    /* Quick interview updates          */
    /* -------------------------------- */

    const handleInterviewUpdated = (updatedInterview) => {

        setInterview(updatedInterview);
        setNextRoundDate(toDateInputValue(updatedInterview.nextRoundDate));

    };


    const handleSaveNextRoundDate = async () => {

        const applicationDate = toDateInputValue(interview.applicationDate);

        if (
            nextRoundDate &&
            applicationDate &&
            nextRoundDate < applicationDate
        ) {
            toast.error("The next round date cannot be before the application date.");
            return;
        }

        setSavingNextRoundDate(true);

        try {

            const response = await api.put(`/interviews/${id}`, {
                companyName: interview.companyName,
                role: interview.role,
                applicationDate: interview.applicationDate || "",
                currentRound: interview.currentRound || "",
                nextRoundDate: nextRoundDate || "",
                overallFeedback: interview.overallFeedback || "",
                status: interview.status
            });

            handleInterviewUpdated(response.data);
            toast.success("Next round date saved.");

        } catch (error) {

            toast.error(
                getApiErrorMessage(error, "Unable to save the next round date.")
            );

        } finally {

            setSavingNextRoundDate(false);

        }

    };


    const handleAnalyzeRole = async (event) => {

        event.preventDefault();

        if (!jobDescription.trim()) {
            toast.error("Paste a job description to analyze this role.");
            return;
        }

        setSavingPreparation(true);
        setPreparationError("");

        try {

            const response = await api.put(
                `/interviews/${id}/coach/profile`,
                { jobDescription }
            );

            setPreparationProfile(response.data);
            setJobDescription(response.data.jobDescription || jobDescription.trim());
            toast.success("Role analysis updated.");

        } catch (error) {

            setPreparationError(
                getApiErrorMessage(
                    error,
                    "Unable to analyze this role. Please try again."
                )
            );
            toast.error("Unable to analyze this role.");

        } finally {

            setSavingPreparation(false);

        }

    };


    const handleCopyFollowUpEmail = async () => {

        const round = interview.currentRound || "interview";
        const message = [
            `Subject: Thank you for the ${round} at ${interview.companyName}`,
            "",
            "Hi [Recruiter or interviewer name],",
            "",
            `Thank you for taking the time to speak with me about the ${interview.role} position. I enjoyed learning more about the role and the team.`,
            "",
            "Please let me know if you need any additional information from me. I look forward to hearing about the next steps.",
            "",
            "Best,",
            "[Your name]"
        ].join("\n");

        try {

            if (!navigator.clipboard) {
                throw new Error("Clipboard unavailable");
            }

            await navigator.clipboard.writeText(message);
            toast.success("Follow-up email copied to your clipboard.");

        } catch {

            toast.error("Unable to copy the follow-up email. Please try again.");

        }

    };


    /* -------------------------------- */
    /* Fetch Questions                  */
    /* -------------------------------- */

    useEffect(() => {

        const fetchQuestions = async () => {

            setQuestionsLoading(true);
            setQuestionsError("");

            try {

                const response = await api.get(
                    `/interviews/${id}/questions`
                );

                setQuestions(response.data);

            } catch (error) {

                if (error.response?.status === 403) {

                    setQuestionsError(
                        "You do not have permission to view these questions."
                    );

                } else {

                    setQuestionsError(
                        "Failed to load interview questions."
                    );

                }

            } finally {

                setQuestionsLoading(false);

            }

        };

        fetchQuestions();

    }, [id]);


    /* -------------------------------- */
    /* Fetch Journal                    */
    /* -------------------------------- */

    useEffect(() => {

        const fetchJournalEntries = async () => {

            setJournalLoading(true);
            setJournalError("");

            try {

                const response = await api.get(
                    `/interviews/${id}/journal-entries`
                );

                setJournalEntries(response.data);

            } catch (error) {

                if (error.response?.status === 403) {

                    setJournalError(
                        "You do not have permission to view this journal."
                    );

                } else {

                    setJournalError(
                        "Failed to load journal entries."
                    );

                }

            } finally {

                setJournalLoading(false);

            }

        };

        fetchJournalEntries();

    }, [id]);


    /* -------------------------------- */
    /* Delete Interview                 */
    /* -------------------------------- */

    const handleDelete = async () => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this interview?"
        );

        if (!confirmed) {
            return;
        }

        try {

            await api.delete(`/interviews/${id}`);

            navigate("/interviews");

        } catch (error) {

            if (error.response?.status === 403) {

                toast.error(
                    "You do not have permission to delete this interview."
                );

            } else if (error.response?.status === 404) {

                toast.error("Interview not found.");

            } else {

                toast.error(getApiErrorMessage(error, "Failed to delete interview."));

            }

        }

    };


    /* -------------------------------- */
    /* Question Form Change             */
    /* -------------------------------- */

    const handleQuestionChange = (event) => {

        const { name, value } = event.target;

        setQuestionForm((previous) => ({
            ...previous,
            [name]: value
        }));

    };


    /* -------------------------------- */
    /* Add Question                     */
    /* -------------------------------- */

    const handleAddQuestion = async (event) => {

        event.preventDefault();

        if (!questionForm.questionText.trim()) {

            toast.error("Please enter the question.");

            return;
        }

        setSubmittingQuestion(true);

        try {

            const response = await api.post(
                `/interviews/${id}/questions`,
                {
                    questionText:
                    questionForm.questionText,

                    difficulty:
                    questionForm.difficulty,

                    answer:
                    questionForm.answer,

                    notes:
                    questionForm.notes
                }
            );

            setQuestions((previous) => [
                ...previous,
                response.data
            ]);

            setQuestionForm({
                questionText: "",
                difficulty: "MEDIUM",
                answer: "",
                notes: ""
            });

            setShowQuestionModal(false);

            toast.success("Question added successfully.");

        } catch (error) {

            if (error.response?.status === 403) {

                toast.error(
                    "You do not have permission to add questions to this interview."
                );

            } else if (error.response?.status === 400) {

                toast.error(
                    "Invalid question data. Please check the form."
                );

            } else {

                toast.error(getApiErrorMessage(error, "Failed to create question."));

            }

        } finally {

            setSubmittingQuestion(false);

        }

    };


    /* -------------------------------- */
    /* Toggle Answer                    */
    /* -------------------------------- */

    const toggleAnswer = (questionId) => {

        setVisibleAnswers((previous) => ({
            ...previous,
            [questionId]: !previous[questionId]
        }));

    };


    /* -------------------------------- */
    /* Toggle Notes                     */
    /* -------------------------------- */

    const toggleNotes = (questionId) => {

        setVisibleNotes((previous) => ({
            ...previous,
            [questionId]: !previous[questionId]
        }));

    };


    /* -------------------------------- */
    /* Journal Form Change              */
    /* -------------------------------- */

    const handleJournalChange = (event) => {

        const { name, value } = event.target;

        setJournalForm((previous) => ({
            ...previous,
            [name]: value
        }));

    };


    /* -------------------------------- */
    /* Add Journal Entry                */
    /* -------------------------------- */

    const handleAddJournal = async (event) => {

        event.preventDefault();

        if (!journalForm.experience.trim()) {

            toast.error(
                "Please describe your interview experience."
            );

            return;
        }

        setSubmittingJournal(true);

        try {

            const response = await api.post(
                `/interviews/${id}/journal-entries`,
                {
                    experience:
                    journalForm.experience,

                    mistakes:
                    journalForm.mistakes,

                    learnings:
                    journalForm.learnings,

                    confidenceLevel:
                        journalForm.confidenceLevel === ""
                            ? null
                            : Number(
                                journalForm.confidenceLevel
                            )
                }
            );

            setJournalEntries((previous) => [
                ...previous,
                response.data
            ]);

            setJournalForm({
                experience: "",
                mistakes: "",
                learnings: "",
                confidenceLevel: ""
            });

            setShowJournalModal(false);

            toast.success(
                "Journal entry added successfully."
            );

        } catch (error) {

            if (error.response?.status === 403) {

                toast.error(
                    "You do not have permission to add a journal entry."
                );

            } else if (error.response?.status === 400) {

                toast.error(
                    "Invalid journal data. Please check the form."
                );

            } else {

                toast.error(getApiErrorMessage(error, "Failed to create journal entry."));

            }

        } finally {

            setSubmittingJournal(false);

        }

    };


    /* -------------------------------- */
    /* Loading                          */
    /* -------------------------------- */

    if (loading) {

        return (
            <div style={styles.center}>

                <p>Loading interview...</p>

            </div>
        );

    }


    /* -------------------------------- */
    /* Error                            */
    /* -------------------------------- */

    if (error) {

        return (
            <div style={styles.center}>

                <div style={styles.errorCard}>

                    <h2>
                        Unable to load interview
                    </h2>

                    <p>{error}</p>

                    <button
                        style={styles.backButton}
                        onClick={() =>
                            navigate("/interviews")
                        }
                    >
                        ← Back to Interviews
                    </button>

                </div>

            </div>
        );

    }


    if (!interview) {
        return null;
    }


    /* -------------------------------- */
    /* Main UI                          */
    /* -------------------------------- */

    return (

        <div style={styles.page}>

            {/* Back */}

            <button
                style={styles.backLink}
                onClick={() =>
                    navigate("/interviews")
                }
            >
                ← Back to Interviews
            </button>


            {/* Header */}

            <div style={styles.header}>

                <div>

                    <h1 style={styles.company}>
                        {interview.companyName}
                    </h1>

                    <p style={styles.role}>
                        {interview.role}
                    </p>

                </div>


                <span
                    style={{
                        ...styles.status,
                        ...getStatusStyle(
                            interview.status
                        )
                    }}
                >
                    {formatStatus(
                        interview.status
                    )}
                </span>

            </div>


            {/* Quick progress update */}

            <div style={styles.card}>

                <div style={styles.sectionHeader}>

                    <div>

                        <h2 style={styles.cardTitle}>
                            Current progress
                        </h2>

                        <p style={styles.sectionDescription}>
                            Click a stage to update the current round instantly.
                            Use Edit Interview for dates, notes, and other details.
                        </p>

                    </div>

                </div>

                <InterviewProgressStepper
                    interview={interview}
                    onUpdated={handleInterviewUpdated}
                />

            </div>


            {/* Quick next-round date update */}

            <div style={styles.card}>

                <div style={styles.sectionHeader}>

                    <div>

                        <h2 style={styles.cardTitle}>
                            Next round date
                        </h2>

                        <p style={styles.sectionDescription}>
                            Set or change the next interview date without opening the full editor.
                        </p>

                    </div>

                </div>

                <div style={styles.quickEditRow}>

                    <label
                        htmlFor="next-round-date"
                        style={styles.quickEditLabel}
                    >
                        Next interview date
                    </label>

                    <input
                        id="next-round-date"
                        type="date"
                        value={nextRoundDate}
                        onChange={(event) =>
                            setNextRoundDate(event.target.value)
                        }
                        style={styles.quickDateInput}
                        disabled={savingNextRoundDate}
                    />

                    <button
                        type="button"
                        style={styles.quickSaveButton}
                        onClick={handleSaveNextRoundDate}
                        disabled={
                            savingNextRoundDate ||
                            nextRoundDate === toDateInputValue(interview.nextRoundDate)
                        }
                    >
                        {savingNextRoundDate ? "Saving..." : "Save date"}
                    </button>

                </div>

                <p style={styles.quickEditHint}>
                    Leave the date blank and save to remove it.
                </p>

            </div>


            {/* Role analyzer */}

            <JobDescriptionAnalyzer
                profile={preparationProfile}
                role={interview.role}
                loading={preparationLoading}
                saving={savingPreparation}
                error={preparationError}
                jobDescription={jobDescription}
                onJobDescriptionChange={setJobDescription}
                onAnalyze={handleAnalyzeRole}
            />


            {/* Preparation Hub */}

            <PreparationHub
                interview={interview}
                questions={questions}
                journalEntries={journalEntries}
                coachProfile={preparationProfile}
                onAddQuestion={() => setShowQuestionModal(true)}
                onAddJournal={() => setShowJournalModal(true)}
            />


            {/* Follow-up email */}

            <div style={styles.card}>

                <div style={styles.sectionHeader}>

                    <div>

                        <h2 style={styles.cardTitle}>
                            Follow up after this interview
                        </h2>

                        <p style={styles.sectionDescription}>
                            Copy a ready-to-edit thank-you email with this interview’s details.
                        </p>

                    </div>

                    <button
                        type="button"
                        style={styles.primaryButton}
                        onClick={handleCopyFollowUpEmail}
                    >
                        Copy email template
                    </button>

                </div>

            </div>


            {/* Interview Details */}

            <div style={styles.card}>

                <h2 style={styles.cardTitle}>
                    Interview Details
                </h2>

                <div style={styles.grid}>

                    <DetailItem
                        label="Company"
                        value={interview.companyName}
                    />

                    <DetailItem
                        label="Role"
                        value={interview.role}
                    />

                    <DetailItem
                        label="Application Date"
                        value={formatDate(
                            interview.applicationDate
                        )}
                    />

                    <DetailItem
                        label="Current Round"
                        value={
                            interview.currentRound ||
                            "Not specified"
                        }
                    />

                    <DetailItem
                        label="Next Round"
                        value={formatDate(
                            interview.nextRoundDate
                        )}
                    />

                    <DetailItem
                        label="Status"
                        value={formatStatus(
                            interview.status
                        )}
                    />

                </div>

            </div>


            {/* Overall Feedback */}

            <div style={styles.card}>

                <h2 style={styles.cardTitle}>
                    Overall Feedback
                </h2>

                <p style={styles.feedback}>

                    {interview.overallFeedback ||
                        "No feedback added yet."}

                </p>

            </div>


            {/* ================================= */}
            {/* Interview Questions                */}
            {/* ================================= */}

            <div style={styles.card} id="interview-questions">

                <div style={styles.sectionHeader}>

                    <div>

                        <h2 style={styles.cardTitle}>
                            Interview Questions
                        </h2>

                        <p style={styles.sectionDescription}>
                            Questions asked during this interview.
                        </p>

                    </div>


                    <button
                        style={styles.primaryButton}
                        onClick={() =>
                            setShowQuestionModal(true)
                        }
                    >
                        + Add Question
                    </button>

                </div>


                {/* Questions Loading */}

                {questionsLoading && (

                    <div style={styles.questionState}>

                        <p>
                            Loading questions...
                        </p>

                    </div>

                )}


                {/* Questions Error */}

                {!questionsLoading &&
                    questionsError && (

                        <div style={styles.questionError}>

                            <p>
                                {questionsError}
                            </p>

                        </div>

                    )}


                {/* No Questions */}

                {!questionsLoading &&
                    !questionsError &&
                    questions.length === 0 && (

                        <div style={styles.emptyQuestions}>

                            <div style={styles.emptyIcon}>
                                ?
                            </div>

                            <h3 style={styles.emptyTitle}>
                                No questions yet
                            </h3>

                            <p style={styles.emptyDescription}>
                                Add the questions you were asked
                                during this interview.
                            </p>

                            <button
                                style={
                                    styles.secondaryPrimaryButton
                                }
                                onClick={() =>
                                    setShowQuestionModal(true)
                                }
                            >
                                + Add First Question
                            </button>

                        </div>

                    )}


                {/* Questions List */}

                {!questionsLoading &&
                    !questionsError &&
                    questions.length > 0 && (

                        <div style={styles.questionsList}>

                            {questions.map(
                                (question, index) => (

                                    <div
                                        key={question.id}
                                        style={
                                            styles.questionCard
                                        }
                                    >

                                        {/* Question Header */}

                                        <div
                                            style={
                                                styles.questionHeader
                                            }
                                        >

                                            <div
                                                style={
                                                    styles.questionNumber
                                                }
                                            >
                                                Q{index + 1}
                                            </div>


                                            <span
                                                style={{
                                                    ...styles.difficultyBadge,
                                                    ...getDifficultyStyle(
                                                        question.difficulty
                                                    )
                                                }}
                                            >
                                                {question.difficulty}
                                            </span>

                                        </div>


                                        {/* Question */}

                                        <h3
                                            style={
                                                styles.questionText
                                            }
                                        >
                                            {
                                                question.questionText
                                            }
                                        </h3>


                                        {/* Answer */}

                                        {question.answer && (

                                            <div
                                                style={
                                                    styles.answerSection
                                                }
                                            >

                                                <button
                                                    style={
                                                        styles.toggleButton
                                                    }
                                                    onClick={() =>
                                                        toggleAnswer(
                                                            question.id
                                                        )
                                                    }
                                                >

                                                    {
                                                        visibleAnswers[
                                                            question.id
                                                            ]
                                                            ? "Hide Answer"
                                                            : "Show Answer"
                                                    }

                                                </button>


                                                {visibleAnswers[
                                                    question.id
                                                    ] && (

                                                    <div
                                                        style={
                                                            styles.answerBox
                                                        }
                                                    >

                                                        <div
                                                            style={
                                                                styles.contentLabel
                                                            }
                                                        >
                                                            Answer
                                                        </div>

                                                        <p
                                                            style={
                                                                styles.contentText
                                                            }
                                                        >
                                                            {
                                                                question.answer
                                                            }
                                                        </p>

                                                    </div>

                                                )}

                                            </div>

                                        )}


                                        {/* Notes */}

                                        {question.notes && (

                                            <div
                                                style={
                                                    styles.notesSection
                                                }
                                            >

                                                <button
                                                    style={
                                                        styles.toggleButton
                                                    }
                                                    onClick={() =>
                                                        toggleNotes(
                                                            question.id
                                                        )
                                                    }
                                                >

                                                    {
                                                        visibleNotes[
                                                            question.id
                                                            ]
                                                            ? "Hide Notes"
                                                            : "Show Notes"
                                                    }

                                                </button>


                                                {visibleNotes[
                                                    question.id
                                                    ] && (

                                                    <div
                                                        style={
                                                            styles.notesBox
                                                        }
                                                    >

                                                        <div
                                                            style={
                                                                styles.contentLabel
                                                            }
                                                        >
                                                            Notes
                                                        </div>

                                                        <p
                                                            style={
                                                                styles.contentText
                                                            }
                                                        >
                                                            {
                                                                question.notes
                                                            }
                                                        </p>

                                                    </div>

                                                )}

                                            </div>

                                        )}

                                    </div>

                                )
                            )}

                        </div>

                    )}

            </div>


            {/* ================================= */}
            {/* Interview Journal                 */}
            {/* ================================= */}

            <div style={styles.card} id="interview-journal">

                <div style={styles.sectionHeader}>

                    <div>

                        <h2 style={styles.cardTitle}>
                            Interview Journal
                        </h2>

                        <p style={styles.sectionDescription}>
                            Reflect on your interview experience,
                            mistakes and learnings.
                        </p>

                    </div>


                    <button
                        style={styles.primaryButton}
                        onClick={() =>
                            setShowJournalModal(true)
                        }
                    >
                        + Add Journal
                    </button>

                </div>


                {/* Journal Loading */}

                {journalLoading && (

                    <div style={styles.questionState}>

                        <p>
                            Loading journal...
                        </p>

                    </div>

                )}


                {/* Journal Error */}

                {!journalLoading &&
                    journalError && (

                        <div style={styles.questionError}>

                            <p>
                                {journalError}
                            </p>

                        </div>

                    )}


                {/* No Journal Entries */}

                {!journalLoading &&
                    !journalError &&
                    journalEntries.length === 0 && (

                        <div style={styles.emptyQuestions}>

                            <div style={styles.emptyIcon}>
                                ✎
                            </div>

                            <h3 style={styles.emptyTitle}>
                                No journal entries yet
                            </h3>

                            <p style={styles.emptyDescription}>
                                Record your experience and what
                                you learned from this interview.
                            </p>

                            <button
                                style={
                                    styles.secondaryPrimaryButton
                                }
                                onClick={() =>
                                    setShowJournalModal(true)
                                }
                            >
                                + Add First Journal Entry
                            </button>

                        </div>

                    )}


                {/* Journal Entries */}

                {!journalLoading &&
                    !journalError &&
                    journalEntries.length > 0 && (

                        <div style={styles.journalList}>

                            {journalEntries.map(
                                (entry, index) => (

                                    <div
                                        key={
                                            entry.id || index
                                        }
                                        style={
                                            styles.journalEntry
                                        }
                                    >

                                        {/* Journal Header */}

                                        <div
                                            style={
                                                styles.journalHeader
                                            }
                                        >

                                            <div>

                                                <span
                                                    style={
                                                        styles.journalNumber
                                                    }
                                                >
                                                    Entry {index + 1}
                                                </span>

                                                <span
                                                    style={
                                                        styles.journalDate
                                                    }
                                                >
                                                    Interview Reflection
                                                </span>

                                            </div>


                                            {entry.confidenceLevel !==
                                                null &&
                                                entry.confidenceLevel !==
                                                undefined &&
                                                entry.confidenceLevel !==
                                                "" && (

                                                    <div
                                                        style={
                                                            styles.confidenceBadge
                                                        }
                                                    >
                                                        Confidence{" "}
                                                        {
                                                            entry.confidenceLevel
                                                        }/10
                                                    </div>

                                                )}

                                        </div>


                                        {/* Experience */}

                                        <div
                                            style={
                                                styles.journalSection
                                            }
                                        >

                                            <h4
                                                style={
                                                    styles.journalLabel
                                                }
                                            >
                                                Experience
                                            </h4>

                                            <p
                                                style={
                                                    styles.journalText
                                                }
                                            >
                                                {
                                                    entry.experience ||
                                                    "No experience recorded."
                                                }
                                            </p>

                                        </div>


                                        {/* Mistakes */}

                                        <div
                                            style={
                                                styles.journalSection
                                            }
                                        >

                                            <h4
                                                style={
                                                    styles.journalLabel
                                                }
                                            >
                                                Mistakes
                                            </h4>

                                            <p
                                                style={
                                                    styles.journalText
                                                }
                                            >
                                                {
                                                    entry.mistakes ||
                                                    "No mistakes recorded."
                                                }
                                            </p>

                                        </div>


                                        {/* Learnings */}

                                        <div
                                            style={
                                                styles.journalSection
                                            }
                                        >

                                            <h4
                                                style={
                                                    styles.journalLabel
                                                }
                                            >
                                                Learnings
                                            </h4>

                                            <p
                                                style={
                                                    styles.journalText
                                                }
                                            >
                                                {
                                                    entry.learnings ||
                                                    "No learnings recorded."
                                                }
                                            </p>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

            </div>


            {/* ================================= */}
            {/* Bottom Actions                    */}
            {/* ================================= */}

            <div style={styles.actions}>

                <button
                    style={styles.secondaryButton}
                    onClick={() =>
                        navigate("/interviews")
                    }
                >
                    Back
                </button>


                <button
                    style={styles.deleteButton}
                    onClick={handleDelete}
                >
                    Delete Interview
                </button>


                <button
                    style={styles.primaryButton}
                    onClick={() =>
                        navigate(
                            `/interviews/${interview.id}/edit`
                        )
                    }
                >
                    Edit Interview
                </button>

            </div>


            {/* ================================= */}
            {/* Add Question Modal                */}
            {/* ================================= */}

            {showQuestionModal && (

                <div style={styles.modalOverlay}>

                    <div style={styles.modal}>

                        {/* Modal Header */}

                        <div style={styles.modalHeader}>

                            <div>

                                <h2 style={styles.modalTitle}>
                                    Add Interview Question
                                </h2>

                                <p
                                    style={
                                        styles.modalDescription
                                    }
                                >
                                    Add a question from this
                                    interview.
                                </p>

                            </div>


                            <button
                                style={styles.closeButton}
                                onClick={() =>
                                    setShowQuestionModal(false)
                                }
                            >
                                ×
                            </button>

                        </div>


                        {/* Question Form */}

                        <form
                            onSubmit={
                                handleAddQuestion
                            }
                        >

                            {/* Question */}

                            <div
                                style={
                                    styles.formGroup
                                }
                            >

                                <label
                                    style={
                                        styles.formLabel
                                    }
                                >
                                    Question
                                </label>

                                <textarea
                                    name="questionText"
                                    value={
                                        questionForm.questionText
                                    }
                                    onChange={
                                        handleQuestionChange
                                    }
                                    placeholder="Enter the interview question..."
                                    rows="4"
                                    style={
                                        styles.textarea
                                    }
                                    required
                                />

                            </div>


                            {/* Difficulty */}

                            <div
                                style={
                                    styles.formGroup
                                }
                            >

                                <label
                                    style={
                                        styles.formLabel
                                    }
                                >
                                    Difficulty
                                </label>

                                <select
                                    name="difficulty"
                                    value={
                                        questionForm.difficulty
                                    }
                                    onChange={
                                        handleQuestionChange
                                    }
                                    style={
                                        styles.input
                                    }
                                >

                                    <option value="EASY">
                                        Easy
                                    </option>

                                    <option value="MEDIUM">
                                        Medium
                                    </option>

                                    <option value="HARD">
                                        Hard
                                    </option>

                                </select>

                            </div>


                            {/* Answer */}

                            <div
                                style={
                                    styles.formGroup
                                }
                            >

                                <label
                                    style={
                                        styles.formLabel
                                    }
                                >
                                    Answer
                                </label>

                                <textarea
                                    name="answer"
                                    value={
                                        questionForm.answer
                                    }
                                    onChange={
                                        handleQuestionChange
                                    }
                                    placeholder="Enter your answer or solution..."
                                    rows="4"
                                    style={
                                        styles.textarea
                                    }
                                />

                            </div>


                            {/* Notes */}

                            <div
                                style={
                                    styles.formGroup
                                }
                            >

                                <label
                                    style={
                                        styles.formLabel
                                    }
                                >
                                    Notes
                                </label>

                                <textarea
                                    name="notes"
                                    value={
                                        questionForm.notes
                                    }
                                    onChange={
                                        handleQuestionChange
                                    }
                                    placeholder="Add notes, mistakes, or things to remember..."
                                    rows="3"
                                    style={
                                        styles.textarea
                                    }
                                />

                            </div>


                            {/* Modal Actions */}

                            <div
                                style={
                                    styles.modalActions
                                }
                            >

                                <button
                                    type="button"
                                    style={
                                        styles.secondaryButton
                                    }
                                    onClick={() =>
                                        setShowQuestionModal(
                                            false
                                        )
                                    }
                                    disabled={
                                        submittingQuestion
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    style={
                                        styles.primaryButton
                                    }
                                    disabled={
                                        submittingQuestion
                                    }
                                >

                                    {submittingQuestion
                                        ? "Adding..."
                                        : "Add Question"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* ================================= */}
            {/* Add Journal Modal                 */}
            {/* ================================= */}

            {showJournalModal && (

                <div style={styles.modalOverlay}>

                    <div style={styles.modal}>

                        {/* Modal Header */}

                        <div style={styles.modalHeader}>

                            <div>

                                <h2 style={styles.modalTitle}>
                                    Add Interview Journal
                                </h2>

                                <p
                                    style={
                                        styles.modalDescription
                                    }
                                >
                                    Reflect on your interview
                                    experience.
                                </p>

                            </div>


                            <button
                                style={styles.closeButton}
                                onClick={() =>
                                    setShowJournalModal(false)
                                }
                            >
                                ×
                            </button>

                        </div>


                        {/* Journal Form */}

                        <form
                            onSubmit={
                                handleAddJournal
                            }
                        >

                            {/* Experience */}

                            <div
                                style={
                                    styles.formGroup
                                }
                            >

                                <label
                                    style={
                                        styles.formLabel
                                    }
                                >
                                    Experience
                                </label>

                                <textarea
                                    name="experience"
                                    value={
                                        journalForm.experience
                                    }
                                    onChange={
                                        handleJournalChange
                                    }
                                    placeholder="How did the interview go? What happened?"
                                    rows="4"
                                    style={
                                        styles.textarea
                                    }
                                    required
                                />

                            </div>


                            {/* Mistakes */}

                            <div
                                style={
                                    styles.formGroup
                                }
                            >

                                <label
                                    style={
                                        styles.formLabel
                                    }
                                >
                                    Mistakes
                                </label>

                                <textarea
                                    name="mistakes"
                                    value={
                                        journalForm.mistakes
                                    }
                                    onChange={
                                        handleJournalChange
                                    }
                                    placeholder="What mistakes did you make?"
                                    rows="4"
                                    style={
                                        styles.textarea
                                    }
                                />

                            </div>


                            {/* Learnings */}

                            <div
                                style={
                                    styles.formGroup
                                }
                            >

                                <label
                                    style={
                                        styles.formLabel
                                    }
                                >
                                    Learnings
                                </label>

                                <textarea
                                    name="learnings"
                                    value={
                                        journalForm.learnings
                                    }
                                    onChange={
                                        handleJournalChange
                                    }
                                    placeholder="What did you learn from this interview?"
                                    rows="4"
                                    style={
                                        styles.textarea
                                    }
                                />

                            </div>


                            {/* Confidence */}

                            <div
                                style={
                                    styles.formGroup
                                }
                            >

                                <label
                                    style={
                                        styles.formLabel
                                    }
                                >
                                    Confidence Level (1–10)
                                </label>

                                <input
                                    type="number"
                                    name="confidenceLevel"
                                    value={
                                        journalForm.confidenceLevel
                                    }
                                    onChange={
                                        handleJournalChange
                                    }
                                    min="1"
                                    max="10"
                                    placeholder="Example: 8"
                                    style={
                                        styles.input
                                    }
                                />

                            </div>


                            {/* Modal Actions */}

                            <div
                                style={
                                    styles.modalActions
                                }
                            >

                                <button
                                    type="button"
                                    style={
                                        styles.secondaryButton
                                    }
                                    onClick={() =>
                                        setShowJournalModal(
                                            false
                                        )
                                    }
                                    disabled={
                                        submittingJournal
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    style={
                                        styles.primaryButton
                                    }
                                    disabled={
                                        submittingJournal
                                    }
                                >

                                    {submittingJournal
                                        ? "Saving..."
                                        : "Save Journal"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}


/* ================================= */
/* Detail Item                       */
/* ================================= */

function DetailItem({ label, value }) {

    return (

        <div style={styles.detailItem}>

            <span style={styles.label}>
                {label}
            </span>

            <span style={styles.value}>
                {value}
            </span>

        </div>

    );

}


/* ================================= */
/* Format Date                       */
/* ================================= */

function toDateInputValue(date) {

    return date ? String(date).slice(0, 10) : "";

}


function formatDate(date) {

    if (!date) {
        return "Not specified";
    }

    return new Date(date).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* ================================= */
/* Format Status                     */
/* ================================= */

function formatStatus(status) {

    if (!status) {
        return "Unknown";
    }

    return status
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(
            /\b\w/g,
            letter => letter.toUpperCase()
        );

}


/* ================================= */
/* Status Style                      */
/* ================================= */

function getStatusStyle(status) {

    switch (status) {

        case "SELECTED":

            return {
                background: "#ecfdf5",
                color: "#047857"
            };


        case "REJECTED":

            return {
                background: "#fef2f2",
                color: "#dc2626"
            };


        case "IN_PROGRESS":

            return {
                background: "#eff6ff",
                color: "#2563eb"
            };


        case "APPLIED":

            return {
                background: "#f5f3ff",
                color: "#7c3aed"
            };


        default:

            return {
                background: "#f3f4f6",
                color: "#374151"
            };

    }

}


/* ================================= */
/* Difficulty Style                  */
/* ================================= */

function getDifficultyStyle(difficulty) {

    switch (difficulty) {

        case "EASY":

            return {
                background: "#ecfdf5",
                color: "#047857"
            };


        case "HARD":

            return {
                background: "#fef2f2",
                color: "#dc2626"
            };


        case "MEDIUM":

            return {
                background: "#fff7ed",
                color: "#c2410c"
            };


        default:

            return {
                background: "#f3f4f6",
                color: "#374151"
            };

    }

}


/* ================================= */
/* Styles                            */
/* ================================= */

const styles = {

    /* -------------------------------- */
    /* Page                             */
    /* -------------------------------- */

    page: {
        minHeight: "100vh",
        padding: "40px 48px",
        background: "#f8f9fc",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#111827"
    },


    center: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f8f9fc",
        fontFamily: "Inter, system-ui, sans-serif"
    },


    errorCard: {
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "32px",
        textAlign: "center",
        maxWidth: "420px"
    },


    /* -------------------------------- */
    /* Header                           */
    /* -------------------------------- */

    backLink: {
        border: "none",
        background: "transparent",
        padding: 0,
        marginBottom: "28px",
        color: "#6b7280",
        fontSize: "14px",
        cursor: "pointer"
    },


    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "32px"
    },


    company: {
        margin: 0,
        fontSize: "32px",
        fontWeight: "700",
        letterSpacing: "-0.5px"
    },


    role: {
        marginTop: "8px",
        marginBottom: 0,
        color: "#6b7280",
        fontSize: "16px"
    },


    status: {
        padding: "8px 14px",
        borderRadius: "999px",
        fontSize: "13px",
        fontWeight: "600"
    },


    /* -------------------------------- */
    /* Cards                            */
    /* -------------------------------- */

    card: {
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "28px",
        marginBottom: "20px"
    },


    cardTitle: {
        margin: 0,
        fontSize: "18px",
        fontWeight: "600"
    },


    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "20px",
        marginBottom: "24px"
    },


    sectionDescription: {
        margin: "7px 0 0",
        color: "#6b7280",
        fontSize: "13px"
    },


    quickEditRow: {
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px"
    },


    quickEditLabel: {
        color: "#374151",
        fontSize: "13px",
        fontWeight: "600"
    },


    quickDateInput: {
        minWidth: "180px",
        padding: "10px 12px",
        border: "1px solid #d1d5db",
        borderRadius: "9px",
        background: "#ffffff",
        color: "#111827",
        fontSize: "14px",
        fontFamily: "inherit"
    },


    quickSaveButton: {
        padding: "10px 15px",
        borderRadius: "9px",
        border: "none",
        background: "#4f46e5",
        color: "#ffffff",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer"
    },


    quickEditHint: {
        margin: "10px 0 0",
        color: "#9ca3af",
        fontSize: "12px"
    },


    grid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
        gap: "24px"
    },


    detailItem: {
        display: "flex",
        flexDirection: "column",
        gap: "7px"
    },


    label: {
        color: "#9ca3af",
        fontSize: "13px",
        fontWeight: "500"
    },


    value: {
        color: "#111827",
        fontSize: "15px",
        fontWeight: "500"
    },


    feedback: {
        margin: 0,
        color: "#6b7280",
        lineHeight: "1.7",
        fontSize: "15px"
    },


    /* -------------------------------- */
    /* Questions                        */
    /* -------------------------------- */

    questionsList: {
        display: "flex",
        flexDirection: "column",
        gap: "16px"
    },


    questionCard: {
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "20px",
        background: "#fafbff"
    },


    questionHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "14px"
    },


    questionNumber: {
        width: "34px",
        height: "34px",
        borderRadius: "9px",
        background: "#eef2ff",
        color: "#4f46e5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: "700"
    },


    difficultyBadge: {
        padding: "5px 10px",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: "700"
    },


    questionText: {
        margin: "0 0 16px",
        fontSize: "15px",
        lineHeight: "1.6",
        fontWeight: "600",
        color: "#111827"
    },


    answerSection: {
        marginTop: "12px"
    },


    notesSection: {
        marginTop: "10px"
    },


    toggleButton: {
        border: "none",
        background: "transparent",
        color: "#4f46e5",
        padding: 0,
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer"
    },


    answerBox: {
        marginTop: "10px",
        padding: "14px",
        borderRadius: "9px",
        background: "#ffffff",
        border: "1px solid #e5e7eb"
    },


    notesBox: {
        marginTop: "10px",
        padding: "14px",
        borderRadius: "9px",
        background: "#fffbeb",
        border: "1px solid #fde68a"
    },


    contentLabel: {
        marginBottom: "6px",
        fontSize: "11px",
        fontWeight: "700",
        color: "#6b7280",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
    },


    contentText: {
        margin: 0,
        fontSize: "13px",
        lineHeight: "1.6",
        color: "#374151",
        whiteSpace: "pre-wrap"
    },


    questionState: {
        padding: "30px",
        textAlign: "center",
        color: "#6b7280"
    },


    questionError: {
        padding: "16px",
        borderRadius: "10px",
        background: "#fef2f2",
        color: "#dc2626",
        fontSize: "13px"
    },


    emptyQuestions: {
        textAlign: "center",
        padding: "35px 20px",
        border: "1px dashed #d1d5db",
        borderRadius: "12px",
        background: "#fafafa"
    },


    emptyIcon: {
        width: "42px",
        height: "42px",
        margin: "0 auto 12px",
        borderRadius: "12px",
        background: "#eef2ff",
        color: "#4f46e5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "700",
        fontSize: "18px"
    },


    emptyTitle: {
        margin: "0 0 6px",
        fontSize: "15px",
        fontWeight: "600",
        color: "#111827"
    },


    emptyDescription: {
        margin: 0,
        color: "#6b7280",
        fontSize: "13px"
    },


    secondaryPrimaryButton: {
        marginTop: "16px",
        padding: "10px 16px",
        borderRadius: "8px",
        border: "1px solid #c7d2fe",
        background: "#eef2ff",
        color: "#4f46e5",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer"
    },


    /* -------------------------------- */
    /* Journal                          */
    /* -------------------------------- */

    journalList: {
        display: "flex",
        flexDirection: "column",
        gap: "16px"
    },


    journalEntry: {
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "22px",
        background: "#fafbff"
    },


    journalHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "22px"
    },


    journalNumber: {
        display: "inline-block",
        fontSize: "13px",
        fontWeight: "700",
        color: "#4f46e5"
    },


    journalDate: {
        marginLeft: "10px",
        fontSize: "12px",
        color: "#9ca3af"
    },


    confidenceBadge: {
        padding: "6px 11px",
        borderRadius: "999px",
        background: "#eef2ff",
        color: "#4f46e5",
        fontSize: "12px",
        fontWeight: "700"
    },


    journalSection: {
        marginBottom: "18px"
    },


    journalLabel: {
        margin: "0 0 7px",
        fontSize: "12px",
        fontWeight: "700",
        color: "#6b7280",
        textTransform: "uppercase",
        letterSpacing: "0.4px"
    },


    journalText: {
        margin: 0,
        color: "#374151",
        fontSize: "14px",
        lineHeight: "1.65",
        whiteSpace: "pre-wrap"
    },


    /* -------------------------------- */
    /* Bottom Actions                   */
    /* -------------------------------- */

    actions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "12px",
        marginTop: "28px"
    },


    secondaryButton: {
        padding: "11px 18px",
        borderRadius: "9px",
        border: "1px solid #d1d5db",
        background: "#ffffff",
        color: "#374151",
        fontSize: "14px",
        fontWeight: "500",
        cursor: "pointer"
    },


    deleteButton: {
        padding: "11px 18px",
        borderRadius: "9px",
        border: "1px solid #fecaca",
        background: "#ffffff",
        color: "#dc2626",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer"
    },


    primaryButton: {
        padding: "11px 18px",
        borderRadius: "9px",
        border: "none",
        background: "#4f46e5",
        color: "#ffffff",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer"
    },


    backButton: {
        marginTop: "16px",
        padding: "10px 16px",
        borderRadius: "8px",
        border: "none",
        background: "#4f46e5",
        color: "#ffffff",
        cursor: "pointer"
    },


    /* -------------------------------- */
    /* Modal                            */
    /* -------------------------------- */

    modalOverlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(17, 24, 39, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        zIndex: 1000
    },


    modal: {
        width: "100%",
        maxWidth: "620px",
        maxHeight: "90vh",
        overflowY: "auto",
        background: "#ffffff",
        borderRadius: "18px",
        padding: "28px",
        boxShadow:
            "0 20px 60px rgba(0,0,0,0.15)"
    },


    modalHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "24px"
    },


    modalTitle: {
        margin: 0,
        fontSize: "20px",
        fontWeight: "700",
        color: "#111827"
    },


    modalDescription: {
        margin: "6px 0 0",
        color: "#6b7280",
        fontSize: "13px"
    },


    closeButton: {
        border: "none",
        background: "#f3f4f6",
        color: "#6b7280",
        width: "32px",
        height: "32px",
        borderRadius: "8px",
        fontSize: "22px",
        lineHeight: "1",
        cursor: "pointer"
    },


    formGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "7px",
        marginBottom: "18px"
    },


    formLabel: {
        fontSize: "13px",
        fontWeight: "600",
        color: "#374151"
    },


    input: {
        width: "100%",
        boxSizing: "border-box",
        padding: "11px 12px",
        border: "1px solid #d1d5db",
        borderRadius: "9px",
        background: "#ffffff",
        color: "#111827",
        fontSize: "14px",
        outline: "none"
    },


    textarea: {
        width: "100%",
        boxSizing: "border-box",
        padding: "11px 12px",
        border: "1px solid #d1d5db",
        borderRadius: "9px",
        background: "#ffffff",
        color: "#111827",
        fontSize: "14px",
        resize: "vertical",
        fontFamily: "inherit",
        lineHeight: "1.5",
        outline: "none"
    },


    modalActions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        marginTop: "24px",
        paddingTop: "20px",
        borderTop: "1px solid #e5e7eb"
    }

};


export default InterviewDetails;
