import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import api from "../api/axios";

function EditInterview() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        companyName: "",
        role: "",
        applicationDate: "",
        currentRound: "",
        nextRoundDate: "",
        overallFeedback: "",
        status: "APPLIED"
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");


    /* -------------------------------- */
    /* Load existing interview          */
    /* -------------------------------- */

    useEffect(() => {

        const fetchInterview = async () => {

            try {

                const response =
                    await api.get(`/interviews/${id}`);

                const interview = response.data;

                setForm({
                    companyName:
                        interview.companyName || "",

                    role:
                        interview.role || "",

                    applicationDate:
                        interview.applicationDate || "",

                    currentRound:
                        interview.currentRound || "",

                    nextRoundDate:
                        interview.nextRoundDate || "",

                    overallFeedback:
                        interview.overallFeedback || "",

                    status:
                        interview.status || "APPLIED"
                });

            } catch (error) {

                console.error(
                    "Failed to load interview:",
                    error
                );

                if (error.response?.status === 403) {

                    setError(
                        "You do not have permission to edit this interview."
                    );

                } else if (error.response?.status === 404) {

                    setError(
                        "Interview not found."
                    );

                } else {

                    setError(
                        "Failed to load interview."
                    );
                }

            } finally {

                setLoading(false);

            }
        };

        fetchInterview();

    }, [id]);


    /* -------------------------------- */
    /* Handle input changes             */
    /* -------------------------------- */

    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value
        }));

    };


    /* -------------------------------- */
    /* Submit update                    */
    /* -------------------------------- */

    const handleSubmit = async (e) => {

        e.preventDefault();

        setSaving(true);
        setError("");

        try {

            await api.put(
                `/interviews/${id}`,
                form
            );

            console.log(
                "Interview updated successfully"
            );

            navigate(`/interviews/${id}`);

        } catch (error) {

            console.error(
                "Update interview error:",
                error
            );

            if (error.response?.status === 403) {

                setError(
                    "You do not have permission to update this interview."
                );

            } else if (error.response?.status === 404) {

                setError(
                    "Interview not found."
                );

            } else {

                setError(
                    "Failed to update interview. Please try again."
                );

            }

        } finally {

            setSaving(false);

        }
    };


    /* -------------------------------- */
    /* Loading state                    */
    /* -------------------------------- */

    if (loading) {

        return (

            <div style={styles.center}>

                <div style={styles.loadingBox}>
                    Loading interview...
                </div>

            </div>

        );
    }


    /* -------------------------------- */
    /* Failed to load                   */
    /* -------------------------------- */

    if (error && !form.companyName) {

        return (

            <div style={styles.center}>

                <div style={styles.errorCard}>

                    <div style={styles.errorTitle}>
                        Unable to load interview
                    </div>

                    <p style={styles.errorMessage}>
                        {error}
                    </p>

                    <button
                        style={styles.primaryButton}
                        onClick={() =>
                            navigate("/interviews")
                        }
                    >
                        <ArrowLeft size={16} />
                        Back to Interviews
                    </button>

                </div>

            </div>

        );
    }


    return (

        <div style={styles.page}>

            {/* ================================ */}
            {/* Back                            */}
            {/* ================================ */}

            <button
                style={styles.backButton}
                onClick={() =>
                    navigate(`/interviews/${id}`)
                }
            >

                <ArrowLeft size={16} />

                Back to Interview

            </button>


            {/* ================================ */}
            {/* Header                          */}
            {/* ================================ */}

            <div style={styles.header}>

                <div>

                    <h1 style={styles.title}>
                        Edit Interview
                    </h1>

                    <p style={styles.subtitle}>
                        Update your interview information
                        and keep your progress up to date.
                    </p>

                </div>

            </div>


            {/* ================================ */}
            {/* Form                            */}
            {/* ================================ */}

            <form
                onSubmit={handleSubmit}
                style={styles.card}
            >

                {/* Company */}

                <div style={styles.field}>

                    <label style={styles.label}>
                        Company Name
                    </label>

                    <input
                        name="companyName"
                        value={form.companyName}
                        onChange={handleChange}
                        placeholder="e.g. Accenture"
                        required
                        style={styles.input}
                    />

                </div>


                {/* Role */}

                <div style={styles.field}>

                    <label style={styles.label}>
                        Role
                    </label>

                    <input
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        placeholder="e.g. Software Engineer"
                        required
                        style={styles.input}
                    />

                </div>


                {/* Dates */}

                <div style={styles.row}>

                    <div style={styles.field}>

                        <label style={styles.label}>
                            Application Date
                        </label>

                        <input
                            type="date"
                            name="applicationDate"
                            value={form.applicationDate}
                            onChange={handleChange}
                            style={styles.input}
                        />

                    </div>


                    <div style={styles.field}>

                        <label style={styles.label}>
                            Next Round Date
                        </label>

                        <input
                            type="date"
                            name="nextRoundDate"
                            value={form.nextRoundDate}
                            onChange={handleChange}
                            style={styles.input}
                        />

                    </div>

                </div>


                {/* Current Round */}

                <div style={styles.field}>

                    <label style={styles.label}>
                        Current Round
                    </label>

                    <input
                        name="currentRound"
                        value={form.currentRound}
                        onChange={handleChange}
                        placeholder="e.g. Technical Interview"
                        style={styles.input}
                    />

                </div>


                {/* Status */}

                <div style={styles.field}>

                    <label style={styles.label}>
                        Status
                    </label>

                    <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        style={styles.input}
                    >

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

                    </select>

                </div>


                {/* Feedback */}

                <div style={styles.field}>

                    <label style={styles.label}>
                        Overall Feedback
                    </label>

                    <textarea
                        name="overallFeedback"
                        value={form.overallFeedback}
                        onChange={handleChange}
                        placeholder="Add your overall interview feedback..."
                        rows="6"
                        style={styles.textarea}
                    />

                </div>


                {/* Error */}

                {error && (

                    <div style={styles.errorBox}>
                        {error}
                    </div>

                )}


                {/* Actions */}

                <div style={styles.actions}>

                    <button
                        type="button"
                        style={styles.cancelButton}
                        onClick={() =>
                            navigate(`/interviews/${id}`)
                        }
                        disabled={saving}
                    >
                        Cancel
                    </button>


                    <button
                        type="submit"
                        disabled={saving}
                        style={{
                            ...styles.primaryButton,
                            ...(saving
                                ? styles.disabledButton
                                : {})
                        }}
                    >

                        <Save size={16} />

                        {saving
                            ? "Saving..."
                            : "Save Changes"}

                    </button>

                </div>

            </form>

        </div>
    );
}


/* ================================= */
/* Styles                            */
/* ================================= */

const styles = {

    page: {
        minHeight: "100vh",
        padding: "36px 42px",
        background: "#f8f9fc",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#111827",
        boxSizing: "border-box"
    },


    center: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8f9fc",
        fontFamily: "Inter, system-ui, sans-serif"
    },


    loadingBox: {
        color: "#6b7280",
        fontSize: "14px"
    },


    /* =============================== */
    /* Error Card                      */
    /* =============================== */

    errorCard: {
        width: "100%",
        maxWidth: "430px",
        padding: "32px",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        textAlign: "center",
        boxSizing: "border-box",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)"
    },


    errorTitle: {
        fontSize: "20px",
        fontWeight: "700",
        color: "#111827"
    },


    errorMessage: {
        margin: "10px 0 24px",
        color: "#6b7280",
        fontSize: "14px",
        lineHeight: "1.5"
    },


    /* =============================== */
    /* Back                            */
    /* =============================== */

    backButton: {
        display: "flex",
        alignItems: "center",
        gap: "7px",
        border: "none",
        background: "transparent",
        padding: "0",
        marginBottom: "24px",
        color: "#6b7280",
        fontSize: "14px",
        fontWeight: "500",
        cursor: "pointer"
    },


    /* =============================== */
    /* Header                          */
    /* =============================== */

    header: {
        marginBottom: "26px"
    },


    title: {
        margin: "0",
        fontSize: "32px",
        fontWeight: "700",
        letterSpacing: "-0.7px",
        color: "#111827"
    },


    subtitle: {
        margin: "8px 0 0",
        color: "#6b7280",
        fontSize: "15px",
        lineHeight: "1.5"
    },


    /* =============================== */
    /* Card                            */
    /* =============================== */

    card: {
        width: "100%",
        maxWidth: "850px",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "32px",
        boxSizing: "border-box",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.03)"
    },


    /* =============================== */
    /* Fields                          */
    /* =============================== */

    row: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px"
    },


    field: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        marginBottom: "20px"
    },


    label: {
        fontSize: "13px",
        fontWeight: "650",
        color: "#374151"
    },


    input: {
        width: "100%",
        height: "46px",
        boxSizing: "border-box",
        padding: "0 13px",
        border: "1px solid #d1d5db",
        borderRadius: "9px",
        background: "#ffffff",
        color: "#111827",
        fontSize: "14px",
        outline: "none",
        fontFamily: "inherit"
    },


    textarea: {
        width: "100%",
        boxSizing: "border-box",
        padding: "12px 13px",
        border: "1px solid #d1d5db",
        borderRadius: "9px",
        background: "#ffffff",
        color: "#111827",
        fontSize: "14px",
        resize: "vertical",
        fontFamily: "inherit",
        outline: "none",
        lineHeight: "1.5"
    },


    /* =============================== */
    /* Error                           */
    /* =============================== */

    errorBox: {
        padding: "11px 13px",
        marginBottom: "18px",
        borderRadius: "9px",
        background: "#fef2f2",
        border: "1px solid #fecaca",
        color: "#dc2626",
        fontSize: "13px"
    },


    /* =============================== */
    /* Actions                         */
    /* =============================== */

    actions: {
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: "12px",
        marginTop: "10px",
        paddingTop: "22px",
        borderTop: "1px solid #f0f1f4"
    },


    cancelButton: {
        height: "42px",
        padding: "0 18px",
        borderRadius: "9px",
        border: "1px solid #d1d5db",
        background: "#ffffff",
        color: "#374151",
        fontSize: "14px",
        fontWeight: "550",
        cursor: "pointer"
    },


    primaryButton: {
        height: "42px",
        padding: "0 18px",
        borderRadius: "9px",
        border: "none",
        background: "#4f46e5",
        color: "#ffffff",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        boxShadow: "0 5px 12px rgba(79, 70, 229, 0.16)"
    },


    disabledButton: {
        opacity: "0.65",
        cursor: "not-allowed"
    }

};


export default EditInterview;