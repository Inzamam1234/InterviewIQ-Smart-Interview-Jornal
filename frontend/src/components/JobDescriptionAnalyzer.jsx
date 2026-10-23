function JobDescriptionAnalyzer({
    profile,
    role,
    loading,
    saving,
    error,
    jobDescription,
    onJobDescriptionChange,
    onAnalyze
}) {
    const hasAnalysis = Boolean(profile?.jobDescription);
    const skills = profile?.extractedSkills || [];
    const focusAreas = profile?.focusAreas || [];
    const suggestedQuestions = profile?.suggestedQuestions || [];

    return (
        <section style={styles.card} aria-labelledby="role-analyzer-title">
            <div style={styles.header}>
                <div>
                    <div style={styles.eyebrow}>ROLE ANALYZER</div>
                    <h2 id="role-analyzer-title" style={styles.title}>
                        {hasAnalysis ? "Your role analysis" : "Analyze this role"}
                    </h2>
                    <p style={styles.description}>
                        Paste the job description to get focused preparation topics and practice questions for this {role || "role"}.
                    </p>
                </div>
                {profile?.analyzedAt && (
                    <span style={styles.analyzedBadge}>
                        Analyzed {formatDate(profile.analyzedAt)}
                    </span>
                )}
            </div>

            <form onSubmit={onAnalyze}>
                <label htmlFor="job-description" style={styles.label}>
                    Job description
                </label>
                <textarea
                    id="job-description"
                    value={jobDescription}
                    onChange={(event) => onJobDescriptionChange(event.target.value)}
                    placeholder="Paste the responsibilities, requirements, and qualifications here..."
                    maxLength={20000}
                    rows={hasAnalysis ? 5 : 8}
                    style={styles.textarea}
                    disabled={saving}
                />
                <div style={styles.formFooter}>
                    <span style={styles.characterCount}>
                        {jobDescription.length.toLocaleString()}/20,000 characters
                    </span>
                    <button
                        type="submit"
                        style={styles.primaryButton}
                        disabled={saving || !jobDescription.trim()}
                    >
                        {saving
                            ? "Analyzing..."
                            : hasAnalysis
                                ? "Update analysis"
                                : "Analyze role"}
                    </button>
                </div>
            </form>

            {error && <p style={styles.error}>{error}</p>}

            {loading && <p style={styles.loading}>Loading saved role analysis...</p>}

            {!loading && hasAnalysis && (
                <div style={styles.results}>
                    <div style={styles.resultSection}>
                        <h3 style={styles.resultTitle}>Skills detected</h3>
                        {skills.length > 0 ? (
                            <div style={styles.skillList}>
                                {skills.map((skill) => (
                                    <span key={skill} style={styles.skillBadge}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p style={styles.mutedText}>
                                No catalogued skills were detected. Review the description and add your own preparation topics to the checklist.
                            </p>
                        )}
                    </div>

                    <div style={styles.resultGrid}>
                        <div style={styles.resultSection}>
                            <h3 style={styles.resultTitle}>Focus areas</h3>
                            <ol style={styles.list}>
                                {focusAreas.map((area) => (
                                    <li key={area} style={styles.listItem}>{area}</li>
                                ))}
                            </ol>
                        </div>
                        <div style={styles.resultSection}>
                            <h3 style={styles.resultTitle}>Practice prompts</h3>
                            <ul style={styles.list}>
                                {suggestedQuestions.map((question) => (
                                    <li key={question} style={styles.listItem}>{question}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

function formatDate(value) {
    return new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric"
    });
}

const styles = {
    card: {
        background: "linear-gradient(135deg, #fffdf8 0%, #ffffff 72%)",
        border: "1px solid #fde68a",
        borderRadius: "16px",
        padding: "28px",
        marginBottom: "20px",
        boxShadow: "0 8px 24px rgba(245, 158, 11, 0.06)"
    },
    header: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "16px",
        marginBottom: "20px"
    },
    eyebrow: {
        color: "#b45309",
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
        maxWidth: "700px",
        margin: "7px 0 0",
        color: "#6b7280",
        fontSize: "13px",
        lineHeight: "1.5"
    },
    analyzedBadge: {
        flexShrink: 0,
        padding: "7px 10px",
        borderRadius: "999px",
        background: "#fffbeb",
        color: "#92400e",
        fontSize: "12px",
        fontWeight: "700"
    },
    label: {
        display: "block",
        marginBottom: "7px",
        color: "#374151",
        fontSize: "13px",
        fontWeight: "700"
    },
    textarea: {
        width: "100%",
        boxSizing: "border-box",
        padding: "12px",
        border: "1px solid #fcd34d",
        borderRadius: "10px",
        background: "#ffffff",
        color: "#111827",
        fontFamily: "inherit",
        fontSize: "14px",
        lineHeight: "1.6",
        resize: "vertical",
        outline: "none"
    },
    formFooter: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        marginTop: "10px"
    },
    characterCount: {
        color: "#9ca3af",
        fontSize: "11px"
    },
    primaryButton: {
        padding: "10px 16px",
        border: "none",
        borderRadius: "9px",
        background: "#d97706",
        color: "#ffffff",
        fontSize: "13px",
        fontWeight: "700",
        cursor: "pointer"
    },
    error: {
        margin: "14px 0 0",
        padding: "11px 13px",
        borderRadius: "9px",
        background: "#fef2f2",
        color: "#dc2626",
        fontSize: "13px"
    },
    loading: {
        margin: "20px 0 0",
        color: "#6b7280",
        fontSize: "13px"
    },
    results: {
        marginTop: "24px",
        paddingTop: "22px",
        borderTop: "1px solid #fde68a"
    },
    resultGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "22px",
        marginTop: "22px"
    },
    resultSection: {
        minWidth: 0
    },
    resultTitle: {
        margin: "0 0 11px",
        color: "#374151",
        fontSize: "13px",
        fontWeight: "800"
    },
    skillList: {
        display: "flex",
        flexWrap: "wrap",
        gap: "8px"
    },
    skillBadge: {
        padding: "6px 10px",
        borderRadius: "999px",
        background: "#fef3c7",
        color: "#92400e",
        fontSize: "12px",
        fontWeight: "700"
    },
    list: {
        display: "flex",
        flexDirection: "column",
        gap: "9px",
        margin: 0,
        paddingLeft: "20px",
        color: "#4b5563",
        fontSize: "13px",
        lineHeight: "1.5"
    },
    listItem: {
        paddingLeft: "3px"
    },
    mutedText: {
        margin: 0,
        color: "#6b7280",
        fontSize: "13px",
        lineHeight: "1.5"
    }
};

export default JobDescriptionAnalyzer;
