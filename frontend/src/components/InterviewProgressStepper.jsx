import { useState } from "react";
import { toast } from "react-hot-toast";
import api from "../api/axios";
import { getApiErrorMessage } from "../api/errorMessage";
import { getInterviewStageIndex, INTERVIEW_STAGES } from "./interviewStages";

function InterviewProgressStepper({ interview, onUpdated, compact = false }) {

    const [updating, setUpdating] = useState(false);
    const activeIndex = getInterviewStageIndex(interview);
    const terminalStatus = interview?.status === "REJECTED"
        ? "Rejected"
        : interview?.status === "ON_HOLD"
            ? "On hold"
            : "";

    const updateStage = async (stage) => {
        if (updating || stage.key === INTERVIEW_STAGES[activeIndex].key) {
            return;
        }

        setUpdating(true);

        try {
            const response = await api.put(`/interviews/${interview.id}`, {
                companyName: interview.companyName,
                role: interview.role,
                applicationDate: interview.applicationDate || "",
                currentRound: stage.round,
                nextRoundDate: interview.nextRoundDate || "",
                overallFeedback: interview.overallFeedback || "",
                status: stage.status
            });

            const updatedInterview = response.data || {
                ...interview,
                currentRound: stage.round,
                status: stage.status
            };

            onUpdated?.(updatedInterview);
            toast.success(`Progress updated to ${stage.label}.`);
        } catch (error) {
            toast.error(getApiErrorMessage(error, "Unable to update interview progress."));
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div
            style={{
                ...styles.wrapper,
                ...(compact ? styles.compactWrapper : {})
            }}
            aria-label={`Interview progress for ${interview?.companyName || "this interview"}`}
        >
            <div style={styles.steps}>
                {INTERVIEW_STAGES.map((stage, index) => {
                    const isActive = index === activeIndex;
                    const isComplete = index < activeIndex;

                    return (
                        <div key={stage.key} style={styles.stepGroup}>
                            <button
                                type="button"
                                title={`Move to ${stage.label}`}
                                aria-label={`Move interview to ${stage.label}`}
                                aria-current={isActive ? "step" : undefined}
                                disabled={updating}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    updateStage(stage);
                                }}
                                style={{
                                    ...styles.stepButton,
                                    ...(isActive ? styles.activeStep : {}),
                                    ...(isComplete ? styles.completeStep : {}),
                                    ...(compact ? styles.compactStep : {})
                                }}
                            >
                                <span style={styles.stepDot}>
                                    {isComplete ? "✓" : index + 1}
                                </span>
                                <span>{stage.label}</span>
                            </button>

                            {index < INTERVIEW_STAGES.length - 1 && (
                                <span
                                    style={{
                                        ...styles.connector,
                                        ...(index < activeIndex ? styles.completeConnector : {})
                                    }}
                                    aria-hidden="true"
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {terminalStatus && (
                <span style={styles.terminalStatus}>
                    {terminalStatus} · choose a stage to resume
                </span>
            )}
        </div>
    );
}

const styles = {
    wrapper: {
        width: "100%",
        overflowX: "auto",
        paddingTop: "14px",
        paddingBottom: "12px"
    },
    compactWrapper: {
        paddingTop: "10px"
    },
    steps: {
        display: "flex",
        alignItems: "center",
        minWidth: "520px",
        paddingBottom: "4px"
    },
    stepGroup: {
        display: "flex",
        alignItems: "center",
        flex: 1
    },
    stepButton: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        border: "none",
        borderRadius: "999px",
        padding: "5px 8px 5px 5px",
        background: "transparent",
        color: "#6b7280",
        fontSize: "11px",
        fontWeight: "700",
        whiteSpace: "nowrap",
        cursor: "pointer"
    },
    compactStep: {
        fontSize: "10px",
        paddingRight: "5px"
    },
    activeStep: {
        background: "#eef2ff",
        color: "#4338ca"
    },
    completeStep: {
        color: "#047857"
    },
    stepDot: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "22px",
        height: "22px",
        borderRadius: "50%",
        background: "#e5e7eb",
        color: "#6b7280",
        fontSize: "10px",
        fontWeight: "800"
    },
    connector: {
        height: "2px",
        flex: 1,
        minWidth: "10px",
        background: "#e5e7eb"
    },
    completeConnector: {
        background: "#a7f3d0"
    },
    terminalStatus: {
        display: "inline-block",
        marginTop: "8px",
        color: "#b45309",
        fontSize: "11px",
        fontWeight: "600"
    }
};

export default InterviewProgressStepper;
