import { useEffect, useState } from "react";
import api from "../api/axios";

function Journal() {

    const [interviews, setInterviews] = useState([]);
    const [selectedInterview, setSelectedInterview] = useState("");
    const [journalEntries, setJournalEntries] = useState([]);

    const [form, setForm] = useState({
        experience: "",
        mistakes: "",
        learnings: "",
        confidenceLevel: 5,
    });

    const [loadingInterviews, setLoadingInterviews] = useState(true);
    const [loadingJournal, setLoadingJournal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function loadInterviews() {
        try {

            setLoadingInterviews(true);
            setError("");

            const response = await api.get(
                "/interviews?page=0&size=100"
            );

            setInterviews(response.data.content || []);

        } catch (err) {

            console.error("Failed to load interviews:", err);

            setError(
                err.response?.data?.message ||
                "Failed to load interviews."
            );

        } finally {

            setLoadingInterviews(false);
        }
    }

    // ==============================
    // LOAD INTERVIEWS
    // ==============================
    useEffect(() => {
        // The async loader owns the loading/error state for this page.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadInterviews();
    }, []);

    // ==============================
    // LOAD JOURNAL
    // ==============================
    const loadJournalEntries = async (interviewId) => {

        if (!interviewId) {
            setJournalEntries([]);
            return;
        }

        try {

            setLoadingJournal(true);
            setError("");

            const response = await api.get(
                `/interviews/${interviewId}/journal-entries`
            );

            setJournalEntries(response.data || []);

        } catch (err) {

            console.error(
                "Failed to load journal entries:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to load journal entries."
            );

            setJournalEntries([]);

        } finally {

            setLoadingJournal(false);
        }
    };

    // ==============================
    // INTERVIEW CHANGE
    // ==============================
    const handleInterviewChange = (e) => {

        const interviewId = e.target.value;

        setSelectedInterview(interviewId);

        setForm({
            experience: "",
            mistakes: "",
            learnings: "",
            confidenceLevel: 5,
        });

        loadJournalEntries(interviewId);
    };

    // ==============================
    // FORM CHANGE
    // ==============================
    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]:
                name === "confidenceLevel"
                    ? Number(value)
                    : value,
        }));
    };

    // ==============================
    // SAVE JOURNAL
    // ==============================
    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!selectedInterview) {
            alert("Please select an interview.");
            return;
        }

        if (!form.experience.trim()) {
            alert("Please enter your interview experience.");
            return;
        }

        try {

            setSaving(true);
            setError("");

            await api.post(
                `/interviews/${selectedInterview}/journal-entries`,
                {
                    experience: form.experience,
                    mistakes: form.mistakes,
                    learnings: form.learnings,
                    confidenceLevel: form.confidenceLevel,
                }
            );

            await loadJournalEntries(selectedInterview);

            setForm({
                experience: "",
                mistakes: "",
                learnings: "",
                confidenceLevel: 5,
            });

        } catch (err) {

            console.error(
                "Failed to save journal:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Failed to save journal entry."
            );

        } finally {

            setSaving(false);
        }
    };

    // ==============================
    // SELECTED INTERVIEW
    // ==============================
    const selectedInterviewData =
        interviews.find(
            (interview) =>
                String(interview.id) ===
                String(selectedInterview)
        );

    return (
        <div style={styles.page}>

            {/* HEADER */}
            <div style={styles.header}>

                <div>
                    <h1 style={styles.title}>
                        Interview Journal
                    </h1>

                    <p style={styles.subtitle}>
                        Reflect on your interviews, identify mistakes,
                        and track what you learned.
                    </p>
                </div>

            </div>


            {/* INTERVIEW SELECTOR */}
            <div style={styles.card}>

                <label style={styles.label}>
                    Select Interview
                </label>

                {loadingInterviews ? (

                    <p style={styles.muted}>
                        Loading interviews...
                    </p>

                ) : (

                    <select
                        value={selectedInterview}
                        onChange={handleInterviewChange}
                        style={styles.select}
                    >

                        <option value="">
                            Select an interview
                        </option>

                        {interviews.map((interview) => (

                            <option
                                key={interview.id}
                                value={interview.id}
                            >
                                {interview.companyName}
                                {" — "}
                                {interview.role}
                            </option>

                        ))}

                    </select>
                )}

            </div>


            {/* SELECTED INTERVIEW */}
            {selectedInterviewData && (

                <div style={styles.interviewBanner}>

                    <div>

                        <span style={styles.company}>
                            {selectedInterviewData.companyName}
                        </span>

                        <span style={styles.role}>
                            {selectedInterviewData.role}
                        </span>

                    </div>

                    <span
                        style={{
                            ...styles.status,
                            ...getStatusStyle(
                                selectedInterviewData.status
                            ),
                        }}
                    >
                        {selectedInterviewData.status}
                    </span>

                </div>
            )}


            {/* ERROR */}
            {error && (

                <div style={styles.error}>
                    {error}
                </div>
            )}


            {selectedInterview && (

                <div style={styles.contentGrid}>

                    {/* =========================
                        CREATE JOURNAL
                    ========================== */}

                    <div style={styles.card}>

                        <h2 style={styles.sectionTitle}>
                            Write Journal
                        </h2>

                        <p style={styles.sectionSubtitle}>
                            Record what happened during the interview.
                        </p>

                        <form onSubmit={handleSubmit}>

                            <div style={styles.field}>

                                <label style={styles.label}>
                                    Interview Experience
                                </label>

                                <textarea
                                    name="experience"
                                    value={form.experience}
                                    onChange={handleChange}
                                    placeholder="How did the interview go?"
                                    rows="6"
                                    style={styles.textarea}
                                />

                            </div>


                            <div style={styles.field}>

                                <label style={styles.label}>
                                    Mistakes
                                </label>

                                <textarea
                                    name="mistakes"
                                    value={form.mistakes}
                                    onChange={handleChange}
                                    placeholder="What mistakes did you make?"
                                    rows="5"
                                    style={styles.textarea}
                                />

                            </div>


                            <div style={styles.field}>

                                <label style={styles.label}>
                                    Learnings
                                </label>

                                <textarea
                                    name="learnings"
                                    value={form.learnings}
                                    onChange={handleChange}
                                    placeholder="What did you learn from this interview?"
                                    rows="5"
                                    style={styles.textarea}
                                />

                            </div>


                            {/* CONFIDENCE */}
                            <div style={styles.field}>

                                <div style={styles.confidenceHeader}>

                                    <label style={styles.label}>
                                        Confidence Level
                                    </label>

                                    <span style={styles.confidenceValue}>
                                        {form.confidenceLevel}/10
                                    </span>

                                </div>

                                <input
                                    type="range"
                                    name="confidenceLevel"
                                    min="1"
                                    max="10"
                                    value={form.confidenceLevel}
                                    onChange={handleChange}
                                    style={styles.range}
                                />

                            </div>


                            <button
                                type="submit"
                                disabled={saving}
                                style={{
                                    ...styles.saveButton,
                                    opacity: saving ? 0.7 : 1,
                                }}
                            >
                                {saving
                                    ? "Saving..."
                                    : "Save Journal Entry"}
                            </button>

                        </form>

                    </div>


                    {/* =========================
                        JOURNAL HISTORY
                    ========================== */}

                    <div style={styles.card}>

                        <h2 style={styles.sectionTitle}>
                            Journal History
                        </h2>

                        <p style={styles.sectionSubtitle}>
                            Your previous reflections for this interview.
                        </p>


                        {loadingJournal ? (

                            <p style={styles.muted}>
                                Loading journal entries...
                            </p>

                        ) : journalEntries.length === 0 ? (

                            <div style={styles.empty}>

                                <div style={styles.emptyIcon}>
                                    📝
                                </div>

                                <h3>
                                    No journal entries yet
                                </h3>

                                <p>
                                    Write your first reflection
                                    about this interview.
                                </p>

                            </div>

                        ) : (

                            <div style={styles.entries}>

                                {journalEntries.map((entry) => (

                                    <div
                                        key={entry.id}
                                        style={styles.entry}
                                    >

                                        <div style={styles.entryHeader}>

                                            <span style={styles.entryTitle}>
                                                Interview Reflection
                                            </span>

                                            <span
                                                style={
                                                    styles.confidenceBadge
                                                }
                                            >
                                                Confidence{" "}
                                                {entry.confidenceLevel}/10
                                            </span>

                                        </div>


                                        <JournalSection
                                            title="Experience"
                                            value={entry.experience}
                                        />

                                        <JournalSection
                                            title="Mistakes"
                                            value={entry.mistakes}
                                        />

                                        <JournalSection
                                            title="Learnings"
                                            value={entry.learnings}
                                        />

                                    </div>

                                ))}

                            </div>
                        )}

                    </div>

                </div>
            )}

        </div>
    );
}


// ==============================
// JOURNAL SECTION
// ==============================

function JournalSection({ title, value }) {

    if (!value) return null;

    return (
        <div style={styles.entrySection}>

            <h4 style={styles.entrySectionTitle}>
                {title}
            </h4>

            <p style={styles.entryText}>
                {value}
            </p>

        </div>
    );
}


// ==============================
// STATUS STYLE
// ==============================

function getStatusStyle(status) {

    switch (status) {

        case "SELECTED":
            return {
                background: "#ecfdf5",
                color: "#059669",
            };

        case "REJECTED":
            return {
                background: "#fef2f2",
                color: "#dc2626",
            };

        case "IN_PROGRESS":
            return {
                background: "#fff7ed",
                color: "#ea580c",
            };

        default:
            return {
                background: "#eef2ff",
                color: "#4f46e5",
            };
    }
}


// ==============================
// STYLES
// ==============================

const styles = {

    page: {
        padding: "32px",
        background: "#f8f9fc",
        minHeight: "100vh",
    },

    header: {
        marginBottom: "28px",
    },

    title: {
        fontSize: "30px",
        fontWeight: "700",
        margin: "0 0 8px",
        color: "#111827",
    },

    subtitle: {
        margin: 0,
        color: "#6b7280",
        fontSize: "15px",
    },

    card: {
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "24px",
        marginBottom: "24px",
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
    },

    label: {
        display: "block",
        fontSize: "14px",
        fontWeight: "600",
        color: "#374151",
        marginBottom: "8px",
    },

    select: {
        width: "100%",
        padding: "13px 14px",
        border: "1px solid #d1d5db",
        borderRadius: "10px",
        fontSize: "14px",
        background: "#ffffff",
        outline: "none",
    },

    interviewBanner: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "18px 22px",
        marginBottom: "24px",
    },

    company: {
        fontWeight: "700",
        color: "#4f46e5",
        marginRight: "10px",
    },

    role: {
        color: "#6b7280",
        fontSize: "14px",
    },

    status: {
        padding: "6px 12px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: "700",
    },

    contentGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "24px",
        alignItems: "start",
    },

    sectionTitle: {
        margin: "0 0 6px",
        fontSize: "20px",
        color: "#111827",
    },

    sectionSubtitle: {
        margin: "0 0 22px",
        color: "#6b7280",
        fontSize: "14px",
    },

    field: {
        marginBottom: "20px",
    },

    textarea: {
        width: "100%",
        boxSizing: "border-box",
        padding: "13px",
        border: "1px solid #d1d5db",
        borderRadius: "10px",
        resize: "vertical",
        fontSize: "14px",
        lineHeight: "1.6",
        fontFamily: "inherit",
        outline: "none",
    },

    confidenceHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },

    confidenceValue: {
        fontWeight: "700",
        color: "#4f46e5",
        fontSize: "14px",
    },

    range: {
        width: "100%",
        accentColor: "#4f46e5",
        cursor: "pointer",
    },

    saveButton: {
        width: "100%",
        padding: "13px",
        border: "none",
        borderRadius: "10px",
        background: "#4f46e5",
        color: "#ffffff",
        fontSize: "14px",
        fontWeight: "700",
        cursor: "pointer",
    },

    muted: {
        color: "#6b7280",
        fontSize: "14px",
    },

    error: {
        background: "#fef2f2",
        border: "1px solid #fecaca",
        color: "#b91c1c",
        padding: "12px 16px",
        borderRadius: "10px",
        marginBottom: "20px",
    },

    empty: {
        textAlign: "center",
        padding: "50px 20px",
        color: "#6b7280",
    },

    emptyIcon: {
        fontSize: "35px",
        marginBottom: "12px",
    },

    entries: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
    },

    entry: {
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "18px",
        background: "#fafafa",
    },

    entryHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "18px",
    },

    entryTitle: {
        fontWeight: "700",
        color: "#111827",
    },

    confidenceBadge: {
        background: "#eef2ff",
        color: "#4f46e5",
        padding: "5px 9px",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: "700",
    },

    entrySection: {
        marginBottom: "16px",
    },

    entrySectionTitle: {
        margin: "0 0 6px",
        fontSize: "13px",
        fontWeight: "700",
        color: "#374151",
    },

    entryText: {
        margin: 0,
        color: "#6b7280",
        fontSize: "14px",
        lineHeight: "1.6",
        whiteSpace: "pre-wrap",
    },
};

export default Journal;
