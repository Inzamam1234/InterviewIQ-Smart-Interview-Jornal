export const INTERVIEW_STAGES = [
    { key: "APPLIED", label: "Applied", status: "APPLIED", round: "Application" },
    { key: "SCREENING", label: "Screening", status: "IN_PROGRESS", round: "Screening" },
    { key: "TECHNICAL", label: "Technical", status: "IN_PROGRESS", round: "Technical" },
    { key: "HR", label: "HR", status: "IN_PROGRESS", round: "HR" },
    { key: "OFFER", label: "Offer", status: "SELECTED", round: "Offer" }
];

export function getInterviewStageIndex(interview) {
    if (interview?.status === "SELECTED") {
        return INTERVIEW_STAGES.length - 1;
    }

    const currentRound = interview?.currentRound?.toLowerCase() || "";
    const matchingIndex = INTERVIEW_STAGES.findIndex((stage) =>
        currentRound.includes(stage.round.toLowerCase())
    );

    if (matchingIndex >= 0) {
        return matchingIndex;
    }

    if (interview?.status === "IN_PROGRESS") {
        return 1;
    }

    return 0;
}
