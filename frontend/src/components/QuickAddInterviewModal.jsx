import { useState } from "react";
import { toast } from "react-hot-toast";
import api from "../api/axios";
import { getApiErrorMessage } from "../api/errorMessage";
import { INTERVIEW_STAGES } from "./interviewStages";

const initialForm = () => ({
    companyName: "",
    role: "",
    applicationDate: new Date().toISOString().slice(0, 10),
    stage: INTERVIEW_STAGES[0].key
});

function QuickAddInterviewModal({ open, onClose, onCreated }) {

    const [form, setForm] = useState(initialForm);
    const [saving, setSaving] = useState(false);

    if (!open) {
        return null;
    }

    const closeModal = () => {
        if (saving) {
            return;
        }

        setForm(initialForm());
        onClose();
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const companyName = form.companyName.trim();
        const role = form.role.trim();

        if (!companyName || !role || !form.applicationDate) {
            toast.error("Add a company, role, and application date.");
            return;
        }

        const stage = INTERVIEW_STAGES.find((item) => item.key === form.stage)
            || INTERVIEW_STAGES[0];

        setSaving(true);

        try {
            const response = await api.post("/interviews", {
                companyName,
                role,
                applicationDate: form.applicationDate,
                currentRound: stage.round,
                nextRoundDate: "",
                overallFeedback: "",
                status: stage.status
            });

            toast.success("Interview added to your tracker.");
            setForm(initialForm());
            onCreated?.(response.data);
            onClose();
        } catch (error) {
            toast.error(getApiErrorMessage(error, "Unable to add this interview."));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            style={styles.overlay}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    closeModal();
                }
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="quick-add-interview-title"
                style={styles.modal}
            >
                <div style={styles.header}>
                    <div>
                        <p style={styles.eyebrow}>QUICK ADD</p>
                        <h2 id="quick-add-interview-title" style={styles.title}>
                            Add an interview
                        </h2>
                        <p style={styles.subtitle}>
                            Capture the essentials now. Add notes and questions later.
                        </p>
                    </div>

                    <button
                        type="button"
                        aria-label="Close quick add"
                        style={styles.closeButton}
                        onClick={closeModal}
                        disabled={saving}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={styles.fields}>
                        <label style={styles.label}>
                            Company
                            <input
                                autoFocus
                                name="companyName"
                                value={form.companyName}
                                onChange={handleChange}
                                placeholder="e.g. Atlassian"
                                style={styles.input}
                                disabled={saving}
                                required
                            />
                        </label>

                        <label style={styles.label}>
                            Role
                            <input
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                                placeholder="e.g. Frontend Engineer"
                                style={styles.input}
                                disabled={saving}
                                required
                            />
                        </label>

                        <div style={styles.row}>
                            <label style={{ ...styles.label, flex: 1 }}>
                                Applied on
                                <input
                                    type="date"
                                    name="applicationDate"
                                    value={form.applicationDate}
                                    onChange={handleChange}
                                    style={styles.input}
                                    disabled={saving}
                                    required
                                />
                            </label>

                            <label style={{ ...styles.label, flex: 1 }}>
                                Current stage
                                <select
                                    name="stage"
                                    value={form.stage}
                                    onChange={handleChange}
                                    style={styles.input}
                                    disabled={saving}
                                >
                                    {INTERVIEW_STAGES.map((stage) => (
                                        <option key={stage.key} value={stage.key}>
                                            {stage.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </div>

                    <div style={styles.actions}>
                        <button
                            type="button"
                            style={styles.cancelButton}
                            onClick={closeModal}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={styles.submitButton}
                            disabled={saving}
                        >
                            {saving ? "Adding…" : "Add interview"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}

const styles = {
    overlay: {
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: "rgba(15, 23, 42, 0.42)"
    },
    modal: {
        width: "min(100%, 520px)",
        maxHeight: "calc(100vh - 40px)",
        overflowY: "auto",
        background: "#ffffff",
        borderRadius: "20px",
        padding: "26px",
        boxShadow: "0 24px 70px rgba(15, 23, 42, 0.2)"
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        gap: "16px",
        marginBottom: "24px"
    },
    eyebrow: {
        margin: 0,
        color: "#4f46e5",
        fontSize: "11px",
        fontWeight: "800",
        letterSpacing: "0.14em"
    },
    title: {
        margin: "8px 0 6px",
        color: "#111827",
        fontSize: "24px",
        lineHeight: 1.15
    },
    subtitle: {
        margin: 0,
        color: "#6b7280",
        fontSize: "13px",
        lineHeight: 1.5
    },
    closeButton: {
        width: "34px",
        height: "34px",
        flexShrink: 0,
        border: "none",
        borderRadius: "10px",
        background: "#f3f4f6",
        color: "#6b7280",
        fontSize: "24px",
        lineHeight: 1,
        cursor: "pointer"
    },
    fields: {
        display: "flex",
        flexDirection: "column",
        gap: "16px"
    },
    row: {
        display: "flex",
        gap: "12px"
    },
    label: {
        display: "flex",
        flexDirection: "column",
        gap: "7px",
        color: "#374151",
        fontSize: "13px",
        fontWeight: "700"
    },
    input: {
        width: "100%",
        minHeight: "44px",
        boxSizing: "border-box",
        border: "1px solid #d1d5db",
        borderRadius: "10px",
        padding: "0 12px",
        background: "#ffffff",
        color: "#111827",
        fontSize: "14px",
        outline: "none"
    },
    actions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        marginTop: "26px"
    },
    cancelButton: {
        minHeight: "44px",
        border: "1px solid #d1d5db",
        borderRadius: "10px",
        padding: "0 16px",
        background: "#ffffff",
        color: "#374151",
        fontWeight: "700",
        cursor: "pointer"
    },
    submitButton: {
        minHeight: "44px",
        border: "none",
        borderRadius: "10px",
        padding: "0 18px",
        background: "#4f46e5",
        color: "#ffffff",
        fontWeight: "700",
        cursor: "pointer"
    }
};

export default QuickAddInterviewModal;
