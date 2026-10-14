import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Dashboard() {

    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [recentInterviews, setRecentInterviews] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");


    // =========================================================
    // LOAD DASHBOARD
    // =========================================================

    useEffect(() => {

        loadDashboard();

    }, []);


    // =========================================================
    // FETCH DASHBOARD DATA
    // =========================================================

    const loadDashboard = async () => {

        try {

            setLoading(true);
            setError("");

            const [
                dashboardResponse,
                interviewsResponse
            ] = await Promise.all([

                api.get("/dashboard"),

                api.get("/interviews", {
                    params: {
                        page: 0,
                        size: 5
                    }
                })

            ]);


            console.log(
                "Dashboard data:",
                dashboardResponse.data
            );

            console.log(
                "Recent interviews:",
                interviewsResponse.data
            );


            setDashboard(
                dashboardResponse.data
            );


            setRecentInterviews(
                interviewsResponse.data?.content || []
            );


        } catch (error) {

            console.error(
                "Dashboard API error:",
                error
            );


            if (error.response?.status === 401) {

                setError(
                    "Your session has expired. Please login again."
                );

            } else if (error.response?.status === 403) {

                setError(
                    "You do not have permission to view the dashboard."
                );

            } else {

                setError(
                    "Unable to load dashboard. Please try again."
                );

            }

        } finally {

            setLoading(false);

        }

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


    return (

        <div style={styles.page}>


            {/* =================================================
                HEADER
            ================================================= */}

            <div style={styles.header}>

                <div>

                    <h1 style={styles.title}>
                        Dashboard
                    </h1>

                    <p style={styles.subtitle}>
                        Track and manage your interview journey.
                    </p>

                </div>


                {/* SEARCH */}

                <div style={styles.searchBox}>

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

            <div style={styles.welcome}>

                <div>

                    <h2 style={styles.welcomeTitle}>
                        Welcome to InterviewIQ 👋
                    </h2>

                    <p style={styles.welcomeText}>
                        Keep track of your applications,
                        interviews, questions, and progress
                        in one place.
                    </p>

                </div>


                <button
                    style={styles.welcomeButton}
                    onClick={() =>
                        navigate("/interviews")
                    }
                >
                    View Interviews →
                </button>

            </div>


            {/* =================================================
                STAT CARDS
            ================================================= */}

            <div style={styles.stats}>


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
                MAIN GRID
            ================================================= */}

            <div style={styles.mainGrid}>


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
                            onClick={() =>
                                navigate(
                                    "/interviews/new"
                                )
                            }
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
                            🔍
                        </div>

                        <p>
                            No interviews found.
                        </p>

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

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>

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
                         value,
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
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "16px 0",
        borderBottom:
            "1px solid #f0f1f4",
        cursor: "pointer"
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