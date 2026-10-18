import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { getApiErrorMessage } from "../api/errorMessage";
import QuickAddInterviewModal from "../components/QuickAddInterviewModal";
import InterviewProgressStepper from "../components/InterviewProgressStepper";

function Interviews() {

    const navigate = useNavigate();

    const [interviews, setInterviews] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [searching, setSearching] = useState(false);
    const [showQuickAdd, setShowQuickAdd] = useState(false);


    /* ================================================= */
    /* Initial / Pagination Fetch                         */
    /* ================================================= */

    useEffect(() => {

        if (search.trim() || statusFilter !== "ALL") {
            return;
        }

        fetchInterviews();

    // Search/filter state intentionally selects a different request path.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);


    /* ================================================= */
    /* Search / Filter Fetch                              */
    /* ================================================= */

    useEffect(() => {

        const timer = setTimeout(() => {

            if (search.trim() || statusFilter !== "ALL") {

                searchInterviews();

            }

        }, 350);

        return () => clearTimeout(timer);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, statusFilter]);


    /* ================================================= */
    /* Normal Paginated Interviews                        */
    /* ================================================= */

    async function fetchInterviews(pageToFetch = page) {

        setLoading(true);
        setError("");

        try {

            const response = await api.get("/interviews", {
                params: {
                    page: pageToFetch,
                    size: 5
                }
            });

            setInterviews(response.data.content || []);
            setTotalPages(response.data.totalPages || 0);

        } catch (error) {

            handleApiError(error);

        } finally {

            setLoading(false);

        }
    }


    /* ================================================= */
    /* Search Interviews                                 */
    /* ================================================= */

    async function searchInterviews() {

        setSearching(true);
        setError("");

        try {

            /*
             * Backend search endpoint requires a status.
             *
             * If user selects a specific status,
             * we make one request.
             *
             * If "ALL" is selected, we search each
             * status and combine the results.
             */

            const statuses = [
                "APPLIED",
                "IN_PROGRESS",
                "SELECTED",
                "REJECTED",
                "ON_HOLD"
            ];


            if (statusFilter !== "ALL") {

                const response = await api.get("/interviews/search", {
                    params: {
                        status: statusFilter,
                        keyword: search.trim()
                    }
                });

                setInterviews(response.data || []);
                setTotalPages(0);

            } else {

                const responses = await Promise.all(

                    statuses.map((status) =>
                        api.get("/interviews/search", {
                            params: {
                                status: status,
                                keyword: search.trim()
                            }
                        })
                    )

                );


                const combined = responses.flatMap(
                    (response) => response.data || []
                );


                /*
                 * Remove duplicate interviews
                 */

                const uniqueInterviews = Array.from(
                    new Map(
                        combined.map((interview) => [
                            interview.id,
                            interview
                        ])
                    ).values()
                );


                setInterviews(uniqueInterviews);
                setTotalPages(0);

            }

        } catch (error) {

            handleApiError(error);

        } finally {

            setSearching(false);
            setLoading(false);

        }
    }


    /* ================================================= */
    /* API Error Handler                                  */
    /* ================================================= */

    const handleApiError = (error) => {

        setError(getApiErrorMessage(error, "Unable to load interviews."));

    };


    /* ================================================= */
    /* Clear Filters                                      */
    /* ================================================= */

    const clearFilters = () => {

        setSearch("");
        setStatusFilter("ALL");
        setPage(0);
        setError("");

    };

    const handleInterviewCreated = async () => {
        setShowQuickAdd(false);
        setPage(0);

        if (search.trim() || statusFilter !== "ALL") {
            await searchInterviews();
        } else {
            await fetchInterviews(0);
        }
    };

    const handleInterviewUpdated = (updatedInterview) => {
        setInterviews((current) => current.map((interview) =>
            interview.id === updatedInterview.id ? updatedInterview : interview
        ));
    };


    /* ================================================= */
    /* Date Formatter                                     */
    /* ================================================= */

    const formatDate = (date) => {

        if (!date) {
            return "Date not specified";
        }

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

    };


    /* ================================================= */
    /* Status Formatter                                   */
    /* ================================================= */

    const formatStatus = (status) => {

        if (!status) {
            return "Unknown";
        }

        return status
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(/\b\w/g, (letter) =>
                letter.toUpperCase()
            );

    };


    /* ================================================= */
    /* Status Style                                       */
    /* ================================================= */

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


    /* ================================================= */
    /* Loading                                            */
    /* ================================================= */

    if (loading && !searching) {

        return (

            <div style={styles.page}>

                <div style={styles.header}>

                    <div>

                        <h1 style={styles.title}>
                            Interviews
                        </h1>

                        <p style={styles.subtitle}>
                            Track and manage your interview applications.
                        </p>

                    </div>

                </div>


                <div style={styles.loadingContainer}>

                    <div style={styles.spinner}></div>

                    <p style={styles.loadingText}>
                        Loading interviews...
                    </p>

                </div>

            </div>

        );

    }


    return (

        <div style={styles.page}>


            {/* ================================================= */}
            {/* Header                                             */}
            {/* ================================================= */}

            <div style={styles.header}>

                <div>

                    <h1 style={styles.title}>
                        Interviews
                    </h1>

                    <p style={styles.subtitle}>
                        Track and manage your interview applications.
                    </p>

                </div>


                <button
                    style={styles.addButton}
                    onClick={() => setShowQuickAdd(true)}
                >

                    <span style={styles.plus}>
                        +
                    </span>

                    Add Interview

                </button>

            </div>


            {/* ================================================= */}
            {/* Search + Filter                                    */}
            {/* ================================================= */}

            <div style={styles.toolbar}>


                {/* Search */}

                <div style={styles.searchBox}>

                    <span style={styles.searchIcon}>
                        🔍
                    </span>


                    <input
                        type="text"
                        placeholder="Search by company or role..."
                        value={search}
                        onChange={(e) => {

                            setSearch(e.target.value);
                            setPage(0);

                        }}
                        style={styles.searchInput}
                    />


                    {search && (

                        <button
                            style={styles.clearButton}
                            onClick={() =>
                                setSearch("")
                            }
                        >
                            ×
                        </button>

                    )}

                </div>


                {/* Status */}

                <select
                    value={statusFilter}
                    onChange={(e) => {

                        setStatusFilter(e.target.value);
                        setPage(0);

                    }}
                    style={styles.filter}
                >

                    <option value="ALL">
                        All Status
                    </option>

                    <option value="APPLIED">
                        Applied
                    </option>

                    <option value="IN_PROGRESS">
                        In Progress
                    </option>

                    <option value="SELECTED">
                        Selected
                    </option>

                    <option value="REJECTED">
                        Rejected
                    </option>

                    <option value="ON_HOLD">
                        On Hold
                    </option>

                </select>

            </div>


            {/* ================================================= */}
            {/* Search Loading                                     */}
            {/* ================================================= */}

            {searching && (

                <div style={styles.searchLoading}>
                    Searching interviews...
                </div>

            )}


            {/* ================================================= */}
            {/* Error                                              */}
            {/* ================================================= */}

            {error && (

                <div style={styles.error}>

                    <div>

                        <strong>
                            Something went wrong
                        </strong>

                        <p style={styles.errorText}>
                            {error}
                        </p>

                    </div>


                    <button
                        style={styles.retryButton}
                        onClick={() => {

                            if (
                                search.trim() ||
                                statusFilter !== "ALL"
                            ) {

                                searchInterviews();

                            } else {

                                fetchInterviews();

                            }

                        }}
                    >
                        Retry
                    </button>

                </div>

            )}


            {/* ================================================= */}
            {/* Results Info                                       */}
            {/* ================================================= */}

            {!error && (

                <div style={styles.resultsInfo}>

                    <span>

                        Showing{" "}

                        <strong>
                            {interviews.length}
                        </strong>{" "}

                        interview
                        {interviews.length !== 1
                            ? "s"
                            : ""}

                    </span>


                    {(search || statusFilter !== "ALL") && (

                        <button
                            style={styles.resetButton}
                            onClick={clearFilters}
                        >
                            Clear filters
                        </button>

                    )}

                </div>

            )}


            {/* ================================================= */}
            {/* Empty State                                        */}
            {/* ================================================= */}

            {!error && interviews.length === 0 && !searching && (

                <div style={styles.empty}>

                    <div style={styles.emptyIcon}>
                        💼
                    </div>


                    <h2 style={styles.emptyTitle}>

                        {search || statusFilter !== "ALL"
                            ? "No matching interviews"
                            : "No interviews yet"}

                    </h2>


                    <p style={styles.emptyText}>

                        {search || statusFilter !== "ALL"
                            ? "Try changing your search or status filter."
                            : "Add your first interview to start tracking your interview journey."}

                    </p>


                    {search || statusFilter !== "ALL" ? (

                        <button
                            style={styles.secondaryButton}
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </button>

                    ) : (

                        <button
                            style={styles.addButton}
                            onClick={() => setShowQuickAdd(true)}
                        >

                            <span style={styles.plus}>
                                +
                            </span>

                            Add Interview

                        </button>

                    )}

                </div>

            )}


            {/* ================================================= */}
            {/* Interview List                                     */}
            {/* ================================================= */}

            {!error && interviews.length > 0 && (

                <div style={styles.list}>

                    {interviews.map((interview) => (

                        <div
                            key={interview.id}
                            style={styles.card}
                            onClick={() =>
                                navigate(
                                    `/interviews/${interview.id}`
                                )
                            }
                        >


                            {/* Left */}

                            <div style={styles.cardLeft}>


                                <div style={styles.companyIcon}>

                                    {interview.companyName
                                        ? interview.companyName
                                            .charAt(0)
                                            .toUpperCase()
                                        : "I"}

                                </div>


                                <div style={styles.companyInfo}>

                                    <h3 style={styles.company}>
                                        {interview.companyName}
                                    </h3>


                                    <p style={styles.interviewRole}>
                                        {interview.role}
                                    </p>


                                    <div style={styles.meta}>

                                        <span>

                                            Applied{" "}

                                            {formatDate(
                                                interview.applicationDate
                                            )}

                                        </span>


                                        {interview.currentRound && (

                                            <>

                                                <span
                                                    style={styles.dot}
                                                >
                                                    •
                                                </span>


                                                <span>
                                                    {interview.currentRound}
                                                </span>

                                            </>

                                        )}

                                    </div>

                                </div>

                            </div>


                            {/* Right */}

                            <div style={styles.cardRight}>


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


                                <button
                                    style={styles.viewButton}
                                    onClick={(e) => {

                                        e.stopPropagation();

                                        navigate(
                                            `/interviews/${interview.id}`
                                        );

                                    }}
                                >

                                    View

                                    <span>
                                        →
                                    </span>

                                </button>

                            </div>

                            <div style={styles.cardProgress}>
                                <InterviewProgressStepper
                                    interview={interview}
                                    onUpdated={handleInterviewUpdated}
                                />
                            </div>

                        </div>

                    ))}

                </div>

            )}


            {/* ================================================= */}
            {/* Pagination                                         */}
            {/* ================================================= */}

            {!error &&
                !search &&
                statusFilter === "ALL" &&
                totalPages > 1 && (

                    <div style={styles.pagination}>


                        <button
                            style={{
                                ...styles.pageButton,
                                ...(page === 0
                                    ? styles.disabledButton
                                    : {})
                            }}
                            disabled={page === 0}
                            onClick={() =>
                                setPage(page - 1)
                            }
                        >
                            ← Previous
                        </button>


                        <div style={styles.pageNumbers}>

                            {Array.from(
                                {
                                    length: totalPages
                                },
                                (_, index) => index
                            ).map((pageNumber) => (

                                <button
                                    key={pageNumber}
                                    style={{
                                        ...styles.numberButton,
                                        ...(page === pageNumber
                                            ? styles.activePage
                                            : {})
                                    }}
                                    onClick={() =>
                                        setPage(pageNumber)
                                    }
                                >
                                    {pageNumber + 1}
                                </button>

                            ))}

                        </div>


                        <button
                            style={{
                                ...styles.pageButton,
                                ...(page >= totalPages - 1
                                    ? styles.disabledButton
                                    : {})
                            }}
                            disabled={
                                page >= totalPages - 1
                            }
                            onClick={() =>
                                setPage(page + 1)
                            }
                        >
                            Next →
                        </button>

                    </div>

                )}

            <QuickAddInterviewModal
                open={showQuickAdd}
                onClose={() => setShowQuickAdd(false)}
                onCreated={handleInterviewCreated}
            />

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


    addButton: {
        display: "flex",
        alignItems: "center",
        gap: "7px",
        border: "none",
        borderRadius: "10px",
        padding: "12px 18px",
        background: "#4f46e5",
        color: "#ffffff",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(79,70,229,0.18)"
    },


    plus: {
        fontSize: "18px",
        lineHeight: 1
    },


    toolbar: {
        display: "flex",
        gap: "12px",
        marginBottom: "18px"
    },

    interviewRole: {
        color: "#6b7280",
        fontSize: "13px",
    },

    searchBox: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "0 15px",
        height: "48px"
    },


    searchIcon: {
        fontSize: "15px"
    },


    searchInput: {
        border: "none",
        outline: "none",
        width: "100%",
        fontSize: "14px",
        background: "transparent",
        color: "#111827"
    },


    clearButton: {
        border: "none",
        background: "transparent",
        color: "#9ca3af",
        fontSize: "20px",
        cursor: "pointer",
        lineHeight: 1
    },


    filter: {
        width: "150px",
        height: "48px",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        background: "#ffffff",
        padding: "0 12px",
        color: "#374151",
        fontSize: "14px",
        outline: "none",
        cursor: "pointer"
    },


    searchLoading: {
        color: "#6b7280",
        fontSize: "13px",
        marginBottom: "12px"
    },


    resultsInfo: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px",
        color: "#9ca3af",
        fontSize: "13px"
    },


    resetButton: {
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
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) auto",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "20px 22px",
        cursor: "pointer",
        transition:
            "box-shadow 0.2s ease, transform 0.2s ease"
    },


    cardProgress: {
        gridColumn: "1 / -1",
        minWidth: 0,
        borderTop: "1px solid #f1f5f9"
    },


    cardLeft: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
        minWidth: 0
    },


    companyIcon: {
        width: "48px",
        height: "48px",
        flexShrink: 0,
        borderRadius: "13px",
        background: "#f1efff",
        color: "#4f46e5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "700",
        fontSize: "18px"
    },


    companyInfo: {
        minWidth: 0
    },


    company: {
        margin: 0,
        fontSize: "16px",
        fontWeight: "600",
        color: "#111827"
    },


    role: {
        margin: "5px 0 0",
        color: "#4b5563",
        fontSize: "14px"
    },


    meta: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginTop: "7px",
        color: "#9ca3af",
        fontSize: "12px"
    },


    dot: {
        color: "#d1d5db"
    },


    cardRight: {
        display: "flex",
        alignItems: "center",
        gap: "22px",
        flexShrink: 0
    },


    status: {
        padding: "6px 11px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: "600"
    },


    statusApplied: {
        background: "#eef2ff",
        color: "#4338ca"
    },


    statusInProgress: {
        background: "#eff6ff",
        color: "#2563eb"
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


    viewButton: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        border: "none",
        background: "transparent",
        color: "#4f46e5",
        fontWeight: "600",
        cursor: "pointer",
        fontSize: "14px"
    },


    error: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#fef2f2",
        color: "#991b1b",
        border: "1px solid #fecaca",
        borderRadius: "12px",
        padding: "16px 18px",
        marginBottom: "20px"
    },


    errorText: {
        margin: "5px 0 0",
        fontSize: "13px"
    },


    retryButton: {
        border: "1px solid #fecaca",
        background: "#ffffff",
        color: "#b91c1c",
        borderRadius: "8px",
        padding: "8px 13px",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer"
    },


    empty: {
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "65px 30px",
        textAlign: "center"
    },


    emptyIcon: {
        width: "56px",
        height: "56px",
        margin: "0 auto 18px",
        borderRadius: "16px",
        background: "#f1efff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "24px"
    },


    emptyTitle: {
        margin: 0,
        fontSize: "20px",
        fontWeight: "600"
    },


    emptyText: {
        maxWidth: "420px",
        margin: "10px auto 24px",
        color: "#6b7280",
        fontSize: "14px",
        lineHeight: "1.6"
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


    pagination: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "12px",
        marginTop: "28px"
    },


    pageButton: {
        border: "1px solid #e5e7eb",
        background: "#ffffff",
        color: "#374151",
        borderRadius: "9px",
        padding: "9px 14px",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: "500"
    },


    disabledButton: {
        opacity: 0.45,
        cursor: "not-allowed"
    },


    pageNumbers: {
        display: "flex",
        gap: "5px"
    },


    numberButton: {
        width: "34px",
        height: "34px",
        border: "1px solid #e5e7eb",
        background: "#ffffff",
        color: "#4b5563",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "13px"
    },


    activePage: {
        background: "#4f46e5",
        color: "#ffffff",
        borderColor: "#4f46e5"
    },


    loadingContainer: {
        minHeight: "420px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px"
    },


    spinner: {
        width: "28px",
        height: "28px",
        border: "3px solid #e5e7eb",
        borderTop: "3px solid #4f46e5",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite"
    },


    loadingText: {
        marginTop: "14px",
        color: "#6b7280",
        fontSize: "14px"
    }

};


export default Interviews;
