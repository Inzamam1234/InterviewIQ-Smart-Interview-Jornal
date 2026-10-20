import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { getApiErrorMessage } from "../api/errorMessage";
import QuickAddInterviewModal from "../components/QuickAddInterviewModal";
import InterviewProgressStepper from "../components/InterviewProgressStepper";

function Dashboard() {

    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [recentInterviews, setRecentInterviews] = useState([]);
    const [upcomingInterviews, setUpcomingInterviews] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [showQuickAdd, setShowQuickAdd] = useState(false);


    // =========================================================
    // LOAD DASHBOARD
    // =========================================================

    useEffect(() => {

        loadDashboard();

    }, []);


    // =========================================================
    // FETCH DASHBOARD DATA
    // =========================================================

    async function loadDashboard() {

        try {

            setLoading(true);
            setError("");

            const [
                dashboardResponse,
                interviewsResponse,
                upcomingResponse
            ] = await Promise.all([

                api.get("/dashboard"),

                api.get("/interviews", {
                    params: {
                        page: 0,
                        size: 5
                    }
                }),

                api.get("/interviews/upcoming")

            ]);


            setDashboard(
                dashboardResponse.data
            );


            setRecentInterviews(
                interviewsResponse.data?.content || []
            );

            setUpcomingInterviews(upcomingResponse.data || []);


        } catch (error) {

            setError(
                getApiErrorMessage(
                    error,
                    "Unable to load dashboard. Please try again."
                )
            );

        } finally {

            setLoading(false);

        }

    }

    const handleRecentInterviewUpdated = (updatedInterview) => {
        setRecentInterviews((current) => current.map((interview) =>
            interview.id === updatedInterview.id ? updatedInterview : interview
        ));

        setUpcomingInterviews((current) => {
            const isEligible = Boolean(
                updatedInterview.nextRoundDate &&
                !["REJECTED", "SELECTED"].includes(updatedInterview.status)
            );

            const withoutUpdated = current.filter(
                (interview) => interview.id !== updatedInterview.id
            );

            if (!isEligible) {
                return withoutUpdated;
            }

            return [...withoutUpdated, updatedInterview].sort(
                (first, second) =>
                    new Date(first.nextRoundDate) - new Date(second.nextRoundDate)
            );
        });
    };


    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (date) => {

        if (!date) {
            return "—";
        }

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }
        );

    };


    // =========================================================
    // FORMAT STATUS
    // =========================================================

    const formatStatus = (status) => {

        if (!status) {
            return "Unknown";
        }

        return status
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(
                /\b\w/g,
                (letter) =>
                    letter.toUpperCase()
            );

    };


    // =========================================================
    // STATUS STYLE
    // =========================================================

    const getStatusStyle = (status) => {

        switch (status) {

            case "APPLIED":

                return styles.statusApplied;

            case "IN_PROGRESS":

                return styles.statusInProgress;

            case "SELECTED":

                return styles.statusSelected;

            case "REJECTED":

                return styles.statusRejected;

            default:

                return styles.statusDefault;

        }

    };


    // =========================================================
    // SEARCH RECENT INTERVIEWS
    // =========================================================

    const filteredInterviews =
        recentInterviews.filter((interview) => {

            if (!search.trim()) {
                return true;
            }

            const keyword =
                search.toLowerCase();

            return (

                interview.companyName
                    ?.toLowerCase()
                    .includes(keyword)

                ||

                interview.role
                    ?.toLowerCase()
                    .includes(keyword)

                ||

                interview.status
                    ?.toLowerCase()
                    .includes(keyword)

            );

        });


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <div style={styles.page}>

                <div style={styles.loadingContainer}>

                    <div style={styles.spinner}></div>

                    <p style={styles.loadingText}>
                        Loading dashboard...
                    </p>

                </div>

            </div>

        );

    }


    // =========================================================
    // ERROR
    // =========================================================

    if (error || !dashboard) {

        return (

            <div style={styles.page}>

                <div style={styles.errorContainer}>

                    <div style={styles.errorIcon}>
                        ⚠️
                    </div>

                    <h2 style={styles.errorTitle}>
                        Unable to load dashboard
                    </h2>

                    <p style={styles.errorText}>
                        {error || "Something went wrong."}
                    </p>

                    <button
                        style={styles.retryButton}
                        onClick={loadDashboard}
                    >
                        Try Again
                    </button>

                </div>

            </div>

        );

    }


    // =========================================================
    // STAT VALUES
    // =========================================================

    const total =
        dashboard.totalInterviews || 0;

    const applied =
        dashboard.appliedCount || 0;

    const inProgress =
        dashboard.inProgressCount || 0;

    const selected =
        dashboard.selectedCount || 0;

    const rejected =
        dashboard.rejectedCount || 0;


    // =========================================================
    // PERCENTAGE CALCULATOR
    // =========================================================

    const getPercentage = (value) => {

        if (total === 0) {
            return 0;
        }

        return Math.round(
            (value / total) * 100
        );

    };

    const hasSavedDraft = Boolean(
        localStorage.getItem("interviewiq.interviewDraft")
    );

    const getReminderLabel = (date) => {

        const targetDate = new Date(`${String(date).slice(0, 10)}T00:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const difference = Math.round(
            (targetDate - today) / (1000 * 60 * 60 * 24)
        );

        if (difference < 0) {
            const days = Math.abs(difference);
            return `Overdue by ${days} day${days === 1 ? "" : "s"}`;
        }

        if (difference === 0) {
            return "Today";
        }

        if (difference === 1) {
            return "Tomorrow";
        }

        return `In ${difference} days`;
    };


    return (

        <div className="dashboard-page" style={styles.page}>


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="dashboard-header" style={styles.header}>

                <div>

                    <h1 style={styles.title}>
                        Dashboard
                    </h1>

                    <p style={styles.subtitle}>
                        Track and manage your interview journey.
                    </p>

                </div>


                {/* SEARCH */}

                    <div className="dashboard-search" style={styles.searchBox}>

                    <span style={styles.searchIcon}>
                        🔍
                    </span>

                    <input
                        type="text"
                        placeholder="Search interviews..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                        style={styles.searchInput}
                    />

                </div>

            </div>


            {/* =================================================
                WELCOME BANNER
            ================================================= */}

            <div className="dashboard-welcome" style={styles.welcome}>

                <div>

                    <h2 style={styles.welcomeTitle}>
                        Welcome to InterviewIQ 👋
                    </h2>

                    <p style={styles.welcomeText}>
                        {total === 0
                            ? "Start with your first interview and keep your preparation in one place."
                            : "Keep track of your applications, interviews, questions, and progress in one place."}
                    </p>

                </div>


                <button
                    style={styles.welcomeButton}
                    onClick={() => setShowQuickAdd(true)}
                >
                    {total === 0 ? "Add your first interview" : "Add interview"} →
                </button>

            </div>


            {/* =================================================
                FIRST-TIME ONBOARDING
            ================================================= */}

            {total === 0 && (
                <div style={styles.onboardingPanel}>

                    <div style={styles.panelHeader}>
                        <h3 style={styles.panelTitle}>
                            Get started in three steps
                        </h3>

                        <p style={styles.panelSubtitle}>
                            Build a simple habit around every interview.
                        </p>
                    </div>

                    <div className="dashboard-onboarding-grid" style={styles.onboardingGrid}>
                        <OnboardingStep
                            number="1"
                            title="Add an interview"
                            description="Track the company, role, round, and status."
                            onClick={() => setShowQuickAdd(true)}
                        />
                        <OnboardingStep
                            number="2"
                            title="Practice questions"
                            description="Save questions you were asked and review them later."
                            onClick={() => navigate("/questions")}
                        />
                        <OnboardingStep
                            number="3"
                            title="Reflect afterwards"
                            description="Capture lessons learned while they are still fresh."
                            onClick={() => navigate("/journal")}
                        />
                    </div>
                </div>
            )}


            {/* =================================================
                STAT CARDS
            ================================================= */}

            <div className="dashboard-stats" style={styles.stats}>


                {/* TOTAL */}

                <StatCard
                    icon="📊"
                    title="Total Interviews"
                    value={total}
                />


                {/* APPLIED */}

                <StatCard
                    icon="📨"
                    title="Applied"
                    value={applied}
                />


                {/* IN PROGRESS */}

                <StatCard
                    icon="⏳"
                    title="In Progress"
                    value={inProgress}
                />


                {/* SELECTED */}

                <StatCard
                    icon="🎯"
                    title="Selected"
                    value={selected}
                />


                {/* REJECTED */}

                <StatCard
                    icon="❌"
                    title="Rejected"
                    value={rejected}
                />

            </div>


            {/* =================================================
                NEXT ACTIONS
            ================================================= */}

            {(total > 0 || hasSavedDraft) && (
                <div style={styles.nextActionsPanel}>

                    <div style={styles.panelHeader}>
                        <h3 style={styles.panelTitle}>
                            Next actions
                        </h3>

                        <p style={styles.panelSubtitle}>
                            Keep your interview preparation moving forward.
                        </p>
                    </div>

                    <div className="dashboard-next-action-list" style={styles.nextActionList}>
                        {hasSavedDraft && (
                            <NextAction
                                title="Continue your saved draft"
                                description="Pick up where you left off."
                                buttonLabel="Resume draft"
                                onClick={() => navigate("/interviews/new")}
                            />
                        )}

                        {upcomingInterviews.slice(0, 5).map((interview) => (
                            <NextAction
                                key={interview.id}
                                title={`${interview.companyName} · ${interview.role}`}
                                description={`${getReminderLabel(interview.nextRoundDate)} · ${formatDate(interview.nextRoundDate)}`}
                                buttonLabel="View interview"
                                onClick={() => navigate(`/interviews/${interview.id}`)}
                            />
                        ))}

                        {!hasSavedDraft && upcomingInterviews.length === 0 && (
                            <NextAction
                                title="Add your next interview"
                                description="Keep your pipeline and preparation in one place."
                                buttonLabel="Add interview"
                                onClick={() => setShowQuickAdd(true)}
                            />
                        )}
                    </div>
                </div>
            )}


            {/* =================================================
                MAIN GRID
            ================================================= */}

            <div className="dashboard-main-grid" style={styles.mainGrid}>


                {/* =================================================
                    INTERVIEW PROGRESS
                ================================================= */}

                <div style={styles.panel}>

                    <div style={styles.panelHeader}>

                        <div>

                            <h3 style={styles.panelTitle}>
                                Interview Progress
                            </h3>

                            <p style={styles.panelSubtitle}>
                                Overview of your application status
                            </p>

                        </div>

                    </div>


                    <div style={styles.progressList}>


                        {/* APPLIED */}

                        <ProgressRow
                            label="Applied"
                            value={applied}
                            percentage={getPercentage(applied)}
                            progressStyle={
                                styles.progressApplied
                            }
                        />


                        {/* IN PROGRESS */}

                        <ProgressRow
                            label="In Progress"
                            value={inProgress}
                            percentage={
                                getPercentage(
                                    inProgress
                                )
                            }
                            progressStyle={
                                styles.progressInProgress
                            }
                        />


                        {/* SELECTED */}

                        <ProgressRow
                            label="Selected"
                            value={selected}
                            percentage={
                                getPercentage(
                                    selected
                                )
                            }
                            progressStyle={
                                styles.progressSelected
                            }
                        />


                        {/* REJECTED */}

                        <ProgressRow
                            label="Rejected"
                            value={rejected}
                            percentage={
                                getPercentage(
                                    rejected
                                )
                            }
                            progressStyle={
                                styles.progressRejected
                            }
                        />

                    </div>

                </div>


                {/* =================================================
                    QUICK ACTIONS
                ================================================= */}

                <div style={styles.panel}>

                    <div style={styles.panelHeader}>

                        <div>

                            <h3 style={styles.panelTitle}>
                                Quick Actions
                            </h3>

                            <p style={styles.panelSubtitle}>
                                Manage your interview preparation.
                            </p>

                        </div>

                    </div>


                    <div style={styles.actions}>


                        {/* ADD INTERVIEW */}

                        <button
                            style={styles.actionButton}
                            onClick={() => setShowQuickAdd(true)}
                        >

                            <div
                                style={
                                    styles.actionIcon
                                }
                            >
                                +
                            </div>


                            <div
                                style={
                                    styles.actionContent
                                }
                            >

                                <strong
                                    style={
                                        styles.actionTitle
                                    }
                                >
                                    Add Interview
                                </strong>

                                <small
                                    style={
                                        styles.actionDescription
                                    }
                                >
                                    Record a new interview
                                </small>

                            </div>

                        </button>


                        {/* QUESTIONS */}

                        <button
                            style={styles.actionButton}
                            onClick={() =>
                                navigate("/questions")
                            }
                        >

                            <div
                                style={
                                    styles.actionIcon
                                }
                            >
                                ?
                            </div>


                            <div
                                style={
                                    styles.actionContent
                                }
                            >

                                <strong
                                    style={
                                        styles.actionTitle
                                    }
                                >
                                    Practice Questions
                                </strong>

                                <small
                                    style={
                                        styles.actionDescription
                                    }
                                >
                                    Review interview questions
                                </small>

                            </div>

                        </button>


                        {/* JOURNAL */}

                        <button
                            style={styles.actionButton}
                            onClick={() =>
                                navigate("/journal")
                            }
                        >

                            <div
                                style={
                                    styles.actionIcon
                                }
                            >
                                📝
                            </div>


                            <div
                                style={
                                    styles.actionContent
                                }
                            >

                                <strong
                                    style={
                                        styles.actionTitle
                                    }
                                >
                                    Interview Journal
                                </strong>

                                <small
                                    style={
                                        styles.actionDescription
                                    }
                                >
                                    Review your reflections
                                </small>

                            </div>

                        </button>

                    </div>

                </div>

            </div>


            {/* =================================================
                RECENT INTERVIEWS
            ================================================= */}

            <div style={styles.recentPanel}>


                <div style={styles.recentHeader}>

                    <div>

                        <h3 style={styles.panelTitle}>
                            Recent Interviews
                        </h3>

                        <p style={styles.panelSubtitle}>
                            Your latest interview activity.
                        </p>

                    </div>


                    <button
                        style={styles.viewAllButton}
                        onClick={() =>
                            navigate("/interviews")
                        }
                    >
                        View All →
                    </button>

                </div>


                {/* SEARCH RESULT EMPTY */}

                    {filteredInterviews.length === 0 && (

                    <div style={styles.noResults}>

                        <div style={styles.noResultsIcon}>
                            {recentInterviews.length === 0 ? "✦" : "🔍"}
                        </div>

                        <h4 style={styles.emptyStateTitle}>
                            {recentInterviews.length === 0
                                ? "Your interview tracker is ready"
                                : "No matching interviews"}
                        </h4>

                        <p style={styles.emptyStateText}>
                            {recentInterviews.length === 0
                                ? "Add your first application to start tracking rounds, questions, and reflections."
                                : "Try a different company, role, or status."}
                        </p>

                        {recentInterviews.length === 0 ? (
                            <button
                                type="button"
                                style={styles.emptyStateButton}
                                onClick={() => setShowQuickAdd(true)}
                            >
                                Add interview
                            </button>
                        ) : (
                            <button
                                type="button"
                                style={styles.emptyStateButton}
                                onClick={() => setSearch("")}
                            >
                                Clear search
                            </button>
                        )}

                    </div>

                )}


                {/* RECENT INTERVIEW LIST */}

                {filteredInterviews.length > 0 && (

                    <div style={styles.recentList}>

                        {filteredInterviews.map(
                            (interview) => (

                                <div
                                    key={
                                        interview.id
                                    }
                                    style={
                                        styles.recentItem
                                    }
                                    onClick={() =>
                                        navigate(
                                            `/interviews/${interview.id}`
                                        )
                                    }
                                >


                                    {/* COMPANY ICON */}

                                    <div
                                        style={
                                            styles.recentIcon
                                        }
                                    >

                                        {interview.companyName
                                            ? interview
                                                .companyName
                                                .charAt(0)
                                                .toUpperCase()
                                            : "I"}

                                    </div>


                                    {/* COMPANY INFO */}

                                    <div
                                        style={
                                            styles.recentInfo
                                        }
                                    >

                                        <h4
                                            style={
                                                styles.recentCompany
                                            }
                                        >
                                            {
                                                interview.companyName
                                            }
                                        </h4>


                                        <p
                                            style={
                                                styles.recentRole
                                            }
                                        >
                                            {
                                                interview.role
                                            }
                                        </p>

                                    </div>


                                    {/* DATE */}

                                    <div
                                        style={
                                            styles.recentDate
                                        }
                                    >
                                        {formatDate(
                                            interview.applicationDate
                                        )}
                                    </div>


                                    {/* STATUS */}

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

                                    <div style={styles.recentProgress}>
                                        <InterviewProgressStepper
                                            interview={interview}
                                            compact
                                            onUpdated={handleRecentInterviewUpdated}
                                        />
                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>

            <QuickAddInterviewModal
                open={showQuickAdd}
                onClose={() => setShowQuickAdd(false)}
                onCreated={loadDashboard}
            />

        </div>

    );

}


// =========================================================
// STAT CARD
// =========================================================

function StatCard({
                      icon,
                      title,
                      value
                  }) {

    return (

        <div style={styles.statCard}>

            <div style={styles.statTop}>

                <span style={styles.statIcon}>
                    {icon}
                </span>

                <span style={styles.statTitle}>
                    {title}
                </span>

            </div>


            <h2 style={styles.statValue}>
                {value}
            </h2>

        </div>

    );

}


// =========================================================
// PROGRESS ROW
// =========================================================

function ProgressRow({
                         label,
                         percentage,
                         progressStyle
                     }) {

    return (

        <div style={styles.progressRow}>

            <div style={styles.progressLabel}>

                <span>
                    {label}
                </span>

                <span>
                    {percentage}%
                </span>

            </div>


            <div style={styles.progressTrack}>

                <div
                    style={{
                        ...styles.progressBar,
                        ...progressStyle,
                        width: `${percentage}%`
                    }}
                ></div>

            </div>

        </div>

    );

}


function OnboardingStep({ number, title, description, onClick }) {

    return (
        <button
            type="button"
            style={styles.onboardingStep}
            onClick={onClick}
        >
            <span style={styles.stepNumber}>{number}</span>
            <span style={styles.onboardingContent}>
                <strong style={styles.onboardingTitle}>{title}</strong>
                <span style={styles.onboardingDescription}>{description}</span>
            </span>
            <span style={styles.stepArrow}>→</span>
        </button>
    );
}


function NextAction({ title, description, buttonLabel, onClick }) {

    return (
        <div style={styles.nextActionItem}>
            <div style={styles.nextActionText}>
                <strong style={styles.nextActionTitle}>{title}</strong>
                <span style={styles.nextActionDescription}>{description}</span>
            </div>
            <button
                type="button"
                style={styles.nextActionButton}
                onClick={onClick}
            >
                {buttonLabel}
            </button>
        </div>
    );
}


// =========================================================
// STYLES
// =========================================================

const styles = {

    page: {
        minHeight: "100vh",
        padding: "36px 40px 60px",
        background: "#f8f9fc",
        fontFamily:
            "Inter, system-ui, sans-serif",
        color: "#111827"
    },


    // =======================================================
    // HEADER
    // =======================================================

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
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


    searchBox: {
        width: "250px",
        height: "46px",
        display: "flex",
        alignItems: "center",
        gap: "9px",
        padding: "0 14px",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "11px"
    },


    searchIcon: {
        fontSize: "15px"
    },


    searchInput: {
        border: "none",
        outline: "none",
        width: "100%",
        fontSize: "14px",
        color: "#111827",
        background: "transparent"
    },


    // =======================================================
    // WELCOME
    // =======================================================

    welcome: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "30px 32px",
        marginBottom: "24px",
        borderRadius: "18px",
        background:
            "linear-gradient(135deg, #5b55ee, #5046e5)",
        color: "#ffffff",
        boxShadow:
            "0 8px 25px rgba(79,70,229,0.15)"
    },


    welcomeTitle: {
        margin: 0,
        fontSize: "23px",
        fontWeight: "600"
    },


    welcomeText: {
        margin: "8px 0 0",
        fontSize: "14px",
        color: "#e0e7ff"
    },


    welcomeButton: {
        border: "none",
        borderRadius: "10px",
        padding: "13px 18px",
        background: "#ffffff",
        color: "#4f46e5",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer"
    },


    onboardingPanel: {
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "26px",
        marginBottom: "24px"
    },


    onboardingGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "12px"
    },


    onboardingStep: {
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        width: "100%",
        minHeight: "120px",
        padding: "16px",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        background: "#ffffff",
        color: "#111827",
        textAlign: "left",
        cursor: "pointer",
        transition: "border-color 0.2s ease, background 0.2s ease"
    },


    stepNumber: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "28px",
        height: "28px",
        flexShrink: 0,
        borderRadius: "999px",
        background: "#ede9fe",
        color: "#6d28d9",
        fontSize: "13px",
        fontWeight: "700"
    },


    onboardingContent: {
        display: "flex",
        flex: 1,
        flexDirection: "column",
        gap: "6px"
    },


    onboardingTitle: {
        fontSize: "14px",
        fontWeight: "700"
    },


    onboardingDescription: {
        color: "#6b7280",
        fontSize: "12px",
        lineHeight: "1.45"
    },


    stepArrow: {
        color: "#7c3aed",
        fontSize: "16px",
        fontWeight: "700"
    },


    nextActionsPanel: {
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "26px",
        marginBottom: "24px"
    },


    nextActionList: {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "12px"
    },


    nextActionItem: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        padding: "16px",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        background: "#fafafa"
    },


    nextActionText: {
        display: "flex",
        minWidth: 0,
        flexDirection: "column",
        gap: "5px"
    },


    nextActionTitle: {
        overflow: "hidden",
        color: "#111827",
        fontSize: "14px",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
    },


    nextActionDescription: {
        color: "#6b7280",
        fontSize: "12px"
    },


    nextActionButton: {
        flexShrink: 0,
        border: "none",
        borderRadius: "8px",
        padding: "9px 12px",
        background: "#ede9fe",
        color: "#6d28d9",
        fontSize: "12px",
        fontWeight: "700",
        cursor: "pointer"
    },


    emptyStateTitle: {
        margin: "0 0 7px",
        color: "#111827",
        fontSize: "16px",
        fontWeight: "700"
    },


    emptyStateText: {
        maxWidth: "440px",
        margin: "0 auto 16px",
        color: "#6b7280",
        fontSize: "13px",
        lineHeight: "1.5"
    },


    emptyStateButton: {
        border: "none",
        borderRadius: "9px",
        padding: "10px 16px",
        background: "#4f46e5",
        color: "#ffffff",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer"
    },


    // =======================================================
    // STAT CARDS
    // =======================================================

    stats: {
        display: "grid",
        gridTemplateColumns:
            "repeat(5, minmax(0, 1fr))",
        gap: "18px",
        marginBottom: "24px"
    },


    statCard: {
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "20px"
    },


    statTop: {
        display: "flex",
        alignItems: "center",
        gap: "8px"
    },


    statIcon: {
        fontSize: "17px"
    },


    statTitle: {
        color: "#6b7280",
        fontSize: "13px",
        fontWeight: "600"
    },


    statValue: {
        margin: "13px 0 0",
        fontSize: "30px",
        fontWeight: "700"
    },


    // =======================================================
    // MAIN GRID
    // =======================================================

    mainGrid: {
        display: "grid",
        gridTemplateColumns:
            "1fr 1fr",
        gap: "20px",
        marginBottom: "24px"
    },


    panel: {
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "26px"
    },


    panelHeader: {
        marginBottom: "24px"
    },


    panelTitle: {
        margin: 0,
        fontSize: "19px",
        fontWeight: "700"
    },


    panelSubtitle: {
        margin: "6px 0 0",
        color: "#6b7280",
        fontSize: "13px"
    },


    // =======================================================
    // PROGRESS
    // =======================================================

    progressList: {
        display: "flex",
        flexDirection: "column",
        gap: "20px"
    },


    progressRow: {
        width: "100%"
    },


    progressLabel: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "8px",
        fontSize: "13px",
        fontWeight: "600",
        color: "#374151"
    },


    progressTrack: {
        width: "100%",
        height: "8px",
        background: "#f1f2f5",
        borderRadius: "999px",
        overflow: "hidden"
    },


    progressBar: {
        height: "100%",
        borderRadius: "999px",
        transition: "width 0.3s ease"
    },


    progressApplied: {
        background: "#6366f1"
    },


    progressInProgress: {
        background: "#f59e0b"
    },


    progressSelected: {
        background: "#10b981"
    },


    progressRejected: {
        background: "#ef4444"
    },


    // =======================================================
    // QUICK ACTIONS
    // =======================================================

    actions: {
        display: "flex",
        flexDirection: "column",
        gap: "11px"
    },


    actionButton: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        textAlign: "left",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "14px",
        background: "#ffffff",
        cursor: "pointer"
    },


    actionIcon: {
        width: "40px",
        height: "40px",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "11px",
        background: "#eef2ff",
        color: "#4f46e5",
        fontSize: "22px",
        fontWeight: "600"
    },


    actionContent: {
        display: "flex",
        flexDirection: "column",
        gap: "4px"
    },


    actionTitle: {
        fontSize: "14px",
        fontWeight: "700",
        color: "#111827"
    },


    actionDescription: {
        fontSize: "12px",
        fontWeight: "400",
        color: "#6b7280"
    },


    // =======================================================
    // RECENT INTERVIEWS
    // =======================================================

    recentPanel: {
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "28px"
    },


    recentHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "22px"
    },


    viewAllButton: {
        border: "none",
        background: "transparent",
        color: "#4f46e5",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer"
    },


    recentList: {
        display: "flex",
        flexDirection: "column"
    },


    recentItem: {
        display: "grid",
        gridTemplateColumns: "auto minmax(0, 1fr) auto auto",
        alignItems: "center",
        gap: "16px",
        padding: "16px 0",
        borderBottom:
            "1px solid #f0f1f4",
        cursor: "pointer"
    },


    recentProgress: {
        gridColumn: "1 / -1",
        minWidth: 0
    },


    recentIcon: {
        width: "42px",
        height: "42px",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "11px",
        background: "#eef2ff",
        color: "#4f46e5",
        fontSize: "16px",
        fontWeight: "700"
    },


    recentInfo: {
        flex: 1,
        minWidth: 0
    },


    recentCompany: {
        margin: 0,
        fontSize: "15px",
        fontWeight: "700",
        color: "#111827"
    },


    recentRole: {
        margin: "5px 0 0",
        fontSize: "13px",
        color: "#4b5563"
    },


    recentDate: {
        minWidth: "95px",
        color: "#6b7280",
        fontSize: "12px",
        textAlign: "right"
    },


    // =======================================================
    // STATUS
    // =======================================================

    status: {
        padding: "7px 12px",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: "600",
        whiteSpace: "nowrap"
    },


    statusApplied: {
        background: "#eef2ff",
        color: "#4338ca"
    },


    statusInProgress: {
        background: "#fff7ed",
        color: "#c2410c"
    },


    statusSelected: {
        background: "#ecfdf5",
        color: "#047857"
    },


    statusRejected: {
        background: "#fef2f2",
        color: "#b91c1c"
    },


    statusDefault: {
        background: "#f3f4f6",
        color: "#4b5563"
    },


    // =======================================================
    // NO RESULTS
    // =======================================================

    noResults: {
        padding: "45px 20px",
        textAlign: "center",
        color: "#6b7280"
    },


    noResultsIcon: {
        fontSize: "25px",
        marginBottom: "8px"
    },


    // =======================================================
    // LOADING
    // =======================================================

    loadingContainer: {
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    },


    spinner: {
        width: "30px",
        height: "30px",
        border: "3px solid #e5e7eb",
        borderTop:
            "3px solid #4f46e5",
        borderRadius: "50%",
        animation:
            "spin 0.8s linear infinite"
    },


    loadingText: {
        marginTop: "14px",
        color: "#6b7280",
        fontSize: "14px"
    },


    // =======================================================
    // ERROR
    // =======================================================

    errorContainer: {
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center"
    },


    errorIcon: {
        fontSize: "36px",
        marginBottom: "12px"
    },


    errorTitle: {
        margin: 0,
        fontSize: "20px"
    },


    errorText: {
        maxWidth: "420px",
        margin:
            "8px 0 20px",
        color: "#6b7280",
        fontSize: "14px"
    },


    retryButton: {
        border: "none",
        borderRadius: "9px",
        padding: "10px 18px",
        background: "#4f46e5",
        color: "#ffffff",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer"
    }

};


export default Dashboard;
