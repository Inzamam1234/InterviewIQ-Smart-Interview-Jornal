export function getApiErrorMessage(error, fallback = "Something went wrong. Please try again.") {
    const status = error?.response?.status;
    const responseMessage = error?.response?.data?.message;

    if (status === 401) {
        return "Your session has expired. Please sign in again.";
    }

    if (status === 403) {
        return "You do not have permission to perform this action.";
    }

    if (status === 404) {
        return "The requested item could not be found.";
    }

    if (status === 409 && responseMessage) {
        return responseMessage;
    }

    if (error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT" || !error?.response) {
        return "The server may be waking up. Please wait a moment and try again.";
    }

    if (status >= 500) {
        return "The server is temporarily unavailable. Please try again shortly.";
    }

    if (typeof responseMessage === "string" && responseMessage.trim()) {
        return responseMessage;
    }

    return fallback;
}
