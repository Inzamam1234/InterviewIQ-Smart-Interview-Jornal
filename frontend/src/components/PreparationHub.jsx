import { useEffect, useMemo, useState } from "react";

const DEFAULT_TASKS = [
    {
        id: "research",
        title: "Research the company and role",
        description: "Review the team, product, and responsibilities before the call."
    },
    {
        id: "stories",
        title: "Prepare three STAR stories",
        description: "Choose examples that show impact, ownership, and learning."
    },
    {
        id: "review-questions",
        title: "Review saved questions",
        description: "Refresh your answers and identify topics that need more practice."
    },
    {
        id: "questions-to-ask",
        title: "Write questions for the interviewer",
        description: "Bring thoughtful questions about the role, team, and next steps."
    },
    {
        id: "logistics",
        title: "Confirm interview logistics",
        description: "Check the time, meeting link, location, and anything to bring."
    }
];

function PreparationHub({
    interview,
    questions,
    journalEntries,
    onAddQuestion,
    onAddJournal
}) {
    const storageKey = `interviewiq.preparation.${interview.id}`;
    const [completedTasks, setCompletedTasks] = useState({});

    useEffect(() => {
        let savedTasks = {};

        try {
            savedTasks = JSON.parse(localStorage.getItem(storageKey) || "{}");
        } catch {
            // Ignore malformed local checklist data and start fresh.
        }

        // The checklist is intentionally local to this browser for now; no schema change is required.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCompletedTasks(savedTasks);
    }, [storageKey]);

    const completedCount = useMemo(
        () => DEFAULT_TASKS.filter((task) => completedTasks[task.id]).length,
        [completedTasks]
    );

    const toggleTask = (taskId) => {
        const nextTasks = {
            ...completedTasks,
            [taskId]: !completedTasks[taskId]
        };

        setCompletedTasks(nextTasks);

        try {
            localStorage.setItem(storageKey, JSON.stringify(nextTasks));
        } catch {
            // Keep the checklist usable if browser storage is unavailable.
        }
    };

    const scrollToSection = (sectionId) => {
        document.getElementById(sectionId)?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    };

    const nextRoundLabel = interview.nextRoundDate
        ? new Date(`${interview.nextRoundDate}T00:00:00`).toLocaleDateString(
            undefined,
            { month: "short", day: "numeric", year: "numeric" }
        )
        : "Date not set";

    return (
        <section style={styles.card} aria-labelledby="preparation-hub-title">
            <div style={styles.header}>
                <div>
                    <div style={styles.eyebrow}>PREP WORKSPACE</div>
                    <h2 id="preparation-hub-title" style={styles.title}>
                        Prepare for this interview
                    </h2>
                    <p style={styles.description}>
                        Use a simple plan to turn your saved notes into focused preparation.
                    </p>
                    <p style={styles.storageNote}>
                        Checklist progress is saved on this device.
                    </p>
                </div>
                <div style={styles.progressBadge}>
                    {completedCount}/{DEFAULT_TASKS.length} complete
                </div>
            </div>

            <div style={styles.progressTrack} aria-label={`${completedCount} of ${DEFAULT_TASKS.length} preparation tasks complete`}>
                <div
                    style={{
                        ...styles.progressFill,
                        width: `${(completedCount / DEFAULT_TASKS.length) * 100}%`
                    }}
                />
            </div>

            <div style={styles.snapshotGrid}>
                <div style={styles.snapshotCard}>
                    <span style={styles.snapshotValue}>{questions.length}</span>
                    <span style={styles.snapshotLabel}>Saved questions</span>
                    <button
                        type="button"
                        style={styles.linkButton}
                        onClick={() => scrollToSection("interview-questions")}
                    >
                        Review questions →
                    </button>
                </div>
                <div style={styles.snapshotCard}>
                    <span style={styles.snapshotValue}>{journalEntries.length}</span>
                    <span style={styles.snapshotLabel}>Reflections</span>
                    <button
                        type="button"
                        style={styles.linkButton}
                        onClick={() => scrollToSection("interview-journal")}
                    >
                        Review reflections →
                    </button>
                </div>
                <div style={styles.snapshotCard}>
                    <span style={styles.snapshotValue}>{nextRoundLabel}</span>
                    <span style={styles.snapshotLabel}>Next interview</span>
                    <span style={styles.snapshotHint}>
                        {interview.currentRound || "Round not specified"}
                    </span>
                </div>
            </div>

            <div style={styles.taskList}>
                {DEFAULT_TASKS.map((task) => {
                    const isComplete = Boolean(completedTasks[task.id]);

                    return (
                        <button
                            key={task.id}
                            type="button"
                            aria-pressed={isComplete}
                            style={{
                                ...styles.task,
                                ...(isComplete ? styles.completedTask : {})
                            }}
                            onClick={() => toggleTask(task.id)}
                        >
                            <span
                                style={{
                                    ...styles.checkbox,
                                    ...(isComplete ? styles.checkedBox : {})
                                }}
                                aria-hidden="true"
                            >
                                {isComplete ? "✓" : ""}
                            </span>
                            <span style={styles.taskCopy}>
                                <span style={styles.taskTitle}>{task.title}</span>
                                <span style={styles.taskDescription}>{task.description}</span>
                            </span>
                        </button>
                    );
                })}
            </div>

            <div style={styles.actions}>
                <button
                    type="button"
                    style={styles.secondaryButton}
                    onClick={onAddQuestion}
                >
                    + Add question
                </button>
                <button
                    type="button"
                    style={styles.primaryButton}
                    onClick={onAddJournal}
                >
                    + Add reflection
                </button>
            </div>
        </section>
    );
}

const styles = {
    card: {
        background: "linear-gradient(135deg, #f8faff 0%, #ffffff 72%)",
        border: "1px solid #c7d2fe",
        borderRadius: "16px",
        padding: "28px",
        marginBottom: "20px",
        boxShadow: "0 8px 24px rgba(79, 70, 229, 0.06)"
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "16px",
        marginBottom: "18px"
    },
    eyebrow: {
        color: "#4f46e5",
        fontSize: "11px",
        fontWeight: "800",
        letterSpacing: "1px",
        marginBottom: "7px"
    },
    title: {
        margin: 0,
        color: "#111827",
        fontSize: "20px",
        fontWeight: "700"
    },
    description: {
        margin: "7px 0 0",
        color: "#6b7280",
        fontSize: "13px",
        lineHeight: "1.5"
    },
    storageNote: {
        margin: "5px 0 0",
        color: "#9ca3af",
        fontSize: "11px"
    },
    progressBadge: {
        flexShrink: 0,
        padding: "7px 10px",
        borderRadius: "999px",
        background: "#eef2ff",
        color: "#4338ca",
        fontSize: "12px",
        fontWeight: "700"
    },
    progressTrack: {
        height: "8px",
        overflow: "hidden",
        borderRadius: "999px",
        background: "#e5e7eb",
        marginBottom: "20px"
    },
    progressFill: {
        height: "100%",
        borderRadius: "999px",
        background: "linear-gradient(90deg, #4f46e5, #7c3aed)",
        transition: "width 180ms ease"
    },
    snapshotGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "12px",
        marginBottom: "20px"
    },
    snapshotCard: {
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        padding: "14px",
        border: "1px solid #e0e7ff",
        borderRadius: "12px",
        background: "rgba(255, 255, 255, 0.8)"
    },
    snapshotValue: {
        color: "#111827",
        fontSize: "18px",
        fontWeight: "800",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
    },
    snapshotLabel: {
        color: "#6b7280",
        fontSize: "12px",
        fontWeight: "600"
    },
    snapshotHint: {
        color: "#9ca3af",
        fontSize: "11px"
    },
    linkButton: {
        alignSelf: "flex-start",
        marginTop: "3px",
        padding: 0,
        border: "none",
        background: "transparent",
        color: "#4f46e5",
        fontSize: "12px",
        fontWeight: "700",
        cursor: "pointer"
    },
    taskList: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "10px"
    },
    task: {
        display: "flex",
        alignItems: "flex-start",
        gap: "11px",
        width: "100%",
        padding: "13px",
        border: "1px solid #e5e7eb",
        borderRadius: "11px",
        background: "#ffffff",
        color: "inherit",
        textAlign: "left",
        cursor: "pointer"
    },
    completedTask: {
        borderColor: "#a7f3d0",
        background: "#f0fdf4"
    },
    checkbox: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        width: "20px",
        height: "20px",
        marginTop: "1px",
        border: "2px solid #c7d2fe",
        borderRadius: "6px",
        color: "#ffffff",
        fontSize: "12px",
        fontWeight: "800"
    },
    checkedBox: {
        borderColor: "#10b981",
        background: "#10b981"
    },
    taskCopy: {
        display: "flex",
        flexDirection: "column",
        gap: "4px"
    },
    taskTitle: {
        color: "#111827",
        fontSize: "13px",
        fontWeight: "700"
    },
    taskDescription: {
        color: "#6b7280",
        fontSize: "11px",
        lineHeight: "1.4"
    },
    actions: {
        display: "flex",
        justifyContent: "flex-end",
        flexWrap: "wrap",
        gap: "10px",
        marginTop: "18px"
    },
    secondaryButton: {
        padding: "10px 14px",
        border: "1px solid #c7d2fe",
        borderRadius: "9px",
        background: "#ffffff",
        color: "#4338ca",
        fontSize: "13px",
        fontWeight: "700",
        cursor: "pointer"
    },
    primaryButton: {
        padding: "10px 14px",
        border: "none",
        borderRadius: "9px",
        background: "#4f46e5",
        color: "#ffffff",
        fontSize: "13px",
        fontWeight: "700",
        cursor: "pointer"
    }
};

export default PreparationHub;
