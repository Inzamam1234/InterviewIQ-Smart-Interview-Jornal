import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

function Questions() {

    const [questions, setQuestions] = useState([]);
    const [interviews, setInterviews] = useState([]);

    const [search, setSearch] = useState("");
    const [interviewFilter, setInterviewFilter] = useState("ALL");
    const [difficulty, setDifficulty] = useState("ALL");

    const [openQuestion, setOpenQuestion] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showAddForm, setShowAddForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        interviewId: "",
        questionText: "",
        difficulty: "EASY",
        answer: "",
        notes: ""
    });


    /* ================================================= */
    /* Load Interviews + Questions                       */
    /* ================================================= */

    const loadQuestions = async () => {

        try {

            setLoading(true);
            setError("");

            /*
             * Get the current user's interviews.
             * Your backend already handles ownership.
             */
            const interviewResponse = await api.get(
                "/interviews?page=0&size=100"
            );

            const interviewList = interviewResponse.data.content || [];

            setInterviews(interviewList);

            /*
             * Get questions for every interview.
             */
            const questionResponses = await Promise.all(
                interviewList.map(async (interview) => {

                    try {

                        const response = await api.get(
                            `/interviews/${interview.id}/questions`
                        );

                        return response.data.map((question) => ({
                            ...question,

                            interviewId: interview.id,

                            companyName: interview.companyName,

                            role: interview.role
                        }));

                    } catch (err) {

                        console.error(
                            `Failed to load questions for interview ${interview.id}`,
                            err
                        );

                        return [];
                    }
                })
            );

            const allQuestions = questionResponses.flat();

            setQuestions(allQuestions);

        } catch (err) {

            console.error("========== CREATE QUESTION ERROR ==========");
            console.error("Status:", err.response?.status);
            console.error("Response:", err.response?.data);
            console.error("Full error:", err);

            alert(
                `Failed to create question.\n\nStatus: ${
                    err.response?.status || "Unknown"
                }\n\n${
                    typeof err.response?.data === "string"
                        ? err.response.data
                        : JSON.stringify(err.response?.data)
                }`
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadQuestions();

    }, []);


    /* ================================================= */
    /* Filtering                                         */
    /* ================================================= */

    const filteredQuestions = useMemo(() => {

        return questions.filter((item) => {

            const searchText = search.toLowerCase().trim();

            const matchesSearch =
                !searchText ||
                item.questionText?.toLowerCase().includes(searchText) ||
                item.answer?.toLowerCase().includes(searchText) ||
                item.notes?.toLowerCase().includes(searchText) ||
                item.companyName?.toLowerCase().includes(searchText) ||
                item.role?.toLowerCase().includes(searchText);


            const matchesInterview =
                interviewFilter === "ALL" ||
                String(item.interviewId) === String(interviewFilter);


            const matchesDifficulty =
                difficulty === "ALL" ||
                item.difficulty === difficulty;


            return (
                matchesSearch &&
                matchesInterview &&
                matchesDifficulty
            );

        });

    }, [
        questions,
        search,
        interviewFilter,
        difficulty
    ]);


    /* ================================================= */
    /* Helpers                                           */
    /* ================================================= */

    const formatDifficulty = (value) => {

        if (!value) {
            return "";
        }

        return (
            value.charAt(0) +
            value.slice(1).toLowerCase()
        );
    };


    const getDifficultyStyle = (value) => {

        switch (value) {

            case "EASY":
                return styles.easy;

            case "MEDIUM":
                return styles.medium;

            case "HARD":
                return styles.hard;

            default:
                return styles.defaultDifficulty;
        }
    };


    const clearFilters = () => {

        setSearch("");
        setInterviewFilter("ALL");
        setDifficulty("ALL");
        setOpenQuestion(null);

    };


    /* ================================================= */
    /* Add Question                                      */
    /* ================================================= */

    const handleFormChange = (e) => {

        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));

    };


    const handleAddQuestion = async (e) => {

        e.preventDefault();

        if (!form.interviewId) {
            alert("Please select an interview.");
            return;
        }

        if (!form.questionText.trim()) {
            alert("Please enter the question.");
            return;
        }

        try {

            setSubmitting(true);

            await api.post(
                `/interviews/${form.interviewId}/questions`,
                {
                    questionText: form.questionText,
                    difficulty: form.difficulty,
                    answer: form.answer,
                    notes: form.notes
                }
            );

            /*
             * Reload from backend so the UI always
             * reflects PostgreSQL.
             */
            await loadQuestions();

            setForm({
                interviewId: "",
                questionText: "",
                difficulty: "EASY",
                answer: "",
                notes: ""
            });

            setShowAddForm(false);

        } catch (err) {

            console.error("Failed to create question:", err);

            alert(
                err.response?.data?.message ||
                "Failed to create question."
            );

        } finally {

            setSubmitting(false);

        }
    };


    /* ================================================= */
    /* Loading State                                     */
    /* ================================================= */

    if (loading) {

        return (

            <div style={styles.page}>

                <div style={styles.header}>

                    <div>

                        <h1 style={styles.title}>
                            Questions
                        </h1>

                        <p style={styles.subtitle}>
                            Practice and organize your interview questions.
                        </p>

                    </div>

                </div>

                <div style={styles.loading}>
                    Loading questions...
                </div>

            </div>

        );

    }


    /* ================================================= */
    /* Main UI                                           */
    /* ================================================= */

    return (

        <div style={styles.page}>

            {/* ========================================= */}
            {/* Header                                    */}
            {/* ========================================= */}

            <div style={styles.header}>

                <div>

                    <h1 style={styles.title}>
                        Questions
                    </h1>

                    <p style={styles.subtitle}>
                        Practice and organize your interview questions.
                    </p>

                </div>


                <button
                    style={styles.addButton}
                    onClick={() => setShowAddForm(true)}
                >
                    <span style={styles.addIcon}>
                        +
                    </span>

                    Add Question
                </button>

            </div>


            {/* ========================================= */}
            {/* Error                                     */}
            {/* ========================================= */}

            {error && (

                <div style={styles.errorBox}>

                    <span>
                        {error}
                    </span>

                    <button
                        style={styles.retryButton}
                        onClick={loadQuestions}
                    >
                        Retry
                    </button>

                </div>

            )}


            {/* ========================================= */}
            {/* Search + Filters                          */}
            {/* ========================================= */}

            <div style={styles.toolbar}>

                <div style={styles.searchBox}>

                    <span style={styles.searchIcon}>
                        🔍
                    </span>

                    <input
                        type="text"
                        placeholder="Search questions, answers, company..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        style={styles.searchInput}
                    />


                    {search && (

                        <button
                            style={styles.clearSearch}
                            onClick={() => setSearch("")}
                        >
                            ×
                        </button>

                    )}

                </div>


                <select
                    value={interviewFilter}
                    onChange={(e) =>
                        setInterviewFilter(e.target.value)
                    }
                    style={styles.filter}
                >

                    <option value="ALL">
                        All Interviews
                    </option>

                    {interviews.map((interview) => (

                        <option
                            key={interview.id}
                            value={interview.id}
                        >
                            {interview.companyName}
                        </option>

                    ))}

                </select>


                <select
                    value={difficulty}
                    onChange={(e) =>
                        setDifficulty(e.target.value)
                    }
                    style={styles.filter}
                >

                    <option value="ALL">
                        All Difficulty
                    </option>

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


            {/* ========================================= */}
            {/* Results Bar                               */}
            {/* ========================================= */}

            <div style={styles.resultsBar}>

                <span style={styles.resultsText}>

                    Showing{" "}

                    <strong>
                        {filteredQuestions.length}
                    </strong>{" "}

                    question
                    {filteredQuestions.length !== 1
                        ? "s"
                        : ""}

                </span>


                {(search ||
                    interviewFilter !== "ALL" ||
                    difficulty !== "ALL") && (

                    <button
                        style={styles.clearFilters}
                        onClick={clearFilters}
                    >
                        Clear filters
                    </button>

                )}

            </div>


            {/* ========================================= */}
            {/* Empty State                               */}
            {/* ========================================= */}

            {filteredQuestions.length === 0 && (

                <div style={styles.empty}>

                    <div style={styles.emptyIcon}>
                        ?
                    </div>

                    <h2 style={styles.emptyTitle}>
                        No questions found
                    </h2>

                    <p style={styles.emptyText}>

                        {questions.length === 0
                            ? "You haven't added any interview questions yet."
                            : "Try changing your search or filters."
                        }

                    </p>


                    {questions.length === 0 ? (

                        <button
                            style={styles.primaryEmptyButton}
                            onClick={() =>
                                setShowAddForm(true)
                            }
                        >
                            Add Your First Question
                        </button>

                    ) : (

                        <button
                            style={styles.secondaryButton}
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </button>

                    )}

                </div>

            )}


            {/* ========================================= */}
            {/* Question List                             */}
            {/* ========================================= */}

            {filteredQuestions.length > 0 && (

                <div style={styles.list}>

                    {filteredQuestions.map((item) => {

                        const isOpen =
                            openQuestion === item.id;


                        return (

                            <div
                                key={item.id}
                                style={styles.card}
                            >

                                {/* Question Header */}

                                <div style={styles.cardHeader}>

                                    <div style={styles.cardInfo}>

                                        <div style={styles.tags}>

                                            <span
                                                style={styles.categoryTag}
                                            >
                                                {item.companyName}
                                            </span>

                                            <span
                                                style={styles.topicTag}
                                            >
                                                {item.role}
                                            </span>

                                        </div>


                                        <h2 style={styles.question}>
                                            {item.questionText}
                                        </h2>

                                    </div>


                                    <span
                                        style={{
                                            ...styles.difficulty,
                                            ...getDifficultyStyle(
                                                item.difficulty
                                            )
                                        }}
                                    >
                                        {formatDifficulty(
                                            item.difficulty
                                        )}
                                    </span>

                                </div>


                                {/* Answer */}

                                {isOpen && (

                                    <div style={styles.answerArea}>

                                        <div style={styles.answerBox}>

                                            <div style={styles.answerTitle}>
                                                Answer
                                            </div>

                                            <p style={styles.answer}>

                                                {item.answer?.trim()
                                                    ? item.answer
                                                    : "No answer added yet."
                                                }

                                            </p>

                                        </div>


                                        {item.notes?.trim() && (

                                            <div style={styles.notesBox}>

                                                <div style={styles.notesTitle}>
                                                    Notes
                                                </div>

                                                <p style={styles.notes}>
                                                    {item.notes}
                                                </p>

                                            </div>

                                        )}

                                    </div>

                                )}


                                {/* Footer */}

                                <div style={styles.cardFooter}>

                                    <span style={styles.questionLabel}>
                                        InterviewIQ Question
                                    </span>


                                    <button
                                        style={styles.viewButton}
                                        onClick={() =>
                                            setOpenQuestion(
                                                isOpen
                                                    ? null
                                                    : item.id
                                            )
                                        }
                                    >

                                        {isOpen
                                            ? "Hide Answer"
                                            : "View Answer"}

                                        <span>
                                            {isOpen
                                                ? "↑"
                                                : "→"}
                                        </span>

                                    </button>

                                </div>

                            </div>

                        );

                    })}

                </div>

            )}


            {/* ========================================= */}
            {/* Add Question Modal                        */}
            {/* ========================================= */}

            {showAddForm && (

                <div
                    style={styles.overlay}
                    onClick={() =>
                        !submitting &&
                        setShowAddForm(false)
                    }
                >

                    <div
                        style={styles.modal}
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div style={styles.modalHeader}>

                            <div>

                                <h2 style={styles.modalTitle}>
                                    Add Question
                                </h2>

                                <p style={styles.modalSubtitle}>
                                    Add a question to one of your interviews.
                                </p>

                            </div>


                            <button
                                style={styles.closeButton}
                                onClick={() =>
                                    !submitting &&
                                    setShowAddForm(false)
                                }
                            >
                                ×
                            </button>

                        </div>


                        <form
                            onSubmit={handleAddQuestion}
                            style={styles.form}
                        >

                            {/* Interview */}

                            <div style={styles.formGroup}>

                                <label style={styles.label}>
                                    Interview
                                </label>

                                <select
                                    name="interviewId"
                                    value={form.interviewId}
                                    onChange={handleFormChange}
                                    style={styles.input}
                                    required
                                >

                                    <option value="">
                                        Select an interview
                                    </option>

                                    {interviews.map((interview) => (

                                        <option
                                            key={interview.id}
                                            value={interview.id}
                                        >
                                            {interview.companyName} — {interview.role}
                                        </option>

                                    ))}

                                </select>

                            </div>


                            {/* Question */}

                            <div style={styles.formGroup}>

                                <label style={styles.label}>
                                    Question
                                </label>

                                <textarea
                                    name="questionText"
                                    value={form.questionText}
                                    onChange={handleFormChange}
                                    placeholder="Enter the interview question..."
                                    style={styles.textarea}
                                    rows="3"
                                    required
                                />

                            </div>


                            {/* Difficulty */}

                            <div style={styles.formGroup}>

                                <label style={styles.label}>
                                    Difficulty
                                </label>

                                <select
                                    name="difficulty"
                                    value={form.difficulty}
                                    onChange={handleFormChange}
                                    style={styles.input}
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

                            <div style={styles.formGroup}>

                                <label style={styles.label}>
                                    Answer
                                </label>

                                <textarea
                                    name="answer"
                                    value={form.answer}
                                    onChange={handleFormChange}
                                    placeholder="Enter your answer..."
                                    style={styles.textarea}
                                    rows="4"
                                />

                            </div>


                            {/* Notes */}

                            <div style={styles.formGroup}>

                                <label style={styles.label}>
                                    Notes
                                </label>

                                <textarea
                                    name="notes"
                                    value={form.notes}
                                    onChange={handleFormChange}
                                    placeholder="Add notes or things to remember..."
                                    style={styles.textarea}
                                    rows="3"
                                />

                            </div>


                            {/* Buttons */}

                            <div style={styles.formActions}>

                                <button
                                    type="button"
                                    style={styles.cancelButton}
                                    onClick={() =>
                                        setShowAddForm(false)
                                    }
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    style={styles.submitButton}
                                    disabled={submitting}
                                >

                                    {submitting
                                        ? "Saving..."
                                        : "Save Question"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );

}


/* ================================================= */
/* Styles                                            */
/* ================================================= */

const styles = {

    page: {
        minHeight: "100vh",
        padding: "36px 40px 60px",
        background: "#f8f9fc",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#111827"
    },


    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "28px"
    },


    title: {
        margin: 0,
        fontSize: "30px",
        fontWeight: "700",
        letterSpacing: "-0.5px"
    },


    subtitle: {
        margin: "7px 0 0",
        color: "#6b7280",
        fontSize: "15px"
    },


    addButton: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        border: "none",
        borderRadius: "10px",
        background: "#4f46e5",
        color: "#ffffff",
        padding: "13px 18px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        boxShadow: "0 5px 14px rgba(79, 70, 229, 0.18)"
    },


    addIcon: {
        fontSize: "19px",
        lineHeight: 1
    },


    toolbar: {
        display: "flex",
        gap: "12px",
        marginBottom: "18px"
    },


    searchBox: {
        flex: 1,
        height: "48px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "0 15px",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px"
    },


    searchIcon: {
        fontSize: "15px"
    },


    searchInput: {
        width: "100%",
        border: "none",
        outline: "none",
        background: "transparent",
        fontSize: "14px",
        color: "#111827"
    },


    clearSearch: {
        border: "none",
        background: "transparent",
        color: "#9ca3af",
        fontSize: "20px",
        cursor: "pointer"
    },


    filter: {
        width: "180px",
        height: "48px",
        padding: "0 12px",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        background: "#ffffff",
        color: "#374151",
        fontSize: "14px",
        outline: "none",
        cursor: "pointer"
    },


    resultsBar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px"
    },


    resultsText: {
        color: "#9ca3af",
        fontSize: "13px"
    },


    clearFilters: {
        border: "none",
        background: "transparent",
        color: "#4f46e5",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer"
    },


    list: {
        display: "flex",
        flexDirection: "column",
        gap: "12px"
    },


    card: {
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "22px 24px"
    },


    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "20px"
    },


    cardInfo: {
        minWidth: 0
    },


    tags: {
        display: "flex",
        alignItems: "center",
        gap: "7px",
        marginBottom: "10px"
    },


    categoryTag: {
        padding: "5px 9px",
        borderRadius: "7px",
        background: "#f1efff",
        color: "#4f46e5",
        fontSize: "11px",
        fontWeight: "600"
    },


    topicTag: {
        padding: "5px 9px",
        borderRadius: "7px",
        background: "#f3f4f6",
        color: "#6b7280",
        fontSize: "11px",
        fontWeight: "500"
    },


    question: {
        margin: 0,
        fontSize: "16px",
        lineHeight: "1.5",
        fontWeight: "600",
        color: "#111827"
    },


    difficulty: {
        flexShrink: 0,
        padding: "6px 11px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: "600"
    },


    easy: {
        background: "#ecfdf5",
        color: "#047857"
    },


    medium: {
        background: "#fff7ed",
        color: "#c2410c"
    },


    hard: {
        background: "#fef2f2",
        color: "#dc2626"
    },


    defaultDifficulty: {
        background: "#f3f4f6",
        color: "#4b5563"
    },


    answerArea: {
        marginTop: "20px"
    },


    answerBox: {
        padding: "18px",
        background: "#f8f9fc",
        border: "1px solid #eef0f4",
        borderRadius: "12px"
    },


    answerTitle: {
        marginBottom: "8px",
        color: "#374151",
        fontSize: "13px",
        fontWeight: "700"
    },


    answer: {
        margin: 0,
        color: "#6b7280",
        fontSize: "14px",
        lineHeight: "1.7"
    },


    notesBox: {
        marginTop: "10px",
        padding: "16px 18px",
        background: "#fffaf0",
        border: "1px solid #f4e8c8",
        borderRadius: "12px"
    },


    notesTitle: {
        marginBottom: "6px",
        color: "#92400e",
        fontSize: "13px",
        fontWeight: "700"
    },


    notes: {
        margin: 0,
        color: "#78716c",
        fontSize: "14px",
        lineHeight: "1.6"
    },


    cardFooter: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "20px",
        paddingTop: "16px",
        borderTop: "1px solid #f0f1f4"
    },


    questionLabel: {
        color: "#9ca3af",
        fontSize: "12px"
    },


    viewButton: {
        display: "flex",
        alignItems: "center",
        gap: "7px",
        border: "none",
        background: "transparent",
        color: "#4f46e5",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer"
    },


    empty: {
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "70px 30px",
        textAlign: "center"
    },


    emptyIcon: {
        width: "56px",
        height: "56px",
        margin: "0 auto 18px",
        borderRadius: "16px",
        background: "#f1efff",
        color: "#4f46e5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "24px",
        fontWeight: "700"
    },


    emptyTitle: {
        margin: 0,
        fontSize: "20px",
        fontWeight: "600"
    },


    emptyText: {
        margin: "10px 0 22px",
        color: "#6b7280",
        fontSize: "14px"
    },


    primaryEmptyButton: {
        border: "none",
        background: "#4f46e5",
        color: "#ffffff",
        borderRadius: "9px",
        padding: "11px 18px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer"
    },


    secondaryButton: {
        border: "1px solid #d1d5db",
        background: "#ffffff",
        color: "#374151",
        borderRadius: "9px",
        padding: "10px 16px",
        fontSize: "14px",
        fontWeight: "500",
        cursor: "pointer"
    },


    loading: {
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "70px",
        textAlign: "center",
        color: "#6b7280",
        fontSize: "14px"
    },


    errorBox: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "18px",
        padding: "14px 16px",
        background: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: "10px",
        color: "#b91c1c",
        fontSize: "14px"
    },


    retryButton: {
        border: "none",
        background: "transparent",
        color: "#b91c1c",
        fontWeight: "600",
        cursor: "pointer"
    },


    /* ============================================== */
    /* Modal                                          */
    /* ============================================== */

    overlay: {
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: "rgba(15, 23, 42, 0.45)"
    },


    modal: {
        width: "100%",
        maxWidth: "600px",
        maxHeight: "90vh",
        overflowY: "auto",
        background: "#ffffff",
        borderRadius: "18px",
        boxShadow: "0 25px 60px rgba(0, 0, 0, 0.18)"
    },


    modalHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "24px 26px 20px",
        borderBottom: "1px solid #eef0f4"
    },


    modalTitle: {
        margin: 0,
        fontSize: "21px",
        fontWeight: "700"
    },


    modalSubtitle: {
        margin: "6px 0 0",
        color: "#6b7280",
        fontSize: "13px"
    },


    closeButton: {
        width: "34px",
        height: "34px",
        border: "none",
        borderRadius: "8px",
        background: "#f3f4f6",
        color: "#6b7280",
        fontSize: "22px",
        cursor: "pointer"
    },


    form: {
        padding: "24px 26px"
    },


    formGroup: {
        marginBottom: "18px"
    },


    label: {
        display: "block",
        marginBottom: "7px",
        color: "#374151",
        fontSize: "13px",
        fontWeight: "600"
    },


    input: {
        width: "100%",
        height: "46px",
        boxSizing: "border-box",
        padding: "0 12px",
        border: "1px solid #dfe3ea",
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
        border: "1px solid #dfe3ea",
        borderRadius: "9px",
        background: "#ffffff",
        color: "#111827",
        fontSize: "14px",
        lineHeight: "1.5",
        outline: "none",
        resize: "vertical",
        fontFamily: "inherit"
    },


    formActions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        marginTop: "24px",
        paddingTop: "20px",
        borderTop: "1px solid #eef0f4"
    },


    cancelButton: {
        border: "1px solid #d1d5db",
        background: "#ffffff",
        color: "#374151",
        borderRadius: "9px",
        padding: "11px 18px",
        fontSize: "14px",
        fontWeight: "500",
        cursor: "pointer"
    },


    submitButton: {
        border: "none",
        background: "#4f46e5",
        color: "#ffffff",
        borderRadius: "9px",
        padding: "11px 18px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer"
    }

};


export default Questions;